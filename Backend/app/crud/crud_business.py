from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import joinedload
from datetime import datetime
from app.models.business import Cliente, Proveedor, Proyecto
from app.models.inventory import MovimientoInventario, Item, Activo
from app.models.guarantees import Garantia
from app.schemas.business import (
    ClienteCreate, ClienteUpdate, 
    ProveedorCreate, ProveedorUpdate,
    ProyectoCreate, ProyectoUpdate,
    GarantiaCreate, GarantiaUpdate
)
from app.schemas.inventory import MovimientoCreate
from app.crud.crud_audit import create_audit_log
from app.core.logger import get_logger

logger = get_logger(__name__)

# CLIENTES

async def get_clientes(db: AsyncSession, skip: int = 0, limit: int = 100):
    total_result = await db.execute(select(func.count()).select_from(Cliente).filter(Cliente.deleted_at == None))
    total = total_result.scalar() or 0
    result = await db.execute(select(Cliente).filter(Cliente.deleted_at == None).offset(skip).limit(limit))
    return result.scalars().all(), total

async def get_cliente_by_id(db: AsyncSession, id_cliente: int):
    result = await db.execute(select(Cliente).filter(Cliente.id_cliente == id_cliente, Cliente.deleted_at == None))
    return result.scalars().first()

async def create_cliente(db: AsyncSession, cliente: ClienteCreate, current_user_id: int):
    try:
        db_cliente = Cliente(**cliente.model_dump())
        db.add(db_cliente)
        await db.commit()
        await db.refresh(db_cliente)
        await create_audit_log(db, current_user_id, "clientes", "CREATE", getattr(db_cliente, "id_cliente"), nuevo=cliente.model_dump())
        return db_cliente
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating cliente: {e}", exc_info=True)
        raise

async def update_cliente(db: AsyncSession, id_cliente: int, cliente_in: ClienteUpdate, current_user_id: int):
    result = await db.execute(select(Cliente).filter(Cliente.id_cliente == id_cliente))
    db_cliente = result.scalars().first()
    if not db_cliente: return None
    
    old_data = {c.name: getattr(db_cliente, c.name) for c in db_cliente.__table__.columns}
    update_data = cliente_in.model_dump(exclude_unset=True)
    
    try:
        for field, value in update_data.items():
            setattr(db_cliente, field, value)
        
        await db.commit()
        await db.refresh(db_cliente)
        await create_audit_log(db, current_user_id, "clientes", "UPDATE", id_cliente, anterior=old_data, nuevo=update_data)
        return db_cliente
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating cliente {id_cliente}: {e}", exc_info=True)
        raise

async def delete_cliente(db: AsyncSession, id_cliente: int, current_user_id: int):
    result = await db.execute(select(Cliente).filter(Cliente.id_cliente == id_cliente))
    db_cliente = result.scalars().first()
    if db_cliente:
        try:
            setattr(db_cliente, "deleted_at", datetime.now())
            await db.commit()
            await create_audit_log(db, current_user_id, "clientes", "DELETE", id_cliente, nuevo={"deleted_at": str(getattr(db_cliente, "deleted_at"))})
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting cliente {id_cliente}: {e}", exc_info=True)
            raise
    return db_cliente

# PROVEEDORES

async def get_proveedores(db: AsyncSession, skip: int = 0, limit: int = 100):
    total_result = await db.execute(select(func.count()).select_from(Proveedor).filter(Proveedor.deleted_at == None))
    total = total_result.scalar() or 0
    result = await db.execute(select(Proveedor).filter(Proveedor.deleted_at == None).offset(skip).limit(limit))
    return result.scalars().all(), total

async def create_proveedor(db: AsyncSession, proveedor: ProveedorCreate, current_user_id: int):
    try:
        db_proveedor = Proveedor(**proveedor.model_dump())
        db.add(db_proveedor)
        await db.commit()
        await db.refresh(db_proveedor)
        await create_audit_log(db, current_user_id, "proveedores", "CREATE", getattr(db_proveedor, "id_proveedor"), nuevo=proveedor.model_dump())
        return db_proveedor
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating proveedor: {e}", exc_info=True)
        raise

