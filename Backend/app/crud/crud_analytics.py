from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from urllib.parse import quote
from app.models import (
    Item,
    Activo,
    Garantia,
    StockBulk,
    Cliente,
    Proyecto,
    Usuario,
    MovimientoInventario,
)
from app.core.logger import get_logger

logger = get_logger(__name__)


async def get_dashboard_stats(db: AsyncSession, time_range: str = "hoy"):

    now = datetime.now()
    if time_range == "hoy":
        threshold = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "semana":
        threshold = now - timedelta(days=7)
    elif time_range == "mes":
        threshold = now - timedelta(days=30)
    else:
        threshold = now - timedelta(days=365)

    # Activos con actividad en el período (filtrados por updated_at)

    res_status = await db.execute(
        select(Activo.estado_actual, func.count(Activo.id_activo))
        .where(Activo.updated_at >= threshold)
        .group_by(Activo.estado_actual)
    )
    activos_status = {row[0]: row[1] for row in res_status.all()}

    # Nuevos ingresos a laboratorio en el período

    res_nuevos = await db.execute(
        select(func.count(Activo.id_activo)).where(
            Activo.fecha_ingreso_laboratorio >= threshold
        )
    )
    nuevos_ingresos = res_nuevos.scalar() or 0

    # Movimientos de inventario en el período

    res_mov = await db.execute(
        select(func.count(MovimientoInventario.id_movimiento)).where(
            MovimientoInventario.fecha_movimiento >= threshold
        )
    )
    movimientos_periodo = res_mov.scalar() or 0

    # Garantías críticas (más de 15 días abiertas)

    fecha_limite = datetime.now() - timedelta(days=15)
    res_gar = await db.execute(
        select(func.count(Garantia.id_garantia))
        .where(Garantia.estado_proceso != "ENTREGADO_CLIENTE")
        .where(Garantia.fecha_envio <= fecha_limite.date())
    )
    garantias_criticas = res_gar.scalar() or 0

    # Items con stock bajo el mínimo real

    res_stock = await db.execute(
        select(func.count(Item.id_item))
        .join(StockBulk, Item.id_item == StockBulk.id_item)
        .where(StockBulk.cantidad_actual <= Item.stock_minimo)
        .where(Item.deleted_at.is_(None))
    )
    stock_bajo = res_stock.scalar() or 0

    # Total de items activos en catálogo
    res_total_items = await db.execute(
        select(func.count(Item.id_item)).where(Item.deleted_at.is_(None))
    )
    total_items = res_total_items.scalar() or 0

    # Items por categoría
    res_items_cat = await db.execute(
        select(Item.categoria, func.count(Item.id_item))
        .where(Item.deleted_at.is_(None))
        .group_by(Item.categoria)
    )
    items_por_categoria = {row[0]: row[1] for row in res_items_cat.all()}

    return {
        "activos_por_estado": activos_status,
        "nuevos_ingresos": nuevos_ingresos,
        "movimientos_periodo": movimientos_periodo,
        "garantias_criticas": garantias_criticas,
        "items_stock_bajo": stock_bajo,
        "total_items": total_items,
        "items_por_categoria": items_por_categoria,
    }


