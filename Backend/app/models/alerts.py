from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey, DECIMAL, Boolean, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    resolved_at = Column(DateTime, nullable=True)
    tipo = Column(String(50), nullable=False)
    prioridad = Column(Enum('critica','alta','media','baja'), nullable=False)
    estado = Column(Enum('activa','reconocida','resuelta','ignorada'), default='activa')
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    item_id = Column(Integer, ForeignKey("items.id_item"), nullable=False)
    item_nombre = Column(String(200))
    valor_actual = Column(DECIMAL(10, 2))
    valor_umbral = Column(DECIMAL(10, 2))
    unidad = Column(String(20))
    asignado_a = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    solucion = Column(Text, nullable=True)

class AlertRule(Base):
    __tablename__ = "alert_rules"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    activa = Column(Boolean, default=True)
    prioridad = Column(Enum('critica','alta','media','baja'), nullable=False)
    
    # Guardaremos JSON como texto
    
    condicion = Column(Text, nullable=False) 
    descripcion = Column(Text)
    cooldown_h = Column(Integer, default=24)