async def update_proveedor(db: AsyncSession, id_proveedor: int, proveedor_in: ProveedorUpdate, current_user_id: int):
    result = await db.execute(select(Proveedor).filter(Proveedor.id_proveedor == id_proveedor))
    db_proveedor = result.scalars().first()
    if not db_proveedor: return None
    
    old_data = {c.name: getattr(db_proveedor, c.name) for c in db_proveedor.__table__.columns}
    update_data = proveedor_in.model_dump(exclude_unset=True)
    
    try:
        for field, value in update_data.items():
            setattr(db_proveedor, field, value)
        
        await db.commit()
        await db.refresh(db_proveedor)
        await create_audit_log(db, current_user_id, "proveedores", "UPDATE", id_proveedor, anterior=old_data, nuevo=update_data)
        return db_proveedor
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating proveedor {id_proveedor}: {e}", exc_info=True)
        raise

async def delete_proveedor(db: AsyncSession, id_proveedor: int, current_user_id: int):
    result = await db.execute(select(Proveedor).filter(Proveedor.id_proveedor == id_proveedor))
    db_proveedor = result.scalars().first()
    if db_proveedor:
        try:
            setattr(db_proveedor, "deleted_at", datetime.now())
            await db.commit()
            await create_audit_log(db, current_user_id, "proveedores", "DELETE", id_proveedor, nuevo={"deleted_at": str(getattr(db_proveedor, "deleted_at"))})
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting proveedor {id_proveedor}: {e}", exc_info=True)
            raise
    return db_proveedor

# PROYECTOS

