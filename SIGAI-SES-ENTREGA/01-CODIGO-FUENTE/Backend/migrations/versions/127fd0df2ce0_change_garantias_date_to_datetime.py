"""change_garantias_date_to_datetime

Revision ID: 127fd0df2ce0
Revises: 31a3b21a45fc
Create Date: 2026-07-15 00:38:52.259083

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '127fd0df2ce0'
down_revision: Union[str, Sequence[str], None] = '31a3b21a45fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('garantias', 'fecha_envio',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_limite_estimada',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_recibido_reparado',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_inicio_garantia',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)


def downgrade() -> None:
    op.alter_column('garantias', 'fecha_inicio_garantia',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_recibido_reparado',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_limite_estimada',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)
    op.alter_column('garantias', 'fecha_envio',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)
