"""database_optimization_v3

Revision ID: 02e89ad94861
Revises: 4372a28e665b
Create Date: 2026-05-27 18:56:52.133807

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '02e89ad94861'
down_revision: Union[str, Sequence[str], None] = '4372a28e665b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Nuevas Tablas
    
    # Tabla regionales
    op.create_table(
        'regionales',
        sa.Column('id_regional', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id_regional')
    )
    
    # Tabla sesiones_usuario
    op.create_table(
        'sesiones_usuario',
        sa.Column('id_sesion', sa.Integer(), nullable=False),
        sa.Column('id_usuario', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('ip_origen', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('expires_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('revocado', sa.Boolean(), server_default=sa.text('0'), nullable=True),
        sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id_usuario'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_sesion')
    )
    op.create_index('idx_token_hash', 'sesiones_usuario', ['token_hash'], unique=False)

    # Tabla historial_ubicaciones
    op.create_table(
        'historial_ubicaciones',
        sa.Column('id_historial', sa.Integer(), nullable=False),
        sa.Column('id_activo', sa.Integer(), nullable=False),
        sa.Column('ubicacion_desde', sa.String(length=255), nullable=False),
        sa.Column('fecha_desde', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('fecha_hasta', sa.TIMESTAMP(), nullable=True),
        sa.Column('id_usuario', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['id_activo'], ['activos.id_activo'], ),
        sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id_usuario'], ),
        sa.PrimaryKeyConstraint('id_historial')
    )

    # Tabla epp_asignaciones
    op.create_table(
        'epp_asignaciones',
        sa.Column('id_asignacion', sa.Integer(), nullable=False),
        sa.Column('id_activo', sa.Integer(), nullable=False),
        sa.Column('id_usuario', sa.Integer(), nullable=False),
        sa.Column('talla', sa.String(length=10), nullable=True),
        sa.Column('fecha_entrega', sa.Date(), nullable=False),
        sa.Column('fecha_vencimiento', sa.Date(), nullable=True),
        sa.Column('id_acta', sa.Integer(), nullable=True),
        sa.Column('estado', sa.Enum('ACTIVO', 'DEVUELTO', 'VENCIDO', 'PERDIDO'), server_default='ACTIVO', nullable=True),
        sa.ForeignKeyConstraint(['id_acta'], ['actas_entrega.id_acta'], ),
        sa.ForeignKeyConstraint(['id_activo'], ['activos.id_activo'], ),
        sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id_usuario'], ),
        sa.PrimaryKeyConstraint('id_asignacion')
    )

    # 2. Modificaciones en Tablas Existentes

    # Usuarios
    op.add_column('usuarios', sa.Column('id_regional', sa.Integer(), nullable=True))
    op.create_foreign_key('usuarios_ibfk_regional', 'usuarios', 'regionales', ['id_regional'], ['id_regional'])

    # Actas Entrega
    op.alter_column('actas_entrega', 'firma_tecnico_blob',
               existing_type=mysql.TEXT(),
               type_=mysql.MEDIUMTEXT(),
               existing_nullable=True)
    op.add_column('actas_entrega', sa.Column('estado_acta', sa.Enum('BORRADOR', 'FIRMADA', 'ANULADA'), server_default='BORRADOR', nullable=True))
    op.add_column('actas_entrega', sa.Column('observaciones', sa.Text(), nullable=True))

    # Activos
    op.add_column('activos', sa.Column('id_proveedor_compra', sa.Integer(), nullable=True))
    op.add_column('activos', sa.Column('numero_factura_compra', sa.String(length=50), nullable=True))
    op.add_column('activos', sa.Column('fecha_compra', sa.Date(), nullable=True))
    op.create_foreign_key('activos_ibfk_3', 'activos', 'proveedores', ['id_proveedor_compra'], ['id_proveedor'])
    op.create_index('idx_activos_estado', 'activos', ['estado_actual'], unique=False)
    op.create_index('idx_activos_area', 'activos', ['area_asignada'], unique=False)

    # Audit Logs
    # Primero intentamos cambiar a JSON si es compatible, si no se queda como TEXT pero con índices
    op.create_index('idx_audit_tabla_fecha', 'audit_logs', ['tabla_afectada', 'fecha_accion'], unique=False)
    op.create_index('idx_audit_accion_fecha', 'audit_logs', ['accion', 'fecha_accion'], unique=False)
    op.create_index('idx_audit_fecha', 'audit_logs', ['fecha_accion'], unique=False)

    # Clientes
    op.add_column('clientes', sa.Column('direccion', sa.String(length=255), nullable=True))
    op.add_column('clientes', sa.Column('ciudad', sa.String(length=100), nullable=True))
    op.add_column('clientes', sa.Column('departamento', sa.String(length=100), nullable=True))
    op.add_column('clientes', sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True))

    # Proveedores
    op.add_column('proveedores', sa.Column('nit', sa.String(length=20), nullable=True))
    op.add_column('proveedores', sa.Column('direccion', sa.String(length=255), nullable=True))
    op.add_column('proveedores', sa.Column('ciudad', sa.String(length=100), nullable=True))
    op.add_column('proveedores', sa.Column('dias_credito', sa.Integer(), server_default='30', nullable=True))
    op.add_column('proveedores', sa.Column('categoria', sa.Enum('FABRICANTE', 'DISTRIBUIDOR', 'SERVICIO_TECNICO', 'LOGISTICA'), server_default='DISTRIBUIDOR', nullable=True))
    op.add_column('proveedores', sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True))
    op.create_unique_constraint('uq_proveedor_nit', 'proveedores', ['nit'])

    # Proyectos
    op.add_column('proyectos', sa.Column('fecha_inicio', sa.Date(), nullable=True))
    op.add_column('proyectos', sa.Column('fecha_fin_estimada', sa.Date(), nullable=True))
    op.add_column('proyectos', sa.Column('fecha_cierre_real', sa.Date(), nullable=True))
    op.add_column('proyectos', sa.Column('descripcion', sa.Text(), nullable=True))

    # Items
    op.add_column('items', sa.Column('moneda', sa.Enum('COP', 'USD', 'EUR'), server_default='COP', nullable=True))
    op.add_column('items', sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True))
    op.create_unique_constraint('uq_codigo_interno', 'items', ['codigo_item_interno'])

    # Movimientos Inventario
    op.create_index('idx_mov_fecha', 'movimientos_inventario', ['fecha_movimiento'], unique=False)
    op.create_index('idx_mov_tipo_fecha', 'movimientos_inventario', ['tipo_movimiento', 'fecha_movimiento'], unique=False)

    # 3. Lógica de DB (Vistas)
    # NOTA: El trigger trg_after_movimiento_insert fue eliminado porque causaba duplicación de stock.
    # La lógica de actualización de stock está implementada en Python (crud_inventory.py)

    # Vista stock consolidado
    op.execute("""
    CREATE VIEW `v_stock_consolidado` AS
    SELECT 
      i.id_item,
      i.nombre_equipo,
      i.marca,
      i.referencia,
      i.categoria,
      i.stock_minimo,
      COALESCE(SUM(CASE WHEN a.estado_actual = 'DISPONIBLE' THEN 1 ELSE 0 END), 0) AS stock_activos_disponibles,
      COALESCE(sb.cantidad_actual, 0) AS stock_bulk_actual,
      CASE 
        WHEN COALESCE(sb.cantidad_actual, 0) <= i.stock_minimo THEN 1
        ELSE 0 
      END AS alerta_recompra
    FROM items i
    LEFT JOIN activos a ON i.id_item = a.id_item
    LEFT JOIN stock_bulk sb ON i.id_item = sb.id_item
    GROUP BY i.id_item, i.nombre_equipo, i.marca, i.referencia, 
             i.categoria, i.stock_minimo, sb.cantidad_actual
    """)

    # Vista dashboard KPIs
    op.execute("""
    CREATE VIEW `v_dashboard_kpis` AS
    SELECT
      (SELECT COUNT(*) FROM activos WHERE estado_actual = 'DISPONIBLE')      AS activos_disponibles,
      (SELECT COUNT(*) FROM activos WHERE estado_actual = 'INSTALADO')        AS activos_instalados,
      (SELECT COUNT(*) FROM activos WHERE estado_actual = 'LABORATORIO')      AS activos_laboratorio,
      (SELECT COUNT(*) FROM activos WHERE estado_actual = 'EN_GARANTIA')      AS activos_garantia,
      (SELECT COUNT(*) FROM garantias WHERE estado_proceso != 'ENTREGADO_CLIENTE') AS garantias_abiertas,
      (SELECT COUNT(*) FROM proyectos WHERE estado = 'ACTIVO')                AS proyectos_activos,
      (SELECT COUNT(*) FROM stock_bulk sb JOIN items i ON sb.id_item = i.id_item WHERE sb.cantidad_actual <= i.stock_minimo) AS items_bajo_minimo,
      (SELECT COUNT(*) FROM usuarios WHERE is_active = 1)                     AS usuarios_activos
    """)


def downgrade() -> None:
    # Eliminar Vistas y Triggers
    op.execute("DROP VIEW IF EXISTS `v_dashboard_kpis`")
    op.execute("DROP VIEW IF EXISTS `v_stock_consolidado`")
    op.execute("DROP TRIGGER IF EXISTS `trg_after_movimiento_insert`")

    # Revertir Items
    op.drop_constraint('uq_codigo_interno', 'items', type_='unique')
    op.drop_column('items', 'deleted_at')
    op.drop_column('items', 'moneda')

    # Revertir Proyectos
    op.drop_column('proyectos', 'descripcion')
    op.drop_column('proyectos', 'fecha_cierre_real')
    op.drop_column('proyectos', 'fecha_fin_estimada')
    op.drop_column('proyectos', 'fecha_inicio')

    # Revertir Proveedores
    op.drop_constraint('uq_proveedor_nit', 'proveedores', type_='unique')
    op.drop_column('proveedores', 'deleted_at')
    op.drop_column('proveedores', 'categoria')
    op.drop_column('proveedores', 'dias_credito')
    op.drop_column('proveedores', 'ciudad')
    op.drop_column('proveedores', 'direccion')
    op.drop_column('proveedores', 'nit')

    # Revertir Clientes
    op.drop_column('clientes', 'deleted_at')
    op.drop_column('clientes', 'departamento')
    op.drop_column('clientes', 'ciudad')
    op.drop_column('clientes', 'direccion')

    # Revertir Audit Logs Indices
    op.drop_index('idx_audit_fecha', table_name='audit_logs')
    op.drop_index('idx_audit_accion_fecha', table_name='audit_logs')
    op.drop_index('idx_audit_tabla_fecha', table_name='audit_logs')

    # Revertir Activos
    op.drop_index('idx_activos_area', table_name='activos')
    op.drop_index('idx_activos_estado', table_name='activos')
    op.drop_constraint('activos_ibfk_3', 'activos', type_='foreignkey')
    op.drop_column('activos', 'fecha_compra')
    op.drop_column('activos', 'numero_factura_compra')
    op.drop_column('activos', 'id_proveedor_compra')

    # Revertir Actas Entrega
    op.drop_column('actas_entrega', 'observaciones')
    op.drop_column('actas_entrega', 'estado_acta')
    op.alter_column('actas_entrega', 'firma_tecnico_blob',
               existing_type=mysql.MEDIUMTEXT(),
               type_=mysql.TEXT(),
               existing_nullable=True)

    # Revertir Usuarios
    op.drop_constraint('usuarios_ibfk_regional', 'usuarios', type_='foreignkey')
    op.drop_column('usuarios', 'id_regional')

    # Eliminar Tablas
    op.drop_table('epp_asignaciones')
    op.drop_table('historial_ubicaciones')
    op.drop_index('idx_token_hash', table_name='sesiones_usuario')
    op.drop_table('sesiones_usuario')
    op.drop_table('regionales')

    # Revertir Movimientos Inventario Indices
    op.drop_index('idx_mov_tipo_fecha', table_name='movimientos_inventario')
    op.drop_index('idx_mov_fecha', table_name='movimientos_inventario')
