"""merge_heads

Revision ID: 31a3b21a45fc
Revises: c1d2e3f4a5b6, g4h5i6j7k8l9
Create Date: 2026-07-15 00:38:28.137181

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31a3b21a45fc'
down_revision: Union[str, Sequence[str], None] = ('c1d2e3f4a5b6', 'g4h5i6j7k8l9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
