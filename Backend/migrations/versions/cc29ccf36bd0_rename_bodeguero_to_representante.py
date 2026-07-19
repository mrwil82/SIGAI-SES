"""rename_bodeguero_to_representante

Revision ID: cc29ccf36bd0
Revises: 02e89ad94861
Create Date: 2026-06-13 13:57:07.864195

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc29ccf36bd0'
down_revision: Union[str, Sequence[str], None] = '02e89ad94861'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Eliminar la clave foránea existente
    op.drop_constraint('fk_actas_bodeguero', 'actas_entrega', type_='foreignkey')
    
    # 2. Renombrar la columna de id_usuario_bodeguero a id_usuario_representante
    op.alter_column(
        'actas_entrega', 
        'id_usuario_bodeguero', 
        new_column_name='id_usuario_representante', 
        existing_type=sa.Integer(), 
        existing_nullable=True
    )
    
    # 3. Crear la nueva clave foránea sobre la columna renombrada
    op.create_foreign_key(
        'fk_actas_representante', 
        'actas_entrega', 
        'usuarios', 
        ['id_usuario_representante'], 
        ['id_usuario']
    )


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Eliminar la nueva clave foránea
    op.drop_constraint('fk_actas_representante', 'actas_entrega', type_='foreignkey')
    
    # 2. Renombrar de vuelta la columna a id_usuario_bodeguero
    op.alter_column(
        'actas_entrega', 
        'id_usuario_representante', 
        new_column_name='id_usuario_bodeguero', 
        existing_type=sa.Integer(), 
        existing_nullable=True
    )
    
    # 3. Recrear la clave foránea original
    op.create_foreign_key(
        'fk_actas_bodeguero', 
        'actas_entrega', 
        'usuarios', 
        ['id_usuario_bodeguero'], 
        ['id_usuario']
    )
