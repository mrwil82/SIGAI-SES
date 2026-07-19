from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class DetalleActaBase(BaseModel):
    id_item: int
    id_activo: Optional[int] = None
    cantidad: Decimal
    notas_estado: Optional[str] = None

class DetalleActaCreate(DetalleActaBase):
    pass

class DetalleActa(DetalleActaBase):
    id_detalle: int
    model_config = ConfigDict(from_attributes=True)

class ActaEntregaBase(BaseModel):
    id_usuario_tecnico: int
    id_usuario_representante: int
    id_proyecto: Optional[int] = None
    tipo_acta: str
    estado_acta: str = "BORRADOR"
    observaciones: Optional[str] = None
    numero_acta: Optional[str] = None

class ActaEntregaCreate(ActaEntregaBase):
    detalles: List[DetalleActaCreate]

class ActaEntrega(ActaEntregaBase):
    id_acta: int
    fecha_entrega: datetime
    detalles: List[DetalleActa] = []
    url_pdf: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
