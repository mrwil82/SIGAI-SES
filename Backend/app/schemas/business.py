from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional
from datetime import datetime, date

class ClienteBase(BaseModel):
    nombre: str
    nit: Optional[str] = None
    contacto: Optional[str] = None
    email_contacto: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    tipo_cliente: str = "CORPORATIVO"
    ceco_asociado: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    contacto: Optional[str] = None
    email_contacto: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    tipo_cliente: Optional[str] = None
    ceco_asociado: Optional[str] = None

class Cliente(ClienteBase):
    id_cliente: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProyectoBase(BaseModel):
    id_cliente: Optional[int] = None
    nombre_proyecto: str
    centro_costos: Optional[str] = None
    ubicacion: Optional[str] = None
    estado: str = "ACTIVO"
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_cierre_real: Optional[date] = None
    descripcion: Optional[str] = None

class ProyectoCreate(ProyectoBase):
    pass

class ProyectoUpdate(BaseModel):
    nombre_proyecto: Optional[str] = None
    centro_costos: Optional[str] = None
    ubicacion: Optional[str] = None
    estado: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_cierre_real: Optional[date] = None
    descripcion: Optional[str] = None

class Proyecto(ProyectoBase):
    id_proyecto: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProveedorBase(BaseModel):
    nombre: str
    nit: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    dias_credito: int = 30
    categoria: str = "DISTRIBUIDOR"

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    dias_credito: Optional[int] = None
    categoria: Optional[str] = None

class Proveedor(ProveedorBase):
    id_proveedor: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GarantiaBase(BaseModel):
    id_activo: int
    id_proveedor: Optional[int] = None
    id_acta_devolucion: Optional[int] = None
    numero_caso_interno: Optional[str] = None
    rma_proveedor: Optional[str] = None
    numero_factura_compra: Optional[str] = None
    fecha_envio: Optional[datetime] = None
    fecha_limite_estimada: Optional[datetime] = None
    fecha_inicio_garantia: Optional[datetime] = None
    meses_garantia: Optional[int] = None
    credenciales_equipo: Optional[str] = None
    area_origen: Optional[str] = None
    tipo_resolucion: str = "PENDIENTE"
    falla_reportada: Optional[str] = None
    comentarios_proceso: Optional[str] = None
    estado_proceso: str = "REGISTRADO"

class GarantiaCreate(GarantiaBase):
    pass

class GarantiaUpdate(BaseModel):
    rma_proveedor: Optional[str] = None
    estado_proceso: Optional[str] = None
    comentarios_proceso: Optional[str] = None
    fecha_recibido_reparado: Optional[datetime] = None
    tipo_resolucion: Optional[str] = None

from app.schemas.inventory import Activo

class Garantia(GarantiaBase):
    id_garantia: int
    fecha_recibido_reparado: Optional[datetime] = None
    activo: Optional[Activo] = None
    proveedor: Optional[Proveedor] = None
    model_config = ConfigDict(from_attributes=True)

    @field_validator('fecha_envio', 'fecha_recibido_reparado', 'fecha_limite_estimada', 'fecha_inicio_garantia', mode='before')
    @classmethod
    def validate_date(cls, v):
        if v is not None and isinstance(v, str) and v.startswith('0000'):
            return None
        return v
