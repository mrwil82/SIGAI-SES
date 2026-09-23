from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, Field
from typing import Optional
from datetime import datetime, date

from app.schemas.inventory import Regional


def nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre es obligatorio")
    return v.strip()


def empty_str_to_none(v: Optional[str]) -> Optional[str]:
    """Convierte string vacío a None para campos únicos opcionales"""
    if v is not None and v.strip() == "":
        return None
    return v


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
    _validate_nit = field_validator("nit", mode="before")(empty_str_to_none)
    _validate_ceco = field_validator("ceco_asociado", mode="before")(empty_str_to_none)
    _validate_contacto = field_validator("contacto", mode="before")(empty_str_to_none)
    _validate_telefono = field_validator("telefono", mode="before")(empty_str_to_none)
    _validate_direccion = field_validator("direccion", mode="before")(empty_str_to_none)
    _validate_ciudad = field_validator("ciudad", mode="before")(empty_str_to_none)
    _validate_departamento = field_validator("departamento", mode="before")(empty_str_to_none)


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
    _validate_centro_costos = field_validator("centro_costos", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion", mode="before")(empty_str_to_none)
    _validate_descripcion = field_validator("descripcion", mode="before")(empty_str_to_none)


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
    _validate_centro_costos = field_validator("centro_costos", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion", mode="before")(empty_str_to_none)
    _validate_descripcion = field_validator("descripcion", mode="before")(empty_str_to_none)


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
    _validate_nit = field_validator("nit", mode="before")(empty_str_to_none)
    _validate_contacto = field_validator("contacto", mode="before")(empty_str_to_none)
    _validate_telefono = field_validator("telefono", mode="before")(empty_str_to_none)
    _validate_direccion = field_validator("direccion", mode="before")(empty_str_to_none)
    _validate_ciudad = field_validator("ciudad", mode="before")(empty_str_to_none)


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
    _validate_nit = field_validator("nit", mode="before")(empty_str_to_none)
    _validate_contacto = field_validator("contacto", mode="before")(empty_str_to_none)
    _validate_telefono = field_validator("telefono", mode="before")(empty_str_to_none)
    _validate_direccion = field_validator("direccion", mode="before")(empty_str_to_none)
    _validate_ciudad = field_validator("ciudad", mode="before")(empty_str_to_none)


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
    _validate_numero_caso = field_validator("numero_caso_interno", mode="before")(empty_str_to_none)
    _validate_rma = field_validator("rma_proveedor", mode="before")(empty_str_to_none)
    _validate_factura = field_validator("numero_factura_compra", mode="before")(empty_str_to_none)
    _validate_credenciales = field_validator("credenciales_equipo", mode="before")(empty_str_to_none)
    _validate_area = field_validator("area_origen", mode="before")(empty_str_to_none)
    _validate_comentarios = field_validator("comentarios_proceso", mode="before")(empty_str_to_none)


class GarantiaCreate(GarantiaBase):
    pass


class GarantiaUpdate(BaseModel):
    rma_proveedor: Optional[str] = None
    estado_proceso: Optional[str] = None
    comentarios_proceso: Optional[str] = None
    fecha_recibido_reparado: Optional[datetime] = None
    tipo_resolucion: Optional[str] = None
    falla_reportada: Optional[str] = Field(default=None, description="Descripción de la falla")
    numero_caso_interno: Optional[str] = None
    numero_factura_compra: Optional[str] = None
    credenciales_equipo: Optional[str] = None
    area_origen: Optional[str] = None

    _validate_falla = field_validator("falla_reportada", mode="before")(garantia_falla_obligatoria)
    _validate_numero_caso = field_validator("numero_caso_interno", mode="before")(empty_str_to_none)
    _validate_rma = field_validator("rma_proveedor", mode="before")(empty_str_to_none)
    _validate_factura = field_validator("numero_factura_compra", mode="before")(empty_str_to_none)
    _validate_credenciales = field_validator("credenciales_equipo", mode="before")(empty_str_to_none)
    _validate_area = field_validator("area_origen", mode="before")(empty_str_to_none)
    _validate_comentarios = field_validator("comentarios_proceso", mode="before")(empty_str_to_none)


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
