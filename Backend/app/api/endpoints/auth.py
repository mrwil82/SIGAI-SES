from typing import cast, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from starlette.concurrency import run_in_threadpool
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.db.session import get_db
from app.crud import crud_user
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, 
    get_token_hash, decode_token
)
from app.schemas.user import Token, Usuario, UsuarioCreate
from app.api.deps import get_current_user, require_roles
from app.models.user import SesionUsuario

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    db: AsyncSession = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await crud_user.get_user_by_email(db, email=form_data.username)
    
   # Verificar contraseña de forma segura
   
    if not user or not await run_in_threadpool(verify_password, form_data.password, cast(str, getattr(user, "password_hash", ""))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not getattr(user, "is_active", False):
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    # Generar tokens
    access_token = create_access_token(data={"sub": str(getattr(user, "email")), "rol": str(getattr(user, "rol"))})
    refresh_token = create_refresh_token(data={"sub": str(getattr(user, "email"))})
    
    # Almacenar sesión 
    
    token_payload = decode_token(refresh_token)
    expires_at = datetime.fromtimestamp(token_payload["exp"], tz=timezone.utc) if token_payload else None
    
    nueva_sesion = SesionUsuario(
        id_usuario=int(getattr(user, "id_usuario")),
        token_hash=get_token_hash(refresh_token),
        ip_origen=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=expires_at
    )
    db.add(nueva_sesion)
    await db.commit()
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token_endpoint(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token no contiene identidad")
        
    token_hash = get_token_hash(refresh_token)
    
    # Verificar en DB
    result = await db.execute(
        select(SesionUsuario).filter(
            SesionUsuario.token_hash == token_hash,
            SesionUsuario.revocado == False,
            SesionUsuario.expires_at > datetime.now(timezone.utc)
        )
    )
    sesion = result.scalars().first()
    if not sesion:
        raise HTTPException(status_code=401, detail="Sesión expirada o revocada")
    
    user = await crud_user.get_user_by_email(db, email=str(email))
    if not user or not getattr(user, "is_active", False):
        raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
    
    # Generar nuevo access token
    
    new_access_token = create_access_token(data={"sub": str(getattr(user, "email")), "rol": str(getattr(user, "rol"))})
    
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(refresh_token: str, db: AsyncSession = Depends(get_db)):
    token_hash = get_token_hash(refresh_token)
    result = await db.execute(select(SesionUsuario).filter(SesionUsuario.token_hash == token_hash))
    sesion = result.scalars().first()
    if sesion:
        setattr(sesion, "revocado", True)
        await db.commit()
    return {"detail": "Sesión cerrada exitosamente"}

# registro de nuevos usuarios 

@router.post("/register", response_model=Usuario)
async def register(user_in: UsuarioCreate, db: AsyncSession = Depends(get_db), current_user = Depends(require_roles("ADMIN"))):
    user = await crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")
    return await crud_user.create_user(db, user=user_in, current_user_id=current_user.id_usuario)

@router.get("/me", response_model=Usuario)
async def read_users_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
