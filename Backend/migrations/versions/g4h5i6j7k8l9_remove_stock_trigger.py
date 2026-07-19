"""remove_stock_trigger

Revision ID: g4h5i6j7k8l9
Revises: f2b3c4d5e6f7
Create Date: 2026-07-08 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'g4h5i6j7k8l9'
down_revision: Union[str, Sequence[str], None] = 'f2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Eliminar trigger que causa duplicación de stock
    # La lógica de actualización de stock ya está implementada en Python (crud_inventory.py)
    op.execute("DROP TRIGGER IF EXISTS `trg_after_movimiento_insert`")


def downgrade() -> None:
    # Recrear trigger (solo si se necesita revertir)
    op.execute("""
    CREATE TRIGGER `trg_after_movimiento_insert`
    AFTER INSERT ON `movimientos_inventario`
    FOR EACH ROW
    BEGIN
      IF NEW.id_item IS NOT NULL THEN
        IF NEW.tipo_movimiento IN ('ENTRADA_COMPRA', 'DEVOLUCION', 'INGRESO_DESMONTE') THEN
          INSERT INTO stock_bulk (id_item, cantidad_actual)
            VALUES (NEW.id_item, NEW.cantidad)
            ON DUPLICATE KEY UPDATE cantidad_actual = cantidad_actual + NEW.cantidad;
        ELSEIF NEW.tipo_movimiento IN ('SALIDA_INSTALACION', 'BAJA_DAÑO') THEN
          UPDATE stock_bulk 
            SET cantidad_actual = GREATEST(0, cantidad_actual - NEW.cantidad)
            WHERE id_item = NEW.id_item;
        END IF;
      END IF;
    END
    """)
