from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TECNICO = "TECNICO"
    TECNICO_LABORATORIO = "TECNICO_LABORATORIO"

class Regional(Base):
    __tablename__ = "regionales"
    id_regional = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ciudad = Column(String(100))
    usuarios = relationship("Usuario", back_populates="regional_rel")

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(UserRole), nullable=False)
    id_regional = Column(Integer, ForeignKey("regionales.id_regional"))
    cedula = Column(String(20), unique=True, index=True)
    codigo_empleado = Column(String(20), unique=True, index=True)
    regional = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    config = Column(String(1024), nullable=True)  # JSON-encoded user preferences
    avatar_url = Column(String(255), nullable=True)

    regional_rel = relationship("Regional", back_populates="usuarios")
    sesiones = relationship("SesionUsuario", back_populates="usuario", cascade="all, delete-orphan")

class SesionUsuario(Base):
    __tablename__ = "sesiones_usuario"
    id_sesion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), nullable=False, index=True)
    ip_origen = Column(String(45))
    user_agent = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    expires_at = Column(TIMESTAMP)
    revocado = Column(Boolean, default=False)
    
    usuario = relationship("Usuario", back_populates="sesiones")