async def global_search(db: AsyncSession, query: str) -> List[Dict[str, Any]]:
    """Búsqueda rápida en múltiples tablas."""
    if not query or len(query) < 2:
        return []

    search_term = f"%{query}%"
    results = []

    # 1. Buscar en Activos (Seriales)
    res_activos = await db.execute(
        select(Activo).where(Activo.serial.ilike(search_term)).limit(5)
    )
    for a in res_activos.scalars().all():
        results.append(
            {
                "type": "Activo",
                "title": str(getattr(a, "serial")),
                "subtitle": f"Estado: {getattr(a, 'estado_actual')}",
                "link": f"/inventory?serial={quote(str(getattr(a, 'serial')), safe='')}",
                "id": getattr(a, "id_activo"),
            }
        )

    # 2. Buscar en Items (Nombre/Referencia)
    res_items = await db.execute(
        select(Item)
        .where(
            Item.deleted_at.is_(None),
            or_(
                Item.nombre_equipo.ilike(search_term),
                Item.referencia.ilike(search_term),
                Item.codigo_item_interno.ilike(search_term),
            ),
        )
        .limit(5)
    )
    for i in res_items.scalars().all():
        search_value = (
            getattr(i, "nombre_equipo")
            or getattr(i, "referencia")
            or getattr(i, "codigo_item_interno")
            or ""
        )
        results.append(
            {
                "type": "Ítem",
                "title": str(getattr(i, "nombre_equipo")),
                "subtitle": f"Ref: {getattr(i, 'referencia') or 'N/A'}",
                "link": f"/inventory?search={quote(str(search_value), safe='')}",
                "id": getattr(i, "id_item"),
            }
        )

    # 3. Buscar en Clientes
    res_clientes = await db.execute(
        select(Cliente)
        .where(Cliente.nombre.ilike(search_term), Cliente.deleted_at.is_(None))
        .limit(3)
    )
    for c in res_clientes.scalars().all():
        results.append(
            {
                "type": "Cliente",
                "title": str(getattr(c, "nombre")),
                "subtitle": f"NIT: {getattr(c, 'nit')}",
                "link": "/clients",
                "id": getattr(c, "id_cliente"),
            }
        )

    # 4. Buscar en Usuarios
    res_users = await db.execute(
        select(Usuario).where(Usuario.nombre.ilike(search_term)).limit(3)
    )
    for u in res_users.scalars().all():
        results.append(
            {
                "type": "Usuario",
                "title": str(getattr(u, "nombre")),
                "subtitle": str(getattr(u, "rol")),
                "link": "/users",
                "id": getattr(u, "id_usuario"),
            }
        )

    return results


