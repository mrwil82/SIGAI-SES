"""add_regional_to_clientes_proyectos_actas

Revision ID: 0b0ad1035e55
Revises: d1e2f3a4b5c6
Create Date: 2026-08-01 22:44:33.441758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b0ad1035e55'
down_revision: Union[str, Sequence[str], None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('clientes', sa.Column('id_regional', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_clientes_regional', 'clientes', 'regionales', ['id_regional'], ['id_regional'])
    op.add_column('proyectos', sa.Column('id_regional', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_proyectos_regional', 'proyectos', 'regionales', ['id_regional'], ['id_regional'])
    op.add_column('actas_entrega', sa.Column('id_regional', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_actas_entrega_regional', 'actas_entrega', 'regionales', ['id_regional'], ['id_regional'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_actas_entrega_regional', 'actas_entrega', type_='foreignkey')
    op.drop_column('actas_entrega', 'id_regional')
    op.drop_constraint('fk_proyectos_regional', 'proyectos', type_='foreignkey')
    op.drop_column('proyectos', 'id_regional')
    op.drop_constraint('fk_clientes_regional', 'clientes', type_='foreignkey')
    op.drop_column('clientes', 'id_regional')