async def get_proyectos(db: AsyncSession, skip: int = 0, limit: int = 100):
    total_result = await db.execute(select(func.count()).select_from(Proyecto))
    total = total_result.scalar() or 0
    result = await db.execute(
        select(Proyecto)
        .options(joinedload(Proyecto.cliente))
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def get_proyecto_by_id(db: AsyncSession, id_proyecto: int):
    result = await db.execute(
        select(Proyecto)
        .options(joinedload(Proyecto.cliente))
        .filter(Proyecto.id_proyecto == id_proyecto)
    )
    return result.scalars().first()

async def create_proyecto(db: AsyncSession, proyecto: ProyectoCreate, current_user_id: int):
    try:
        db_proyecto = Proyecto(**proyecto.model_dump())
        db.add(db_proyecto)
        await db.commit()
        await db.refresh(db_proyecto)
        await create_audit_log(db, current_user_id, "proyectos", "CREATE", getattr(db_proyecto, "id_proyecto"), nuevo=proyecto.model_dump())
        return db_proyecto
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating proyecto: {e}", exc_info=True)
        raise

async def update_proyecto(db: AsyncSession, id_proyecto: int, proyecto_in: ProyectoUpdate, current_user_id: int):
    result = await db.execute(select(Proyecto).filter(Proyecto.id_proyecto == id_proyecto))
    db_proyecto = result.scalars().first()
    if not db_proyecto: return None
    
    old_data = {c.name: getattr(db_proyecto, c.name) for c in db_proyecto.__table__.columns}
    update_data = proyecto_in.model_dump(exclude_unset=True)
    
    try:
        for field, value in update_data.items():
            setattr(db_proyecto, field, value)
        
        await db.commit()
        await db.refresh(db_proyecto)
        await create_audit_log(db, current_user_id, "proyectos", "UPDATE", id_proyecto, anterior=old_data, nuevo=update_data)
        return db_proyecto
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating proyecto {id_proyecto}: {e}", exc_info=True)
        raise

async def delete_proyecto(db: AsyncSession, id_proyecto: int, current_user_id: int):
    result = await db.execute(select(Proyecto).filter(Proyecto.id_proyecto == id_proyecto))
    db_proyecto = result.scalars().first()
    if db_proyecto:
        try:
            await db.delete(db_proyecto)
            await db.commit()
            await create_audit_log(db, current_user_id, "proyectos", "DELETE", id_proyecto, nuevo={"status": "deleted"})
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting proyecto {id_proyecto}: {e}", exc_info=True)
            raise
    return db_proyecto

# MOVIMIENTOS

async def get_movimientos(db: AsyncSession, skip: int = 0, limit: int = 100):
    total_result = await db.execute(select(func.count()).select_from(MovimientoInventario))
    total = total_result.scalar() or 0
    result = await db.execute(
        select(MovimientoInventario)
        .options(joinedload(MovimientoInventario.item).joinedload(Item.stock_bulk), joinedload(MovimientoInventario.activo))
        .order_by(MovimientoInventario.fecha_movimiento.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def create_movimiento(db: AsyncSession, mov: MovimientoCreate, current_user_id: int):
    try:
        mov_data = mov.model_dump(exclude_none=True)
        if "notas" in mov_data:
            mov_data["notes"] = mov_data.pop("notas")
        db_mov = MovimientoInventario(**mov_data)
        db.add(db_mov)
        await db.commit()
        await db.refresh(db_mov)
        await create_audit_log(db, current_user_id, "movimientos_inventario", "CREATE", getattr(db_mov, "id_movimiento"), nuevo=mov.model_dump())
        return db_mov
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating movimiento: {e}", exc_info=True)
        raise

# GARANTIAS

async def get_garantias(db: AsyncSession, skip: int = 0, limit: int = 100):
    total_result = await db.execute(select(func.count()).select_from(Garantia))
    total = total_result.scalar() or 0
    result = await db.execute(
        select(Garantia)
        .options(
            joinedload(Garantia.activo).joinedload(Activo.item).joinedload(Item.stock_bulk),
            joinedload(Garantia.proveedor)
        )
        .offset(skip).limit(limit)
    )
    return result.scalars().all(), total

async def get_garantia_by_id(db: AsyncSession, id_garantia: int):
    result = await db.execute(
        select(Garantia)
        .options(
            joinedload(Garantia.activo).joinedload(Activo.item),
            joinedload(Garantia.proveedor)
        )
        .filter(Garantia.id_garantia == id_garantia)
    )
    return result.scalars().first()

async def create_garantia(db: AsyncSession, garantia: GarantiaCreate, current_user_id: int):
    try:
        db_gar = Garantia(**garantia.model_dump())
        db.add(db_gar)
        await db.commit()
        
        # Obtener el ID generado
        
        gar_id = int(getattr(db_gar, "id_garantia"))
        
        await create_audit_log(db, current_user_id, "garantias", "CREATE", gar_id, nuevo=garantia.model_dump())
        
        # RECARGAR CON RELACIONES PARA RESPUESTA COMPLETA
        
        result = await db.execute(
            select(Garantia)
            .options(
                joinedload(Garantia.activo).joinedload(Activo.item).joinedload(Item.stock_bulk),
                joinedload(Garantia.proveedor)
            )
            .where(Garantia.id_garantia == gar_id)
        )
        return result.scalars().first()
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating garantia: {e}", exc_info=True)
        raise

async def update_garantia(db: AsyncSession, id_garantia: int, obj_in: GarantiaUpdate, current_user_id: int):
    result = await db.execute(select(Garantia).filter(Garantia.id_garantia == id_garantia))
    db_gar = result.scalars().first()
    if not db_gar: return None
    
    old_data = {c.name: getattr(db_gar, c.name) for c in db_gar.__table__.columns}
    update_data = obj_in.model_dump(exclude_unset=True)
    
    try:
        for field, value in update_data.items():
            setattr(db_gar, field, value)
        
        await db.commit()
        await create_audit_log(db, current_user_id, "garantias", "UPDATE", id_garantia, anterior=old_data, nuevo=update_data)
        
        result = await db.execute(
            select(Garantia)
            .options(
                joinedload(Garantia.activo).joinedload(Activo.item).joinedload(Item.stock_bulk),
                joinedload(Garantia.proveedor)
            )
            .where(Garantia.id_garantia == id_garantia)
        )
        return result.scalars().first()
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating garantia {id_garantia}: {e}", exc_info=True)
        raise

async def delete_garantia(db: AsyncSession, id_garantia: int, current_user_id: int):
    result = await db.execute(select(Garantia).filter(Garantia.id_garantia == id_garantia))
    db_gar = result.scalars().first()
    if db_gar:
        try:
            await db.delete(db_gar)
            await db.commit()
            await create_audit_log(db, current_user_id, "garantias", "DELETE", id_garantia, nuevo={"status": "deleted"})
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting garantia {id_garantia}: {e}", exc_info=True)
            raise
    return db_gar
