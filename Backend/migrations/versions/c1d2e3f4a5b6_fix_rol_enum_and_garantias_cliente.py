"""fix rol enum and add garantias id_cliente

Revision ID: c1d2e3f4a5b6
Revises: b3c4d5e6f7g8
Create Date: 2026-07-02 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7g8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Actualizar enum de rol en usuarios: agregar TECNICO_LABORATORIO
    op.execute("ALTER TABLE usuarios MODIFY COLUMN rol ENUM('ADMIN','SUPERVISOR','TECNICO','BODEGUERO','TECNICO_LABORATORIO') NOT NULL")

    # 2. Agregar columna id_cliente a garantias
    op.add_column('garantias', sa.Column('id_cliente', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_garantias_cliente', 'garantias', 'clientes', ['id_cliente'], ['id_cliente'])


def downgrade() -> None:
    # 2. Eliminar columna id_cliente de garantias
    op.drop_constraint('fk_garantias_cliente', 'garantias', type_='foreignkey')
    op.drop_column('garantias', 'id_cliente')

    # 1. Revertir enum de rol
    op.execute("ALTER TABLE usuarios MODIFY COLUMN rol ENUM('ADMIN','SUPERVISOR','TECNICO','BODEGUERO') NOT NULL")
