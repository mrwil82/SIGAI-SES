from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, Field
from typing import Optional
from datetime import datetime, date

from app.schemas.inventory import Regional


def nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre es obligatorio")
    return v.strip()


def email_valido_o_none(v: Optional[str]) -> Optional[str]:
    if v is not None and v.strip() == "":
        return None
    return v


class ClienteBase(BaseModel):
    nombre: str = Field(..., description="Nombre del cliente")
    nit: Optional[str] = None
    contacto: Optional[str] = None
    email_contacto: Optional[EmailStr] = Field(default=None, description="Email de contacto")
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    tipo_cliente: str = "CORPORATIVO"
    ceco_asociado: Optional[str] = None
    id_regional: Optional[int] = None

    _validate_nombre = field_validator("nombre", mode="before")(nombre_obligatorio)
    _validate_email = field_validator("email_contacto", mode="before")(email_valido_o_none)


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, description="Nombre del cliente")
    nit: Optional[str] = None
    contacto: Optional[str] = None
    email_contacto: Optional[EmailStr] = Field(default=None, description="Email de contacto")
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    tipo_cliente: Optional[str] = None
    ceco_asociado: Optional[str] = None
    id_regional: Optional[int] = None

    _validate_nombre = field_validator("nombre", mode="before")(nombre_obligatorio)
    _validate_email = field_validator("email_contacto", mode="before")(email_valido_o_none)


class Cliente(ClienteBase):
    id_cliente: int
    created_at: datetime
    regional_rel: Optional[Regional] = None
    model_config = ConfigDict(from_attributes=True)


def proyecto_nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre del proyecto es obligatorio")
    return v.strip()


class ProyectoBase(BaseModel):
    id_cliente: Optional[int] = None
    id_regional: Optional[int] = None
    nombre_proyecto: str = Field(..., description="Nombre del proyecto")
    centro_costos: Optional[str] = None
    ubicacion: Optional[str] = None
    estado: str = "ACTIVO"
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_cierre_real: Optional[date] = None
    descripcion: Optional[str] = None

    _validate_nombre = field_validator("nombre_proyecto", mode="before")(proyecto_nombre_obligatorio)


class ProyectoCreate(ProyectoBase):
    pass


class ProyectoUpdate(BaseModel):
    id_regional: Optional[int] = None
    nombre_proyecto: Optional[str] = Field(default=None, description="Nombre del proyecto")
    centro_costos: Optional[str] = None
    ubicacion: Optional[str] = None
    estado: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_cierre_real: Optional[date] = None
    descripcion: Optional[str] = None

    _validate_nombre = field_validator("nombre_proyecto", mode="before")(proyecto_nombre_obligatorio)


class Proyecto(ProyectoBase):
    id_proyecto: int
    created_at: datetime
    regional_rel: Optional[Regional] = None
    model_config = ConfigDict(from_attributes=True)


def proveedor_nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre del proveedor es obligatorio")
    return v.strip()


class ProveedorBase(BaseModel):
    nombre: str = Field(..., description="Nombre del proveedor")
    nit: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = Field(default=None, description="Email del proveedor")
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    dias_credito: int = 30
    categoria: str = "DISTRIBUIDOR"

    _validate_nombre = field_validator("nombre", mode="before")(proveedor_nombre_obligatorio)
    _validate_email = field_validator("email", mode="before")(email_valido_o_none)


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, description="Nombre del proveedor")
    nit: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = Field(default=None, description="Email del proveedor")
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    dias_credito: Optional[int] = None
    categoria: Optional[str] = None

    _validate_nombre = field_validator("nombre", mode="before")(proveedor_nombre_obligatorio)
    _validate_email = field_validator("email", mode="before")(email_valido_o_none)


class Proveedor(ProveedorBase):
    id_proveedor: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


def garantia_falla_obligatoria(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("La falla reportada es obligatoria")
    return v.strip()


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
    falla_reportada: str = Field(..., description="Descripción de la falla")
    comentarios_proceso: Optional[str] = None
    estado_proceso: str = "REGISTRADO"

    _validate_falla = field_validator("falla_reportada", mode="before")(garantia_falla_obligatoria)


class GarantiaCreate(GarantiaBase):
    pass


class GarantiaUpdate(BaseModel):
    rma_proveedor: Optional[str] = None
    estado_proceso: Optional[str] = None
    comentarios_proceso: Optional[str] = None
    fecha_recibido_reparado: Optional[datetime] = None
    tipo_resolucion: Optional[str] = None
    falla_reportada: Optional[str] = Field(default=None, description="Descripción de la falla")

    _validate_falla = field_validator("falla_reportada", mode="before")(garantia_falla_obligatoria)


from app.schemas.inventory import Activo, Regional


class Garantia(GarantiaBase):
    id_garantia: int
    fecha_recibido_reparado: Optional[datetime] = None
    activo: Optional[Activo] = None
    proveedor: Optional[Proveedor] = None
    model_config = ConfigDict(from_attributes=True)

    @field_validator(
        "fecha_envio",
        "fecha_recibido_reparado",
        "fecha_limite_estimada",
        "fecha_inicio_garantia",
        mode="before",
    )
    @classmethod
    def validate_date(cls, v):
        if v is not None and isinstance(v, str) and v.startswith("0000"):
            return None
        return v
