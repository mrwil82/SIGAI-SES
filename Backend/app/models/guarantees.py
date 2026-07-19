from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Garantia(Base):
    __tablename__ = "garantias"
    id_garantia = Column(Integer, primary_key=True, index=True)
    id_activo = Column(Integer, ForeignKey("activos.id_activo"))
    id_proveedor = Column(Integer, ForeignKey("proveedores.id_proveedor"))
    id_acta_devolucion = Column(Integer, ForeignKey("actas_entrega.id_acta"), nullable=True)
    numero_caso_interno = Column(String(50), unique=True)
    rma_proveedor = Column(String(50))
    numero_factura_compra = Column(String(50))
    fecha_envio = Column(DateTime)
    fecha_limite_estimada = Column(DateTime)
    fecha_recibido_reparado = Column(DateTime)
    credenciales_equipo = Column(String(255))
    area_origen = Column(String(100))
    fecha_inicio_garantia = Column(DateTime)
    meses_garantia = Column(Integer)
    tipo_resolucion = Column(Enum('REPARADO','REEMPLAZADO','SIN_COBERTURA','PENDIENTE'), default='PENDIENTE')
    falla_reportada = Column(Text)
    comentarios_proceso = Column(Text)
    estado_proceso = Column(Enum("REGISTRADO", "ENVIADO_PROVEEDOR", "RECIBIDO_PROVEEDOR", "RESUELTO_REEMPLAZADO", "ENTREGADO_CLIENTE"), default="REGISTRADO")
    
    activo = relationship("app.models.inventory.Activo")
    proveedor = relationship("app.models.business.Proveedor")
    acta_devolucion = relationship("app.models.deliveries.ActaEntrega")
