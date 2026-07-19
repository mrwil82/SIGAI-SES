from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole
from app.schemas.inventory import Regional

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: UserRole
    id_regional: Optional[int] = None
    cedula: Optional[str] = None
    codigo_empleado: Optional[str] = None
    regional: Optional[str] = None 
    is_active: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[UserRole] = None
    id_regional: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    cedula: Optional[str] = None
    codigo_empleado: Optional[str] = None
    regional: Optional[str] = None

class Usuario(UsuarioBase):
    id_usuario: int
    created_at: datetime
    regional_rel: Optional[Regional] = None
    avatar_url: Optional[str] = None
    config: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[str] = None
