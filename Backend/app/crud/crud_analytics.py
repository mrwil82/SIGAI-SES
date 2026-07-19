from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from urllib.parse import quote
from app.models import Item, Activo, Garantia, StockBulk, Cliente, Proyecto, Usuario
from app.core.logger import get_logger

logger = get_logger(__name__)

async def get_dashboard_stats(db: AsyncSession):
    
    # Conteo total de activos por estado
    
    res_status = await db.execute(
        select(Activo.estado_actual, func.count(Activo.id_activo))
        .group_by(Activo.estado_actual)
    )
    activos_status = {row[0]: row[1] for row in res_status.all()}
    
    # Garantías críticas (más de 15 días abiertas)
    
    fecha_limite = datetime.now() - timedelta(days=15)
    res_gar = await db.execute(
        select(func.count(Garantia.id_garantia))
        .where(Garantia.estado_proceso != 'ENTREGADO AL CLIENTE')
        .where(Garantia.fecha_envio <= fecha_limite.date())
    )
    garantias_criticas = res_gar.scalar() or 0

    # Items con stock bajo el mínimo real
    
    res_stock = await db.execute(
        select(func.count(Item.id_item))
        .join(StockBulk, Item.id_item == StockBulk.id_item)
        .where(StockBulk.cantidad_actual <= Item.stock_minimo)
    )
    stock_bajo = res_stock.scalar() or 0

    return {
        "activos_por_estado": activos_status,
        "garantias_criticas": garantias_criticas,
        "items_stock_bajo": stock_bajo
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
        results.append({
            "type": "Activo",
            "title": str(getattr(a, "serial")),
            "subtitle": f"Estado: {getattr(a, 'estado_actual')}",
            "link": f"/inventory?serial={quote(str(getattr(a, 'serial')), safe='')}",
            "id": getattr(a, "id_activo")
        })

    # 2. Buscar en Items (Nombre/Referencia)
    res_items = await db.execute(
        select(Item).where(
            Item.deleted_at.is_(None),
            or_(
                Item.nombre_equipo.ilike(search_term),
                Item.referencia.ilike(search_term),
                Item.codigo_item_interno.ilike(search_term)
            )
        ).limit(5)
    )
    for i in res_items.scalars().all():
        search_value = getattr(i, "nombre_equipo") or getattr(i, "referencia") or getattr(i, "codigo_item_interno") or ""
        results.append({
            "type": "Ítem",
            "title": str(getattr(i, "nombre_equipo")),
            "subtitle": f"Ref: {getattr(i, 'referencia') or 'N/A'}",
            "link": f"/inventory?search={quote(str(search_value), safe='')}",
            "id": getattr(i, "id_item")
        })

    # 3. Buscar en Clientes
    res_clientes = await db.execute(
        select(Cliente).where(
            Cliente.nombre.ilike(search_term),
            Cliente.deleted_at.is_(None)
        ).limit(3)
    )
    for c in res_clientes.scalars().all():
        results.append({
            "type": "Cliente",
            "title": str(getattr(c, "nombre")),
            "subtitle": f"NIT: {getattr(c, 'nit')}",
            "link": "/clients",
            "id": getattr(c, "id_cliente")
        })

    # 4. Buscar en Usuarios
    res_users = await db.execute(
        select(Usuario).where(Usuario.nombre.ilike(search_term)).limit(3)
    )
    for u in res_users.scalars().all():
        results.append({
            "type": "Usuario",
            "title": str(getattr(u, "nombre")),
            "subtitle": str(getattr(u, "rol")),
            "link": "/users",
            "id": getattr(u, "id_usuario")
        })

    return results
