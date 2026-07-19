from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AuditUserInfo(BaseModel):
    id_usuario: int
    nombre: Optional[str] = None
    email: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AuditLogBase(BaseModel):
    id_usuario: int
    tabla_afectada: str
    accion: str
    id_registro: Optional[int] = None
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None

class AuditLog(AuditLogBase):
    id_log: int
    fecha_accion: datetime
    usuario: Optional[AuditUserInfo] = None
    model_config = ConfigDict(from_attributes=True)
