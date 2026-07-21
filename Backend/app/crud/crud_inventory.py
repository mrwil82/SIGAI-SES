from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import joinedload
from datetime import datetime
from app.models.inventory import Item, Activo, StockBulk, EPPAssignacion, HistorialUbicacion
from app.schemas.inventory import ItemCreate, ItemUpdate, ActivoCreate, ActivoUpdate, EPPAssignacionCreate
from app.crud.crud_audit import create_audit_log
from app.core.logger import get_logger

logger = get_logger(__name__)


def _none_if_empty(val):
    return val.strip() if val and val.strip() else None


# ITEMS
async def get_item_by_id(db: AsyncSession, item_id: int):
    result = await db.execute(
        select(Item)
        .options(joinedload(Item.stock_bulk))
        .filter(Item.id_item == item_id)
    )
    return result.scalars().first()

async def get_items(db: AsyncSession, skip: int = 0, limit: int = 100, search: Optional[str] = None, include_deleted: bool = False):
    query = select(Item)
    if not include_deleted:
        query = query.filter(Item.deleted_at.is_(None))
    
    if search:
        search_text = search.strip()
        if search_text:
            search_filter = f"%{search_text}%"
            query = query.filter(
                (Item.nombre_equipo.ilike(search_filter)) |
                (Item.referencia.ilike(search_filter)) |
                (Item.marca.ilike(search_filter)) |
                (Item.codigo_item_interno.ilike(search_filter)) |
                (Item.categoria.ilike(search_filter)) |
                (Item.sub_categoria.ilike(search_filter))
            )
    
    # Conteo de total con filtros aplicados
    
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    # Ordenamiento alfabético y paginación
    
    result = await db.execute(
        query
        .options(joinedload(Item.stock_bulk))
        .order_by(Item.nombre_equipo.asc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def create_item(db: AsyncSession, item: ItemCreate, current_user_id: int):
    from app.models.inventory import MovimientoInventario
    from sqlalchemy import or_

    logger.info("Creando/actualizando item", extra={"item_nombre": item.nombre_equipo, "user_id": current_user_id})

    ref = _none_if_empty(item.referencia)
    cod = _none_if_empty(item.codigo_item_interno)

    is_new = False
    db_item = None

    if ref or cod:
        conditions = []
        if ref:
            conditions.append(Item.referencia == ref)
        if cod:
            conditions.append(Item.codigo_item_interno == cod)

        result = await db.execute(
            select(Item).filter(or_(*conditions))
        )
        db_item = result.scalars().first()

    cantidad_inicial = float(item.cantidad_inicial or 0)

    if db_item:
        update_data = item.model_dump(exclude_unset=True, exclude={'cantidad_inicial', 'ubicacion'})
        update_data['referencia'] = _none_if_empty(update_data.get('referencia'))
        update_data['codigo_item_interno'] = _none_if_empty(update_data.get('codigo_item_interno'))
        for field, value in update_data.items():
            setattr(db_item, field, value)
        await db.flush()

        if cantidad_inicial > 0:
            result = await db.execute(
                select(StockBulk).filter(StockBulk.id_item == db_item.id_item)
            )
            db_stock = result.scalars().first()
            if db_stock:
                db_stock.cantidad_actual = (float(db_stock.cantidad_actual or 0) + cantidad_inicial)
            else:
                db_stock = StockBulk(id_item=db_item.id_item, cantidad_actual=cantidad_inicial)
                db.add(db_stock)
            await db.flush()

            movimiento = MovimientoInventario(
                id_usuario=current_user_id,
                id_item=db_item.id_item,
                tipo_movimiento="ENTRADA_COMPRA",
                cantidad=cantidad_inicial,
                origen="COMPRA / REGISTRO MANUAL",
                destino=item.ubicacion or "BODEGA",
                notes=f"Ingreso adicional al actualizar item: {item.nombre_equipo}" + (f" | Ubicacion: {item.ubicacion}" if item.ubicacion else ""),
            )
            db.add(movimiento)
    else:
        is_new = True
        item_data = item.model_dump(exclude={'cantidad_inicial', 'ubicacion'})
        item_data['referencia'] = ref
        item_data['codigo_item_interno'] = cod
        item_data['marca'] = _none_if_empty(item_data.get('marca'))
        item_data['sub_categoria'] = _none_if_empty(item_data.get('sub_categoria'))

        db_item = Item(**item_data)
        db.add(db_item)
        await db.flush()

        result = await db.execute(
            select(StockBulk).filter(StockBulk.id_item == db_item.id_item)
        )
        db_stock = result.scalars().first()
        if db_stock:
            db_stock.cantidad_actual = (float(db_stock.cantidad_actual or 0) + cantidad_inicial)
        else:
            db_stock = StockBulk(id_item=db_item.id_item, cantidad_actual=cantidad_inicial)
            db.add(db_stock)
        await db.flush()

        if cantidad_inicial > 0:
            movimiento = MovimientoInventario(
                id_usuario=current_user_id,
                id_item=db_item.id_item,
                tipo_movimiento="ENTRADA_COMPRA",
                cantidad=cantidad_inicial,
                origen="COMPRA / REGISTRO MANUAL",
                destino=item.ubicacion or "BODEGA",
                notes=f"Ingreso inicial al crear el item: {item.nombre_equipo}" + (f" | Ubicacion: {item.ubicacion}" if item.ubicacion else ""),
            )
            db.add(movimiento)

    await db.commit()
    logger.info(f"Item {'creado' if is_new else 'actualizado'} exitosamente", extra={"item_id": getattr(db_item, "id_item", None), "user_id": current_user_id})
    await create_audit_log(
        db, current_user_id, "items",
        "CREATE" if is_new else "UPDATE",
        getattr(db_item, "id_item"),
        nuevo=item.model_dump()
    )

    return await get_item_by_id(db, int(getattr(db_item, "id_item")))

async def update_item(db: AsyncSession, item_id: int, item_in: ItemUpdate, current_user_id: int):
    logger.info("Actualizando item", extra={"item_id": item_id, "user_id": current_user_id})
    result = await db.execute(select(Item).filter(Item.id_item == item_id))
    db_item = result.scalars().first()
    if not db_item:
        logger.warning("Item no encontrado para actualizar", extra={"item_id": item_id})
        return None
    
    old_data = {c.name: getattr(db_item, c.name) for c in db_item.__table__.columns}
    update_data = item_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    await db.commit()
    logger.info("Item actualizado exitosamente", extra={"item_id": item_id, "campos": list(update_data.keys())})
    await create_audit_log(db, current_user_id, "items", "UPDATE", item_id, anterior=old_data, nuevo=update_data)
    
    return await get_item_by_id(db, item_id)

async def delete_item(db: AsyncSession, item_id: int, current_user_id: int):
    logger.info("Eliminando item (soft delete)", extra={"item_id": item_id, "user_id": current_user_id})
    result = await db.execute(select(Item).filter(Item.id_item == item_id))
    db_item = result.scalars().first()
    if db_item:
        setattr(db_item, "deleted_at", datetime.now())
        await db.commit()
        logger.info("Item eliminado exitosamente", extra={"item_id": item_id})
        await create_audit_log(db, current_user_id, "items", "DELETE", item_id, nuevo={"deleted_at": str(getattr(db_item, "deleted_at"))})
    else:
        logger.warning("Item no encontrado para eliminar", extra={"item_id": item_id})
    return db_item

# ACTIVOS

async def get_activos(db: AsyncSession, skip: int = 0, limit: int = 100):
    logger.debug("Obteniendo activos", extra={"skip": skip, "limit": limit})
    total_result = await db.execute(select(func.count()).select_from(Activo))
    total = total_result.scalar() or 0
    
    result = await db.execute(
        select(Activo)
        .options(joinedload(Activo.item).joinedload(Item.stock_bulk))
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def create_activo(db: AsyncSession, activo: ActivoCreate, current_user_id: int):
    logger.info("Creando activo", extra={"serial": activo.serial, "id_item": activo.id_item, "user_id": current_user_id})
    db_activo = Activo(**activo.model_dump())
    db.add(db_activo)
    await db.commit()
    
    if getattr(db_activo, "ubicacion_fisica"):
        historial = HistorialUbicacion(
            id_activo=db_activo.id_activo,
            ubicacion_desde=db_activo.ubicacion_fisica,
            id_usuario=current_user_id
        )
        db.add(historial)
        await db.commit()

    logger.info("Activo creado exitosamente", extra={"id_activo": getattr(db_activo, "id_activo", None), "serial": activo.serial})
    await create_audit_log(db, current_user_id, "activos", "CREATE", getattr(db_activo, "id_activo"), nuevo=activo.model_dump())
    
    result = await db.execute(
        select(Activo).options(joinedload(Activo.item).joinedload(Item.stock_bulk)).filter(Activo.id_activo == getattr(db_activo, "id_activo"))
    )
    return result.scalars().first()

async def update_activo(db: AsyncSession, activo_id: int, activo_in: ActivoUpdate, current_user_id: int):
    logger.info("Actualizando activo", extra={"id_activo": activo_id, "user_id": current_user_id})
    result = await db.execute(select(Activo).filter(Activo.id_activo == activo_id))
    db_activo = result.scalars().first()
    if not db_activo:
        logger.warning("Activo no encontrado", extra={"id_activo": activo_id})
        return None
    
    old_data = {c.name: getattr(db_activo, c.name) for c in db_activo.__table__.columns}
    update_data = activo_in.model_dump(exclude_unset=True)
    
    if "ubicacion_fisica" in update_data and update_data["ubicacion_fisica"] != getattr(db_activo, "ubicacion_fisica"):
        await db.execute(
            update(HistorialUbicacion)
            .filter(HistorialUbicacion.id_activo == activo_id, HistorialUbicacion.fecha_hasta == None)
            .values(fecha_hasta=datetime.now())
        )
        nuevo_historial = HistorialUbicacion(
            id_activo=activo_id,
            ubicacion_desde=update_data["ubicacion_fisica"],
            id_usuario=current_user_id
        )
        db.add(nuevo_historial)

    for field, value in update_data.items():
        setattr(db_activo, field, value)
    
    await db.commit()
    logger.info("Activo actualizado exitosamente", extra={"id_activo": activo_id})
    await create_audit_log(db, current_user_id, "activos", "UPDATE", activo_id, anterior=old_data, nuevo=update_data)
    
    result = await db.execute(
        select(Activo).options(joinedload(Activo.item).joinedload(Item.stock_bulk)).filter(Activo.id_activo == activo_id)
    )
    return result.scalars().first()

# EPP

async def create_epp_assignment(db: AsyncSession, epp_in: EPPAssignacionCreate):
    db_epp = EPPAssignacion(**epp_in.model_dump())
    db.add(db_epp)
    await db.commit()
    await db.refresh(db_epp)
    return db_epp

async def get_epp_assignments(db: AsyncSession):
    result = await db.execute(select(EPPAssignacion).options(joinedload(EPPAssignacion.activo), joinedload(EPPAssignacion.usuario)))
    return result.scalars().all()

# HISTORIAL UBICACIONES

async def get_activo_historial(db: AsyncSession, id_activo: int):
    result = await db.execute(
        select(HistorialUbicacion)
        .filter(HistorialUbicacion.id_activo == id_activo)
        .order_by(HistorialUbicacion.fecha_desde.desc())
    )
    return result.scalars().all()

async def get_activos_by_estado(db: AsyncSession, estado: str, skip: int = 0, limit: int = 100):
    total_result = await db.execute(
        select(func.count()).select_from(Activo).filter(Activo.estado_actual == estado)
    )
    total = total_result.scalar() or 0
    
    result = await db.execute(
        select(Activo)
        .options(
            joinedload(Activo.item).joinedload(Item.stock_bulk),
            joinedload(Activo.proyecto),
            joinedload(Activo.cliente_actual)
        )
        .filter(Activo.estado_actual == estado)
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def delete_activo(db: AsyncSession, activo_id: int, current_user_id: int):
    result = await db.execute(select(Activo).filter(Activo.id_activo == activo_id))
    db_activo = result.scalars().first()
    if db_activo:
        await db.delete(db_activo)
        await db.commit()
        await create_audit_log(db, current_user_id, "activos", "DELETE", activo_id, nuevo={"status": "deleted"})
    return db_activo

async def get_activo_by_id(db: AsyncSession, activo_id: int):
    result = await db.execute(
        select(Activo)
        .options(
            joinedload(Activo.item).joinedload(Item.stock_bulk),
            joinedload(Activo.proyecto),
            joinedload(Activo.cliente_actual)
        )
        .filter(Activo.id_activo == activo_id)
    )
    return result.scalars().first()

async def get_activo_by_serial(db: AsyncSession, serial: str):
    result = await db.execute(
        select(Activo)
        .options(joinedload(Activo.item).joinedload(Item.stock_bulk))
        .filter(Activo.serial == serial)
    )
    return result.scalars().first()

async def update_activo_triaje(db: AsyncSession, id_activo: int, triaje_data: dict, current_user_id: int):
    result = await db.execute(
        select(Activo)
        .options(joinedload(Activo.item).joinedload(Item.stock_bulk))
        .filter(Activo.id_activo == id_activo)
    )
    db_activo = result.scalars().first()
    if not db_activo:
        return None
    
    old_data = {c.name: getattr(db_activo, c.name) for c in db_activo.__table__.columns}
    
    # Actualizar campos específicos de triaje
    
    for field, value in triaje_data.items():
        if hasattr(db_activo, field):
            setattr(db_activo, field, value)
    
    # Campos automáticos
    
    setattr(db_activo, "fecha_triaje", datetime.now())
    
    await db.commit()
    await db.refresh(db_activo)
    await create_audit_log(db, current_user_id, "activos", "UPDATE", id_activo, anterior=old_data, nuevo=triaje_data)
    return db_activo

async def crear_desmonte_bulk(db: AsyncSession, items_data: List[dict], proyecto_id: Optional[int], cliente_id: Optional[int], current_user_id: int):
    from app.models.inventory import MovimientoInventario
    from datetime import datetime
    
    origen_str = f"PROYECTO: {proyecto_id}" if proyecto_id else f"CLIENTE: {cliente_id}"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    total_activos = 0
    detalles = []
    
    for idx, item_info in enumerate(items_data):
        item_id = item_info["id_item"]
        cantidad = item_info["cantidad"]
        
        # Actualizar Stock
        result = await db.execute(select(StockBulk).where(StockBulk.id_item == item_id))
        stock = result.scalars().first()
        if stock:
            setattr(stock, "cantidad_actual", (getattr(stock, "cantidad_actual") or 0) + cantidad)
        else:
            db.add(StockBulk(id_item=item_id, cantidad_actual=cantidad))
        
        # Crear Activos con serial auto-generado
        seriales_creados = []
        for i in range(cantidad):
            serial = f"AUTO-{item_id}-{timestamp}-{total_activos + i + 1}"
            activo = Activo(
                id_item=item_id,
                serial=serial,
                estado_actual="LABORATORIO",
                condicion_fisica="USADO_BUENO",
                id_proyecto_actual=proyecto_id,
                id_cliente_actual=cliente_id,
                ubicacion_fisica="LABORATORIO",
                area_asignada="LABORATORIO"
            )
            db.add(activo)
            seriales_creados.append(serial)
        
        total_activos += cantidad
        
        # Crear Movimiento de Inventario por item
        movimiento = MovimientoInventario(
            id_usuario=current_user_id,
            id_item=item_id,
            tipo_movimiento="INGRESO_DESMONTE",
            cantidad=cantidad,
            origen=origen_str,
            destino="LABORATORIO",
            notes=f"Ingreso manual de desmontes ({cantidad} uds) - Seriales: {', '.join(seriales_creados)}"
        )
        db.add(movimiento)
        detalles.append({"id_item": item_id, "cantidad": cantidad, "seriales": seriales_creados})
    
    await db.commit()
    return {"items_registrados": total_activos, "detalles": detalles}
