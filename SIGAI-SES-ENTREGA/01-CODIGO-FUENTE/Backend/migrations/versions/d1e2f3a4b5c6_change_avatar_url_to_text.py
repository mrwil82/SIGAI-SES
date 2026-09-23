"""change avatar_url from String(255) to Text for base64 storage

Revision ID: d1e2f3a4b5c6
Revises: 127fd0df2ce0
Create Date: 2026-07-25 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = '127fd0df2ce0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('usuarios', 'avatar_url',
                    existing_type=sa.String(length=255),
                    type_=sa.Text,
                    existing_nullable=True)


def downgrade() -> None:
    op.alter_column('usuarios', 'avatar_url',
                    existing_type=sa.Text,
                    type_=sa.String(length=255),
                    existing_nullable=True)
