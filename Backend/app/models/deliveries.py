from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class ActaEntrega(Base):
    __tablename__ = "actas_entrega"
    id_acta = Column(Integer, primary_key=True, index=True)
    numero_acta = Column(String(50), unique=True)
    id_usuario_tecnico = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_usuario_representante = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_proyecto = Column(Integer, ForeignKey("proyectos.id_proyecto"))
    tipo_acta = Column(Enum("ENTREGA_EPP", "ENTREGA_HERRAMIENTA", "DESPACHO_PROYECTO", "DEVOLUCION", "INGRESO_DESMONTE", name="tipo_acta"), nullable=False)
    estado_acta = Column(Enum("BORRADOR", "FIRMADA", "ANULADA", name="estado_acta"), server_default="BORRADOR")
    fecha_entrega = Column(TIMESTAMP, server_default=func.now())
    url_pdf = Column(String(255))
    firma_tecnico_blob = Column(Text)
    observaciones = Column(Text)
    
    tecnico = relationship("app.models.user.Usuario", foreign_keys=[id_usuario_tecnico])
    representante = relationship("app.models.user.Usuario", foreign_keys=[id_usuario_representante])
    proyecto = relationship("app.models.business.Proyecto")
    detalles = relationship("DetalleActaEntrega", back_populates="acta")

class DetalleActaEntrega(Base):
    __tablename__ = "detalles_acta_entrega"
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_acta = Column(Integer, ForeignKey("actas_entrega.id_acta"))
    id_item = Column(Integer, ForeignKey("items.id_item"))
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=True)
    cantidad = Column(DECIMAL(12, 2), nullable=False)
    notas_estado = Column(String(255))
    
    acta = relationship("ActaEntrega", back_populates="detalles")
    item = relationship("app.models.inventory.Item")
    activo = relationship("app.models.inventory.Activo")
