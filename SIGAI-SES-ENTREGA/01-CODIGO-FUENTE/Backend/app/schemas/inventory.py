from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


def empty_str_to_none(v: Optional[str]) -> Optional[str]:
    """Convierte string vacío a None para campos únicos opcionales"""
    if v is not None and v.strip() == "":
        return None
    return v


# Regionales


def regional_nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre de la regional es obligatorio")
    return v.strip()


class RegionalBase(BaseModel):
    nombre: str = Field(..., description="Nombre de la regional")
    ciudad: Optional[str] = None

    _validate_nombre = field_validator("nombre", mode="before")(regional_nombre_obligatorio)


class RegionalCreate(RegionalBase):
    pass


class Regional(RegionalBase):
    id_regional: int
    model_config = ConfigDict(from_attributes=True)


# Items


def item_nombre_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El nombre del equipo es obligatorio")
    return v.strip()


class StockBulkRead(BaseModel):
    cantidad_actual: Decimal
    punto_recompra_alerta: bool
    model_config = ConfigDict(from_attributes=True)


class ItemBase(BaseModel):
    categoria: str = Field(..., description="Categoría del item")
    sub_categoria: Optional[str] = None
    nombre_equipo: str = Field(..., description="Nombre del equipo")
    marca: Optional[str] = None
    referencia: Optional[str] = None
    codigo_item_interno: Optional[str] = None
    ubicacion: Optional[str] = None
    unidad_medida: str = "UND"
    stock_minimo: int = 5
    compra_maxima: int = 20
    costo_unitario: Decimal = Decimal("0.00")
    moneda: str = "COP"

    _validate_nombre = field_validator("nombre_equipo", mode="before")(item_nombre_obligatorio)
    _validate_marca = field_validator("marca", mode="before")(empty_str_to_none)
    _validate_referencia = field_validator("referencia", mode="before")(empty_str_to_none)
    _validate_codigo = field_validator("codigo_item_interno", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion", mode="before")(empty_str_to_none)


class ItemCreate(ItemBase):
    cantidad_inicial: Optional[Decimal] = Decimal("0.00")


class ItemUpdate(BaseModel):
    categoria: Optional[str] = None
    sub_categoria: Optional[str] = None
    nombre_equipo: Optional[str] = Field(default=None, description="Nombre del equipo")
    marca: Optional[str] = None
    referencia: Optional[str] = None
    codigo_item_interno: Optional[str] = None
    stock_minimo: Optional[int] = None
    compra_maxima: Optional[int] = None
    costo_unitario: Optional[Decimal] = None
    moneda: Optional[str] = None
    unidad_medida: Optional[str] = None
    cantidad_inicial: Optional[Decimal] = None
    ubicacion: Optional[str] = None

    _validate_nombre = field_validator("nombre_equipo", mode="before")(item_nombre_obligatorio)
    _validate_marca = field_validator("marca", mode="before")(empty_str_to_none)
    _validate_referencia = field_validator("referencia", mode="before")(empty_str_to_none)
    _validate_codigo = field_validator("codigo_item_interno", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion", mode="before")(empty_str_to_none)


class Item(ItemBase):
    id_item: int
    created_at: datetime
    deleted_at: Optional[datetime] = None
    stock_bulk: Optional[StockBulkRead] = None
    model_config = ConfigDict(from_attributes=True)


# Activos


def activo_serial_obligatorio(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("El número de serie es obligatorio")
    return v.strip()


class ActivoBase(BaseModel):
    id_item: int
    serial: str = Field(..., description="Número de serie")
    estado_actual: str = "DISPONIBLE"
    condicion_fisica: str = "NUEVO"
    area_asignada: Optional[str] = None
    responsable_sitio: Optional[str] = None
    ubicacion_fisica: Optional[str] = None
    id_proyecto_actual: Optional[int] = None
    id_cliente_actual: Optional[int] = None
    id_proveedor_compra: Optional[int] = None
    numero_factura_compra: Optional[str] = None
    fecha_compra: Optional[date] = None
    activo_fijo_securitas: Optional[str] = None
    credenciales_tecnicas: Optional[str] = None
    observaciones: Optional[str] = None

    _validate_serial = field_validator("serial", mode="before")(activo_serial_obligatorio)
    _validate_area = field_validator("area_asignada", mode="before")(empty_str_to_none)
    _validate_responsable = field_validator("responsable_sitio", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion_fisica", mode="before")(empty_str_to_none)
    _validate_factura = field_validator("numero_factura_compra", mode="before")(empty_str_to_none)
    _validate_activo_fijo = field_validator("activo_fijo_securitas", mode="before")(empty_str_to_none)
    _validate_credenciales = field_validator("credenciales_tecnicas", mode="before")(empty_str_to_none)
    _validate_observaciones = field_validator("observaciones", mode="before")(empty_str_to_none)


class ActivoCreate(ActivoBase):
    pass


class ActivoUpdate(BaseModel):
    estado_actual: Optional[str] = None
    condicion_fisica: Optional[str] = None
    area_asignada: Optional[str] = None
    responsable_sitio: Optional[str] = None
    ubicacion_fisica: Optional[str] = None
    id_proyecto_actual: Optional[int] = None
    id_cliente_actual: Optional[int] = None
    id_proveedor_compra: Optional[int] = None
    numero_factura_compra: Optional[str] = None
    fecha_compra: Optional[date] = None
    activo_fijo_securitas: Optional[str] = None
    credenciales_tecnicas: Optional[str] = None
    observaciones: Optional[str] = None
    calificacion_tecnica: Optional[str] = None
    serial: Optional[str] = Field(default=None, description="Número de serie")

    _validate_serial = field_validator("serial", mode="before")(activo_serial_obligatorio)
    _validate_area = field_validator("area_asignada", mode="before")(empty_str_to_none)
    _validate_responsable = field_validator("responsable_sitio", mode="before")(empty_str_to_none)
    _validate_ubicacion = field_validator("ubicacion_fisica", mode="before")(empty_str_to_none)
    _validate_factura = field_validator("numero_factura_compra", mode="before")(empty_str_to_none)
    _validate_activo_fijo = field_validator("activo_fijo_securitas", mode="before")(empty_str_to_none)
    _validate_credenciales = field_validator("credenciales_tecnicas", mode="before")(empty_str_to_none)
    _validate_observaciones = field_validator("observaciones", mode="before")(empty_str_to_none)


class Activo(ActivoBase):
    id_activo: int
    updated_at: datetime
    item: Optional[Item] = None
    model_config = ConfigDict(from_attributes=True)


# Movimientos


class MovimientoBase(BaseModel):
    id_usuario: int
    id_item: int
    id_activo: Optional[int] = None
    id_acta: Optional[int] = None
    tipo_movimiento: str
    cantidad: Decimal = Decimal("1.00")
    origen: Optional[str] = None
    destino: Optional[str] = None
    notas: Optional[str] = None


class MovimientoCreate(MovimientoBase):
    pass


class Movimiento(MovimientoBase):
    id_movimiento: int
    fecha_movimiento: datetime
    item: Optional[Item] = None
    activo: Optional[Activo] = None
    model_config = ConfigDict(from_attributes=True)


class ItemDesmonte(BaseModel):
    id_item: int
    cantidad: int = 1


class DesmonteBulkCreate(BaseModel):
    items: List[ItemDesmonte]
    id_proyecto: Optional[int] = None
    id_cliente: Optional[int] = None


# Historial Ubicaciones


class HistorialUbicacionBase(BaseModel):
    id_activo: int
    ubicacion_desde: str
    id_usuario: Optional[int] = None


class HistorialUbicacion(HistorialUbicacionBase):
    id_historial: int
    fecha_desde: datetime
    fecha_hasta: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# EPP


class EPPAssignacionBase(BaseModel):
    id_activo: int
    id_usuario: int
    talla: Optional[str] = None
    fecha_entrega: date
    fecha_vencimiento: Optional[date] = None
    id_acta: Optional[int] = None
    estado: str = "ACTIVO"


class EPPAssignacionCreate(EPPAssignacionBase):
    pass


class EPPAssignacion(EPPAssignacionBase):
    id_asignacion: int
    model_config = ConfigDict(from_attributes=True)
