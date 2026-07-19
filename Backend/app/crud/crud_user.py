from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import joinedload
from app.models.user import Usuario, Regional
from app.schemas.user import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash
from app.crud.crud_audit import create_audit_log
from app.core.logger import get_logger

logger = get_logger(__name__)

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(
        select(Usuario)
        .options(joinedload(Usuario.regional_rel))
        .filter(Usuario.email == email)
    )
    return result.scalars().first()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Usuario)
        .options(joinedload(Usuario.regional_rel))
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create_user(db: AsyncSession, user: UsuarioCreate, current_user_id: int):
    existing = await get_user_by_email(db, user.email)
    if existing:
        raise ValueError(f"El correo '{user.email}' ya está registrado por otro usuario.")
    
    try:
        db_user = Usuario(
            nombre=user.nombre,
            email=user.email,
            password_hash=get_password_hash(user.password),
            rol=user.rol,
            id_regional=user.id_regional,
            cedula=user.cedula,
            codigo_empleado=user.codigo_empleado,
            regional=user.regional,
            is_active=user.is_active
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        # Audit log
        await create_audit_log(
            db,
            id_usuario=current_user_id if current_user_id != 0 else int(getattr(db_user, "id_usuario")),
            tabla="usuarios",
            accion="CREATE",
            id_reg=int(getattr(db_user, "id_usuario")),
            nuevo=user.model_dump(exclude={"password"})
        )
        
        return db_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating user: {e}", exc_info=True)
        raise

async def update_user(db: AsyncSession, user_id: int, user_in: UsuarioUpdate, current_user_id: int):
    result = await db.execute(select(Usuario).filter(Usuario.id_usuario == user_id))
    db_user = result.scalars().first()
    if not db_user:
        return None
    
    old_data = {
        "nombre": getattr(db_user, "nombre"),
        "email": getattr(db_user, "email"),
        "rol": getattr(db_user, "rol"),
        "id_regional": getattr(db_user, "id_regional"),
        "cedula": getattr(db_user, "cedula"),
        "codigo_empleado": getattr(db_user, "codigo_empleado"),
        "is_active": getattr(db_user, "is_active")
    }
    
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    if "email" in update_data and update_data["email"] != db_user.email:
        existing = await get_user_by_email(db, update_data["email"])
        if existing:
            raise ValueError(f"El correo '{update_data['email']}' ya está registrado por otro usuario.")
    
    try:
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        await db.commit()
        await db.refresh(db_user)
        
        await create_audit_log(
            db,
            id_usuario=current_user_id,
            tabla="usuarios",
            accion="UPDATE",
            id_reg=user_id,
            anterior=old_data,
            nuevo=update_data
        )
        
        return db_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user {user_id}: {e}", exc_info=True)
        raise

async def delete_user(db: AsyncSession, user_id: int, current_user_id: int):
    # En usuarios generalmente se usa is_active=False
    result = await db.execute(select(Usuario).filter(Usuario.id_usuario == user_id))
    db_user = result.scalars().first()
    if db_user:
        try:
            setattr(db_user, "is_active", False)
            await db.commit()
            
            await create_audit_log(
                db,
                id_usuario=current_user_id,
                tabla="usuarios",
                accion="DELETE",
                id_reg=user_id,
                anterior={"is_active": True},
                nuevo={"is_active": False}
            )
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting user {user_id}: {e}", exc_info=True)
            raise
    return db_user

# CRUD Regionales
async def get_regionales(db: AsyncSession):
    result = await db.execute(select(Regional))
    return result.scalars().all()
