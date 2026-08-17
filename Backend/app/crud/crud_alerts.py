from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from app.models import Alert, Item, StockBulk
from app.models.inventory import MovimientoInventario
from datetime import datetime
from app.crud.crud_audit import create_audit_log
from app.core.logger import get_logger

logger = get_logger(__name__)

# evaluar_alertas


async def delete_alert(db: AsyncSession, alert_id: int, current_user_id: int):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alerta = result.scalars().first()
    if alerta:
        try:
            await db.delete(alerta)
            await db.commit()
            await create_audit_log(db, current_user_id, "alertas", "DELETE", alert_id)
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting alert {alert_id}: {e}", exc_info=True)
            raise
    return alerta


async def create_alert(
    db: AsyncSession,
    alerta_in: Any,
    current_user_id: int,
    item_id: Optional[int] = None,
):
    try:
        db_alerta = Alert(
            titulo=alerta_in.titulo,
            descripcion=alerta_in.notas,
            tipo="manual",
            prioridad=alerta_in.prioridad or "media",
            estado="activa",
            item_id=item_id or 1,
        )
        db.add(db_alerta)
        await db.commit()
        await db.refresh(db_alerta)
        await create_audit_log(
            db,
            current_user_id,
            "alertas",
            "CREATE",
            getattr(db_alerta, "id"),
            nuevo=alerta_in.model_dump(),
        )
        return db_alerta
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating alert: {e}", exc_info=True)
        raise


