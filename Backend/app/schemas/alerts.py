from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertEstado(str, Enum):
    ACTIVA = "activa"
    RECONOCIDA = "reconocida"
    RESUELTA = "resuelta"
    IGNORADA = "ignorada"

class AlertPrioridad(str, Enum):
    CRITICA = "critica"
    ALTA = "alta"
    MEDIA = "media"
    BAJA = "baja"

class AlertUpdate(BaseModel):
    estado: Optional[AlertEstado] = None
    notas: Optional[str] = None
    titulo: Optional[str] = None
    prioridad: Optional[AlertPrioridad] = None
    valor_actual: Optional[float] = None
    solucion: Optional[str] = None
    asignado_a: Optional[int] = None

class AlertRead(BaseModel):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    tipo: str
    prioridad: AlertPrioridad
    estado: AlertEstado
    titulo: str
    descripcion: Optional[str] = None
    item_nombre: Optional[str] = None
    valor_actual: Optional[float] = None
    valor_umbral: Optional[float] = None
    asignado_a: Optional[int] = None
    solucion: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
