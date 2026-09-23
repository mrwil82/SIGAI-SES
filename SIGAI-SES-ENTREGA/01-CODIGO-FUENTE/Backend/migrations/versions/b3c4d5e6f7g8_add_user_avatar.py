"""add user.avatar_url column

Revision ID: b3c4d5e6f7g8
Revises: a1b2c3d4e5f6
Create Date: 2026-07-01 19:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7g8'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add avatar_url column to usuarios"""
    op.add_column('usuarios', sa.Column('avatar_url', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remove avatar_url column from usuarios"""
    op.drop_column('usuarios', 'avatar_url')