async def update_alert_status(
    db: AsyncSession,
    alert_id: int,
    estado: str,
    notas: str,
    current_user_id: int,
    valor_actual: Optional[float] = None,
    solucion: Optional[str] = None,
    asignado_a: Optional[int] = None,
    precio_unitario: Optional[float] = None,
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alerta = result.scalars().first()
    if alerta:
        old_estado = getattr(alerta, "estado")
        changes = {}
        # Estado y notas/descripcion
        if estado is not None:
            setattr(alerta, "estado", estado)
            changes["estado"] = estado
        if notas is not None:
            setattr(alerta, "descripcion", notas)
            changes["notas"] = notas
        # Valor actual (cantidad) - útil para alertas de stock.
        # Si es una alerta de stock bajo, actualiza el stock REAL del inventario
        # (StockBulk) para que el módulo de inventario refleje el cambio.
        if valor_actual is not None:
            try:
                valor = float(valor_actual)
                setattr(alerta, "valor_actual", valor)
                changes["valor_actual"] = valor
                if alerta.item_id and alerta.tipo == "stock_bajo":
                    stock_res = await db.execute(
                        select(StockBulk).where(StockBulk.id_item == alerta.item_id)
                    )
                    db_stock = stock_res.scalars().first()
                    if db_stock:
                        anterior = float(db_stock.cantidad_actual or 0)
                        setattr(db_stock, "cantidad_actual", valor)
                        changes["stock_real_actualizado"] = valor
                        if valor != anterior:
                            db.add(
                                MovimientoInventario(
                                    id_usuario=current_user_id,
                                    id_item=alerta.item_id,
                                    tipo_movimiento="AJUSTE",
                                    cantidad=abs(valor - anterior),
                                    origen="REGISTRO DESDE ALERTA",
                                    destino="STOCK",
                                    notes=f"Ajuste de stock desde alerta #{alert_id}: {anterior} -> {valor}",
                                )
                            )
            except Exception:
                pass
        # Solución textual (para garantías u otras acciones)
        if solucion is not None:
            setattr(alerta, "solucion", solucion)
            changes["solucion"] = solucion
        # Precio unitario: actualiza el costo unitario real del item en inventario
        if precio_unitario is not None:
            try:
                precio = float(precio_unitario)
                item_res = await db.execute(
                    select(Item).where(Item.id_item == alerta.item_id)
                )
                db_item = item_res.scalars().first()
                if db_item:
                    setattr(db_item, "costo_unitario", precio)
                    changes["precio_unitario_actualizado"] = precio
            except Exception:
                pass
        # Asignado a
        if asignado_a is not None:
            setattr(alerta, "asignado_a", asignado_a)
            changes["asignado_a"] = asignado_a

        setattr(alerta, "updated_at", datetime.now())
        if estado in ["resuelta", "ignorada"]:
            setattr(alerta, "resolved_at", datetime.now())
            changes["resolved_at"] = datetime.now().isoformat()

        # Auto-resolver la alerta si el stock real quedó sobre el umbral mínimo
        if (
            alerta.tipo == "stock_bajo"
            and alerta.valor_actual is not None
            and alerta.valor_umbral is not None
            and float(alerta.valor_actual) >= float(alerta.valor_umbral)
            and alerta.estado in ("activa", "reconocida")
        ):
            setattr(alerta, "estado", "resuelta")
            setattr(alerta, "resolved_at", datetime.now())
            if not getattr(alerta, "solucion", None):
                setattr(
                    alerta,
                    "solucion",
                    f"Stock actualizado a {alerta.valor_actual} (mínimo {alerta.valor_umbral})",
                )
            changes["estado"] = "resuelta"
            changes["resolved_at"] = datetime.now().isoformat()

        try:
            await db.commit()
            await create_audit_log(
                db,
                current_user_id,
                "alertas",
                "UPDATE",
                alert_id,
                anterior={"estado": old_estado},
                nuevo=changes,
            )
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating alert status {alert_id}: {e}", exc_info=True)
            raise
    return alerta


async def evaluar_alertas(db: AsyncSession):
    """Motor de reglas para inventario y garantías."""

    try:
        from datetime import timedelta

        # 1. Regla: Stock Bajo
        # Nota: se excluyen items eliminados (soft delete) para no generar alertas de equipos retirados

        items = await db.execute(
            select(Item, StockBulk.cantidad_actual)
            .join(StockBulk)
            .where(Item.deleted_at.is_(None))
            .where(StockBulk.cantidad_actual <= Item.stock_minimo)
        )
        for item, actual in items.all():
            existe = await db.execute(
                select(Alert).where(
                    and_(
                        Alert.item_id == item.id_item,
                        Alert.tipo == "stock_bajo",
                        Alert.estado.in_(["activa", "reconocida"]),
                    )
                )
            )
            if not existe.scalars().first():
                # No recrear la alerta si ya fue resuelta recientemente (cooldown 24h),
                # evitando que el scheduler la vuelva a generar de inmediato
                ultima_resuelta = await db.execute(
                    select(Alert)
                    .where(
                        and_(
                            Alert.item_id == item.id_item,
                            Alert.tipo == "stock_bajo",
                            Alert.estado.in_(["resuelta", "ignorada"]),
                            Alert.resolved_at.isnot(None),
                        )
                    )
                    .order_by(Alert.resolved_at.desc())
                    .limit(1)
                )
                ultima = ultima_resuelta.scalars().first()
                if ultima and datetime.now() - ultima.resolved_at < timedelta(hours=24):
                    continue
                db.add(
                    Alert(
                        tipo="stock_bajo",
                        prioridad="critica",
                        titulo=f"Stock crítico: {item.nombre_equipo}",
                        descripcion=f"Cantidad {actual} menor al mínimo {item.stock_minimo}",
                        item_id=item.id_item,
                        item_nombre=item.nombre_equipo,
                        valor_actual=float(actual),
                        valor_umbral=float(item.stock_minimo),
                    )
                )

        # 1b. Auto-resolver alertas de stock cuando el stock se restablece

        items_ok = await db.execute(
            select(Item, StockBulk.cantidad_actual)
            .join(StockBulk)
            .where(Item.deleted_at.is_(None))
            .where(StockBulk.cantidad_actual > Item.stock_minimo)
        )
        for item, _actual in items_ok.all():
            abiertas = await db.execute(
                select(Alert).where(
                    and_(
                        Alert.item_id == item.id_item,
                        Alert.tipo == "stock_bajo",
                        Alert.estado.in_(["activa", "reconocida"]),
                    )
                )
            )
            for alerta in abiertas.scalars().all():
                setattr(alerta, "estado", "resuelta")
                setattr(alerta, "resolved_at", datetime.now())
                setattr(alerta, "solucion", "Stock restablecido automáticamente")

        # 2. Regla: Garantías Estancadas Más de 15 días
        from app.models.guarantees import Garantia

        fecha_limite = datetime.now() - timedelta(days=15)

        garantias = await db.execute(
            select(Garantia)
            .where(Garantia.estado_proceso == "ENVIADO_PROVEEDOR")
            .where(Garantia.fecha_envio <= fecha_limite.date())
        )
        for gar in garantias.scalars().all():
            existe_gar = await db.execute(
                select(Alert).where(
                    and_(
                        Alert.titulo.like(f"%{gar.numero_caso_interno}%"),
                        Alert.tipo == "garantia_vencida",
                        Alert.estado.in_(["activa", "reconocida"]),
                    )
                )
            )
            if not existe_gar.scalars().first():
                db.add(
                    Alert(
                        tipo="garantia_vencida",
                        prioridad="alta",
                        titulo=f"Garantía estancada: {gar.numero_caso_interno}",
                        descripcion=f"El caso {gar.numero_caso_interno} lleva más de 15 días sin actualización.",
                        item_id=gar.id_activo,
                        item_nombre=f"Activo ID: {gar.id_activo}",
                    )
                )

        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Error evaluating alerts: {e}", exc_info=True)
        raise


# Obtener todas las alertas


async def get_all_alerts(db: AsyncSession, estado=None, prioridad=None, tipo=None):
    query = select(Alert)
    if estado:
        query = query.where(Alert.estado == estado)
    if prioridad:
        query = query.where(Alert.prioridad == prioridad)
    if tipo:
        query = query.where(Alert.tipo == tipo)
    query = query.order_by(Alert.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()
