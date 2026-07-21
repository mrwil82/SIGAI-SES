from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# Modelos para gestión de clientes

class Cliente(Base):
    __tablename__ = "clientes"
    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    nit = Column(String(20), unique=True)
    contacto = Column(String(100))
    email_contacto = Column(String(100))
    telefono = Column(String(50))
    direccion = Column(String(255))
    ciudad = Column(String(100))
    departamento = Column(String(100))
    tipo_cliente = Column(Enum("CORPORATIVO", "INTERNO", "GENERAL", name="tipo_cliente"), default="CORPORATIVO")
    ceco_asociado = Column(String(20))
    created_at = Column(TIMESTAMP, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)
    
# Modelos para gestión de proveedores

class Proveedor(Base):
    __tablename__ = "proveedores"
    id_proveedor = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    nit = Column(String(20), unique=True)
    contacto = Column(String(100))
    telefono = Column(String(50))
    email = Column(String(100))
    direccion = Column(String(255))
    ciudad = Column(String(100))
    dias_credito = Column(Integer, default=30)
    categoria = Column(Enum("FABRICANTE", "DISTRIBUIDOR", "SERVICIO_TECNICO", "LOGISTICA", name="proveedor_categoria"), default="DISTRIBUIDOR")
    created_at = Column(TIMESTAMP, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

# Modelos para gestión de proyectos

class Proyecto(Base):
    __tablename__ = "proyectos"
    id_proyecto = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"))
    nombre_proyecto = Column(String(200), nullable=False)
    centro_costos = Column(String(50))
    ubicacion = Column(String(200))
    estado = Column(Enum("ACTIVO", "FINALIZADO", "PAUSADO", name="proyecto_estado"), default="ACTIVO")
    fecha_inicio = Column(Date)
    fecha_fin_estimada = Column(Date)
    fecha_cierre_real = Column(Date)
    descripcion = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    cliente = relationship("Cliente")
