"""Update instrument table - add missing columns

Revision ID: update_instrument_columns
Revises: add_core_static_tables
Create Date: 2025-12-14 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'update_instrument_columns'
down_revision = 'add_core_static_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add missing columns to instrument table:
    - name (required, human-friendly name)
    - asset_class (e.g., FX, EQUITY, FUTURE, OTC)
    - instrument_type (e.g., OTC_FX_FWD, FX_FUT, STRATEGY)
    """
    # Add name column
    op.add_column('instrument', sa.Column('name', sa.String(), nullable=True))

    # Add asset_class column
    op.add_column('instrument', sa.Column('asset_class', sa.String(), nullable=True))

    # Add instrument_type column
    op.add_column('instrument', sa.Column('instrument_type', sa.String(), nullable=True))

    # Create indexes for frequently queried columns
    op.create_index('ix_instrument_symbol', 'instrument', ['symbol'], unique=True)
    op.create_index('ix_instrument_status', 'instrument', ['status'])


def downgrade() -> None:
    """
    Drop the added columns and indexes.
    """
    op.drop_index('ix_instrument_status', table_name='instrument')
    op.drop_index('ix_instrument_symbol', table_name='instrument')
    op.drop_column('instrument', 'instrument_type')
    op.drop_column('instrument', 'asset_class')
    op.drop_column('instrument', 'name')

