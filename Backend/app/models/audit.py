from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id_log = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    tabla_afectada = Column(String(50), nullable=False)
    accion = Column(Enum("CREATE", "UPDATE", "DELETE", "LOGIN"), nullable=False)
    id_registro = Column(Integer) 
    valor_anterior = Column(Text, nullable=True) 
    valor_nuevo = Column(Text, nullable=True)     
    fecha_accion = Column(TIMESTAMP, server_default=func.now())
    usuario = relationship("app.models.user.Usuario")
