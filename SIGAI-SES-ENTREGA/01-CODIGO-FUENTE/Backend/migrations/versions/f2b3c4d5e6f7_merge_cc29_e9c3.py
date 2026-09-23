"""merge cc29ccf36bd0 and e9c3b6a1f2b4

Revision ID: f2b3c4d5e6f7
Revises: cc29ccf36bd0, e9c3b6a1f2b4
Create Date: 2026-07-01 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = ('cc29ccf36bd0', 'e9c3b6a1f2b4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Merge heads: no schema changes."""
    pass


def downgrade() -> None:
    """Un-merge (noop)."""
    pass
