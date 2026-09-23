from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole
from app.schemas.inventory import Regional


def usuario_nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre es obligatorio")
    return v.strip()


def usuario_email_valido(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El email es obligatorio")
    return v.strip()


class UsuarioBase(BaseModel):
    nombre: str = Field(..., description="Nombre completo")
    email: EmailStr = Field(..., description="Email del usuario")
    rol: UserRole
    id_regional: Optional[int] = None
    cedula: Optional[str] = None
    codigo_empleado: Optional[str] = None
    regional: Optional[str] = None
    is_active: bool = True

    _validate_nombre = field_validator("nombre", mode="before")(usuario_nombre_obligatorio)
    _validate_email = field_validator("email", mode="before")(usuario_email_valido)


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8, description="Contraseña (mín. 8 caracteres)")
    
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.islower() for c in v) or not any(c.isupper() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos una mayúscula, una minúscula y un número")
        return v


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, description="Nombre completo")
    email: Optional[EmailStr] = Field(default=None, description="Email del usuario")
    rol: Optional[UserRole] = None
    id_regional: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=8, description="Contraseña (mín. 8 caracteres)")
    cedula: Optional[str] = None
    codigo_empleado: Optional[str] = None
    regional: Optional[str] = None

    _validate_nombre = field_validator("nombre", mode="before")(usuario_nombre_obligatorio)
    _validate_email = field_validator("email", mode="before")(usuario_email_valido)


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
