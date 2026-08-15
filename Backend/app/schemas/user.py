from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
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
    password: str = Field(..., min_length=8)
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.islower() for c in v) or not any(c.isupper() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos una mayúscula, una minúscula y un número")
        return v


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[UserRole] = None
    id_regional: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)
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