async def get_predictions(db: AsyncSession) -> Dict[str, Any]:
    """Análisis predictivo basado en estadística (sin APIs externas).

    Calcula:
    1. Agotamiento de stock: promedio de salidas de los últimos 30 días
       por ítem -> días restantes estimados.
    2. Vencimiento de garantías: garantías abiertas que vencen en los
       próximos 30/60/90 días.
    3. Tendencia de consumo: regresión lineal simple sobre las salidas
       semanales de los últimos 8 semanas.
    """
    now = datetime.now()
    since_30d = now - timedelta(days=30)
    since_8w = now - timedelta(days=56)

    # ------------------------------------------------------------------
    # 1. Agotamiento de stock (salidas por ítem, últimos 30 días)
    # ------------------------------------------------------------------
    res_salidas = await db.execute(
        select(
            MovimientoInventario.id_item,
            func.coalesce(func.sum(MovimientoInventario.cantidad), 0),
        )
        .where(
            MovimientoInventario.tipo_movimiento.in_(
                [
                    "SALIDA_INSTALACION",
                    "BAJA_DAÑO",
                    "TRASLADO",
                    "DEVOLUCION",
                    "AJUSTE",
                ]
            ),
            MovimientoInventario.fecha_movimiento >= since_30d,
        )
        .group_by(MovimientoInventario.id_item)
    )
    salidas_map = {row[0]: float(row[1]) for row in res_salidas.all()}

    stock_depletion: List[Dict[str, Any]] = []
    if salidas_map:
        res_stock = await db.execute(
            select(Item, StockBulk)
            .join(StockBulk, Item.id_item == StockBulk.id_item)
            .where(
                Item.deleted_at.is_(None),
                Item.id_item.in_(list(salidas_map.keys())),
            )
        )
        for item, stock in res_stock.all():
            cantidad = float(stock.cantidad_actual or 0)
            salidas_30d = salidas_map.get(item.id_item, 0)
            if cantidad <= 0 or salidas_30d <= 0:
                continue
            promedio_diario = salidas_30d / 30.0
            dias_restantes = int(cantidad / promedio_diario)
            stock_depletion.append(
                {
                    "id_item": item.id_item,
                    "nombre": item.nombre_equipo,
                    "categoria": item.categoria,
                    "stock_actual": cantidad,
                    "stock_minimo": item.stock_minimo or 0,
                    "salidas_30d": salidas_30d,
                    "dias_restantes": dias_restantes,
                    "nivel": (
                        "critico"
                        if dias_restantes <= 7
                        else "atencion" if dias_restantes <= 30 else "ok"
                    ),
                }
            )
        stock_depletion.sort(key=lambda x: x["dias_restantes"])
        stock_depletion = stock_depletion[:5]

    # ------------------------------------------------------------------
    # 2. Garantías por vencer (próximos 30/60/90 días)
    # ------------------------------------------------------------------
    garantias_proximas: List[Dict[str, Any]] = []
    res_gar = await db.execute(
        select(Garantia, Activo)
        .join(Activo, Activo.id_activo == Garantia.id_activo)
        .where(Garantia.estado_proceso != "ENTREGADO_CLIENTE")
        .where(
            or_(
                Garantia.fecha_limite_estimada.is_not(None),
                Garantia.fecha_inicio_garantia.is_not(None),
            )
        )
        .limit(100)
    )
    for garantia, activo in res_gar.all():
        vencimiento = garantia.fecha_limite_estimada
        if vencimiento is None and garantia.fecha_inicio_garantia and garantia.meses_garantia:
            vencimiento = garantia.fecha_inicio_garantia + timedelta(
                days=30 * garantia.meses_garantia
            )
        if vencimiento is None:
            continue
        if isinstance(vencimiento, datetime):
            vencimiento = vencimiento.date()
        dias = (vencimiento - now.date()).days
        if dias < 0 or dias > 90:
            continue
        garantias_proximas.append(
            {
                "id_garantia": garantia.id_garantia,
                "serial": activo.serial,
                "fecha_vencimiento": vencimiento.isoformat(),
                "dias_restantes": dias,
                "estado_proceso": garantia.estado_proceso,
                "rango": "30" if dias <= 30 else "60" if dias <= 60 else "90",
            }
        )
    garantias_proximas.sort(key=lambda x: x["dias_restantes"])
    garantias_proximas = garantias_proximas[:5]

    # ------------------------------------------------------------------
    # 3. Tendencia de consumo (regresión lineal simple, numpy)
    # ------------------------------------------------------------------
    tendencia: Dict[str, Any] = {
        "pendiente": 0.0,
        "direccion": "estable",
        "mensaje": "No hay suficiente historial de movimientos para calcular la tendencia.",
        "semanas": [],
    }
    res_sem = await db.execute(
        select(
            func.date_format(MovimientoInventario.fecha_movimiento, "%Y-%u"),
            func.sum(MovimientoInventario.cantidad),
        )
        .where(
            MovimientoInventario.fecha_movimiento >= since_8w,
            MovimientoInventario.tipo_movimiento.in_(
                ["SALIDA_INSTALACION", "BAJA_DAÑO", "TRASLADO"]
            ),
        )
        .group_by(func.date_format(MovimientoInventario.fecha_movimiento, "%Y-%u"))
        .order_by(func.date_format(MovimientoInventario.fecha_movimiento, "%Y-%u"))
    )
    semanas = [(row[0], float(row[1])) for row in res_sem.all()]
    if semanas:
        try:
            import numpy as np

            xs = np.arange(len(semanas), dtype=float)
            ys = np.array([s[1] for s in semanas], dtype=float)
            pendiente = float(np.polyfit(xs, ys, 1)[0])
            direccion = (
                "creciente" if pendiente > 0.5 else "decreciente" if pendiente < -0.5 else "estable"
            )
            mensajes = {
                "creciente": "El consumo está aumentando: revisa los niveles de stock pronto.",
                "decreciente": "El consumo está bajando: el inventario actual durará más de lo estimado.",
                "estable": "El consumo se mantiene estable en las últimas semanas.",
            }
            tendencia = {
                "pendiente": round(pendiente, 2),
                "direccion": direccion,
                "mensaje": mensajes[direccion],
                "semanas": semanas,
            }
        except Exception as e:  # pragma: no cover
            logger.error(f"Error calculando tendencia: {e}", exc_info=True)

    return {
        "stock_depletion": stock_depletion,
        "garantias_proximas": garantias_proximas,
        "tendencia_consumo": tendencia,
        "generado_en": now.isoformat(),
    }
