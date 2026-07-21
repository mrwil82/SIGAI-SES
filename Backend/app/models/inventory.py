from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, ForeignKey, DECIMAL, Text, Date, Boolean  # type: ignore[import]
from sqlalchemy.orm import relationship  # type: ignore[import]
from sqlalchemy.sql import func  # type: ignore[import]
from app.db.session import Base

class Item(Base):
    __tablename__ = "items"
    id_item = Column(Integer, primary_key=True, index=True)
    categoria = Column(Enum("MONITOREO", "MANTENIMIENTO", "INSTALACION", "SOLUCIONES", "EPP", "CONSUMIBLE", "HERRAMIENTA_LAB", "REPUESTO", name="item_categoria"), nullable=False)
    sub_categoria = Column(String(100))
    nombre_equipo = Column(String(255), nullable=False)
    marca = Column(String(100))
    referencia = Column(String(100), unique=True)
    codigo_item_interno = Column(String(50), unique=True)
    unidad_medida = Column(String(20), default="UND")
    stock_minimo = Column(Integer, default=5)
    compra_maxima = Column(Integer, default=20)
    costo_unitario = Column(DECIMAL(12, 2), default=0.00)
    moneda = Column(Enum("COP", "USD", "EUR", name="moneda"), server_default="COP")
    created_at = Column(TIMESTAMP, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)
    
    stock_bulk = relationship("StockBulk", back_populates="item", uselist=False, cascade="all, delete-orphan")

class Activo(Base):
    __tablename__ = "activos"
    id_activo = Column(Integer, primary_key=True, index=True)
    id_item = Column(Integer, ForeignKey("items.id_item"))
    serial = Column(String(100), unique=True, nullable=False)
    estado_actual = Column(Enum("DISPONIBLE", "INSTALADO", "EN_GARANTIA", "REPARADO", "LABORATORIO", "DESMONTE", "BAJA", "OBSOLETO", name="estado_activo"), default="DISPONIBLE")
    condicion_fisica = Column(Enum("NUEVO", "USADO_BUENO", "PARA_REPARAR", "SULFATADO", "SIN_CONTRAPESOS", "DAÑADO", name="condicion_fisica"), default="NUEVO")
    area_asignada = Column(String(100))
    responsable_sitio = Column(String(100))
    ubicacion_fisica = Column(String(255))
    id_proyecto_actual = Column(Integer, ForeignKey("proyectos.id_proyecto"))
    id_cliente_actual = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    id_proveedor_compra = Column(Integer, ForeignKey("proveedores.id_proveedor"))
    numero_factura_compra = Column(String(50))
    fecha_compra = Column(Date)
    activo_fijo_securitas = Column(String(50))
    credenciales_tecnicas = Column(String(255)) # IP, Usuarios, Claves
    observaciones = Column(Text)
    fecha_ingreso_laboratorio = Column(TIMESTAMP, nullable=True)
    fecha_triaje = Column(TIMESTAMP, nullable=True)
    calificacion_tecnica = Column(Enum("BUENO", "RECUPERABLE", "DESECHO", name="calificacion_tecnica"), default="BUENO")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    item = relationship("Item")
    proyecto = relationship("app.models.business.Proyecto")
    cliente_actual = relationship("app.models.business.Cliente")
    proveedor_compra = relationship("app.models.business.Proveedor")
    historial_ubicaciones = relationship("HistorialUbicacion", back_populates="activo")

class StockBulk(Base):
    __tablename__ = "stock_bulk"
    id_item = Column(Integer, ForeignKey("items.id_item"), primary_key=True)
    cantidad_actual = Column(DECIMAL(12, 2), default=0.00)
    punto_recompra_alerta = Column(Boolean, default=False)
    
    item = relationship("Item", back_populates="stock_bulk")

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"
    id_movimiento = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=True)
    id_item = Column(Integer, ForeignKey("items.id_item"))
    id_acta = Column(Integer, ForeignKey("actas_entrega.id_acta"), nullable=True)
    tipo_movimiento = Column(Enum("ENTRADA_COMPRA", "SALIDA_INSTALACION", "TRASLADO", "DEVOLUCION", "BAJA_DAÑO", "AJUSTE", "INGRESO_DESMONTE", name="tipo_movimiento"), nullable=False)
    cantidad = Column(DECIMAL(12, 2), default=1.00)
    origen = Column(String(100))
    destino = Column(String(100))
    fecha_movimiento = Column(TIMESTAMP, server_default=func.now())
    notes = Column("notas", Text)
    
    usuario = relationship("app.models.user.Usuario")
    activo = relationship("Activo")
    item = relationship("Item")
    acta = relationship("app.models.deliveries.ActaEntrega")

class HistorialUbicacion(Base):
    __tablename__ = "historial_ubicaciones"
    id_historial = Column(Integer, primary_key=True, index=True)
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=False)
    ubicacion_desde = Column(String(255), nullable=False)
    fecha_desde = Column(TIMESTAMP, server_default=func.now())
    fecha_hasta = Column(TIMESTAMP, nullable=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    
    activo = relationship("Activo", back_populates="historial_ubicaciones")
    usuario = relationship("app.models.user.Usuario")

class EPPAssignacion(Base):
    __tablename__ = "epp_asignaciones"
    id_asignacion = Column(Integer, primary_key=True, index=True)
    id_activo = Column(Integer, ForeignKey("activos.id_activo"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    talla = Column(String(10))
    fecha_entrega = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date)
    id_acta = Column(Integer, ForeignKey("actas_entrega.id_acta"))
    estado = Column(Enum("ACTIVO", "DEVUELTO", "VENCIDO", "PERDIDO", name="epp_estado"), server_default="ACTIVO")
    
    activo = relationship("Activo")
    usuario = relationship("app.models.user.Usuario")
    acta = relationship("app.models.deliveries.ActaEntrega")
