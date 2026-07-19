from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.session import get_db
from app.crud import crud_user
from app.schemas import Usuario, UsuarioCreate, UsuarioUpdate, AuditLog
from app.schemas.common import PaginatedResponse
from app.core.pagination import paginate
from app.api.deps import get_current_user
from app.crud import crud_audit
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from app.models.user import Usuario as UserModel
import json
from fastapi import UploadFile, File
import os
from app.core.security import verify_password, get_password_hash
from app.schemas.user import UsuarioUpdate
from app.crud.crud_audit import create_audit_log
from datetime import datetime

router = APIRouter()

@router.get("/audit", response_model=PaginatedResponse[AuditLog])
async def read_audit_logs(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    accion: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    from app.models import AuditLog as AuditModel
    from app.models.user import Usuario
    from sqlalchemy import or_

    query = select(AuditModel).options(joinedload(AuditModel.usuario))

    if accion:
        query = query.where(AuditModel.accion == accion)

    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                AuditModel.tabla_afectada.ilike(term),
                AuditModel.valor_nuevo.ilike(term),
                AuditModel.valor_anterior.ilike(term),
            )
        )

    query = query.order_by(AuditModel.fecha_accion.desc())
    items, total = await paginate(db, query, page=page, page_size=page_size)
    return PaginatedResponse.create(items, total, page, page_size)


@router.get('/me/settings')
async def get_my_settings(current_user = Depends(get_current_user)):
    """Devuelve la configuración del usuario autenticado como JSON."""
    cfg = getattr(current_user, 'config', None)
    try:
        return json.loads(cfg) if cfg else {}
    except Exception:
        return {}


@router.put('/me/settings')
async def update_my_settings(settings: dict, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Guarda la configuración del usuario autenticado (JSON)."""
    result = await db.execute(select(UserModel).where(UserModel.id_usuario == current_user.id_usuario))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    cfg_str = json.dumps(settings)
    setattr(db_user, 'config', cfg_str)
    await db.commit()
    await db.refresh(db_user)
    return settings


ALLOWED_AVATAR_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB

@router.post('/me/avatar')
async def upload_avatar(file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Sube una imagen de avatar y actualiza la URL en el usuario."""
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=400, detail=f'Tipo de archivo no permitido: {file.content_type}. Use JPEG, PNG, GIF o WebP.')
    content = await file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=400, detail='El archivo excede el tamaño máximo de 2MB.')
    await file.seek(0)
    upload_dir = os.path.join(os.getcwd(), 'app', 'static', 'avatars')
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else '.png'
    filename = f"avatar_{current_user.id_usuario}_{int(datetime.utcnow().timestamp())}{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, 'wb') as f:
        content = await file.read()
        f.write(content)
    public_url = f"/static/avatars/{filename}"

    result = await db.execute(select(UserModel).where(UserModel.id_usuario == current_user.id_usuario))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    setattr(db_user, 'avatar_url', public_url)
    await db.commit()
    await db.refresh(db_user)
    await create_audit_log(db, getattr(current_user, 'id_usuario', 0), 'usuarios', 'UPDATE', getattr(current_user, 'id_usuario', 0), nuevo={'avatar_url': public_url})
    return {'avatar_url': public_url}


@router.put('/me/password')
async def change_my_password(data: dict, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Permite al usuario cambiar su propia contraseña proporcionando la actual y la nueva."""
    current = data.get('current_password')
    new = data.get('new_password')
    if not current or not new:
        raise HTTPException(status_code=400, detail='Se requieren current_password y new_password')
    # obtener user
    result = await db.execute(select(UserModel).where(UserModel.id_usuario == current_user.id_usuario))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    if not verify_password(current, getattr(db_user, 'password_hash', '')):
        raise HTTPException(status_code=400, detail='Contraseña actual incorrecta')
    # actualizar
    setattr(db_user, 'password_hash', get_password_hash(new))
    await db.commit()
    await db.refresh(db_user)
    await create_audit_log(db, getattr(current_user, 'id_usuario', 0), 'usuarios', 'UPDATE', getattr(current_user, 'id_usuario', 0), nuevo={'password_changed': True})
    return {'detail': 'Contraseña actualizada'}

@router.get("/check-unique")
async def check_field_unique(
    field: str = Query(...),
    value: str = Query(...),
    exclude_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if field not in ("email", "cedula", "codigo_empleado"):
        raise HTTPException(status_code=400, detail="Campo no válido")
    
    from app.models.user import Usuario as User
    import re
    
    # Validación de formato de email
    if field == "email":
        if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', value):
            return {"available": False, "error": "Formato de correo inválido"}
    
    column = getattr(User, field, None)
    query = select(User).where(column == value)
    if exclude_id:
        query = query.where(User.id_usuario != exclude_id)
    
    result = await db.execute(query)
    exists = result.scalars().first() is not None
    error = f"El {field.replace('_', ' ')} '{value}' ya está registrado." if exists else None
    return {"available": not exists, "error": error}

# CRUD de usuarios (solo para administradores)

@router.post("/", response_model=Usuario)
async def create_user(
    user_in: UsuarioCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tiene permisos para crear usuarios")
    try:
        return await crud_user.create_user(db, user=user_in, current_user_id=current_user.id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Listar usuarios con paginación (solo para administradores)
@router.get("/", response_model=PaginatedResponse[Usuario])
async def read_users(
    db: AsyncSession = Depends(get_db), 
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    current_user = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tiene permisos para ver la lista de usuarios")
    from app.models import Usuario as UserModel
    from sqlalchemy.orm import joinedload

    query = select(UserModel).options(joinedload(UserModel.regional_rel))
    items, total = await paginate(db, query, page=page, page_size=page_size)
    return PaginatedResponse.create(items, total, page, page_size)

# Generador de datos para exportación (optimizado para grandes volúmenes)

@router.put("/{id_user}", response_model=Usuario)
async def update_user(
    id_user: int, 
    user_in: UsuarioUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.rol != "ADMIN" and current_user.id_usuario != id_user:
        raise HTTPException(status_code=403, detail="No tiene permisos para modificar este usuario")
    try:
        user = await crud_user.update_user(db, user_id=id_user, user_in=user_in, current_user_id=current_user.id_usuario)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id_user}", response_model=Usuario)
async def delete_user(
    id_user: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tiene permisos para eliminar usuarios")
    user = await crud_user.delete_user(db, user_id=id_user, current_user_id=current_user.id_usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
