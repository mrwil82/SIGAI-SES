"""add user.config column

Revision ID: a1b2c3d4e5f6
Revises: f2b3c4d5e6f7
Create Date: 2026-07-01 19:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add config column to usuarios"""
    op.add_column('usuarios', sa.Column('config', sa.String(length=1024), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remove config column from usuarios"""
    op.drop_column('usuarios', 'config')
