from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from app.models.deliveries import ActaEntrega, DetalleActaEntrega
from app.schemas.deliveries import ActaEntregaCreate
from typing import List
import uuid
from app.crud.crud_audit import create_audit_log
from app.core.logger import get_logger

logger = get_logger(__name__)

async def create_acta(db: AsyncSession, acta_in: ActaEntregaCreate, current_user_id: int) -> ActaEntrega:
    
    # Generar número de acta 
    
    if not acta_in.numero_acta:
        acta_in.numero_acta = f"ACT-{uuid.uuid4().hex[:8].upper()}"
    
    try:
        db_acta = ActaEntrega(
            numero_acta=acta_in.numero_acta,
            id_usuario_tecnico=acta_in.id_usuario_tecnico,
            id_usuario_representante=acta_in.id_usuario_representante,
            id_proyecto=acta_in.id_proyecto,
            tipo_acta=acta_in.tipo_acta,
            estado_acta=acta_in.estado_acta,
            observaciones=acta_in.observaciones
        )
        db.add(db_acta)
        await db.flush()
        
        for detalle in acta_in.detalles:
            db_detalle = DetalleActaEntrega(
                id_acta=db_acta.id_acta,
                id_item=detalle.id_item,
                id_activo=detalle.id_activo,
                cantidad=detalle.cantidad,
                notas_estado=detalle.notas_estado
            )
            db.add(db_detalle)
            
        await db.commit()
        
        # Recargar con relaciones cargadas 
        
        result = await db.execute(
            select(ActaEntrega)
            .options(selectinload(ActaEntrega.detalles))
            .where(ActaEntrega.id_acta == db_acta.id_acta)
        )
        final_acta = result.scalars().first()
        
        await create_audit_log(db, current_user_id, "actas_entrega", "CREATE", db_acta.id_acta, nuevo=acta_in.model_dump())
        
        return final_acta
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating acta: {e}", exc_info=True)
        raise

async def get_actas(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ActaEntrega]:
    result = await db.execute(
        select(ActaEntrega)
        .options(selectinload(ActaEntrega.detalles))
        .offset(skip).limit(limit)
    )
    return list(result.scalars().all())

async def get_acta_by_id(db: AsyncSession, acta_id: int) -> ActaEntrega:
    result = await db.execute(
        select(ActaEntrega)
        .options(
            selectinload(ActaEntrega.detalles).selectinload(DetalleActaEntrega.item),
            selectinload(ActaEntrega.detalles).selectinload(DetalleActaEntrega.activo),
            selectinload(ActaEntrega.tecnico),
            selectinload(ActaEntrega.representante),
            selectinload(ActaEntrega.proyecto),
        )
        .where(ActaEntrega.id_acta == acta_id)
    )
    return result.scalars().first()

async def delete_acta(db: AsyncSession, acta_id: int, current_user_id: int):
    
    # Borrar detalles del acta para evitar inconsistencias
    
    result = await db.execute(select(ActaEntrega).where(ActaEntrega.id_acta == acta_id))
    db_acta = result.scalars().first()
    if db_acta:
        try:
            await db.execute(delete(DetalleActaEntrega).where(DetalleActaEntrega.id_acta == acta_id))
            await db.execute(delete(ActaEntrega).where(ActaEntrega.id_acta == acta_id))
            await db.commit()
            await create_audit_log(db, current_user_id, "actas_entrega", "DELETE", acta_id)
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting acta {acta_id}: {e}", exc_info=True)
            raise
    return db_acta


async def mark_acta_downloaded(db: AsyncSession, acta_id: int, current_user_id: int):
    result = await db.execute(
        select(ActaEntrega).where(ActaEntrega.id_acta == acta_id)
    )
    db_acta = result.scalars().first()
    if db_acta:
        
        await create_audit_log(db, current_user_id, "actas_entrega", "DOWNLOAD", acta_id)
    return db_acta


async def update_acta(db: AsyncSession, acta_id: int, acta_in: ActaEntregaCreate, current_user_id: int):
    result = await db.execute(select(ActaEntrega).where(ActaEntrega.id_acta == acta_id))
    db_acta = result.scalars().first()
    if not db_acta:
        return None

    # Actualizar campos principales del acta (excepto detalles)
    
    update_data = acta_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == 'detalles':
            continue
        setattr(db_acta, field, value)

    try:
        # Reemplazar detalles: eliminar los existentes y agregar los nuevos
        
        await db.execute(delete(DetalleActaEntrega).where(DetalleActaEntrega.id_acta == acta_id))
        for detalle in acta_in.detalles:
            db_detalle = DetalleActaEntrega(
                id_acta=acta_id,
                id_item=detalle.id_item,
                id_activo=detalle.id_activo,
                cantidad=detalle.cantidad,
                notas_estado=detalle.notas_estado
            )
            db.add(db_detalle)

        await db.commit()

        # recargar con relaciones para respuesta completa
        
        result = await db.execute(
            select(ActaEntrega).options(selectinload(ActaEntrega.detalles)).where(ActaEntrega.id_acta == acta_id)
        )
        updated = result.scalars().first()
        await create_audit_log(db, current_user_id, "actas_entrega", "UPDATE", acta_id, nuevo=acta_in.model_dump())
        return updated
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating acta {acta_id}: {e}", exc_info=True)
        raise
