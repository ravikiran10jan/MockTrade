"""Add core static data tables (Account, Broker, Clearer, Trader)

Revision ID: add_core_static_tables
Revises: add_enrichment_mappings
Create Date: 2025-12-14 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_core_static_tables'
down_revision = 'add_enrichment_mappings'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add core static data tables:
    - account: internal account master data
    - broker: broker/counterparty master data
    - clearer: clearing house master data
    - trader: trader/dealer master data
    """

    # Create account table
    op.create_table(
        'account',
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('account_id')
    )
    op.create_index('ix_account_account_id', 'account', ['account_id'])

    # Create broker table
    op.create_table(
        'broker',
        sa.Column('broker_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('broker_id')
    )
    op.create_index('ix_broker_broker_id', 'broker', ['broker_id'])

    # Create clearer table
    op.create_table(
        'clearer',
        sa.Column('clearer_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('leid', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('clearer_id')
    )
    op.create_index('ix_clearer_clearer_id', 'clearer', ['clearer_id'])

    # Create trader table
    op.create_table(
        'trader',
        sa.Column('trader_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('desk', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('trader_id')
    )
    op.create_index('ix_trader_trader_id', 'trader', ['trader_id'])


def downgrade() -> None:
    """
    Drop all core static data tables and indices.
    """
    op.drop_index('ix_trader_trader_id', table_name='trader')
    op.drop_table('trader')

    op.drop_index('ix_clearer_clearer_id', table_name='clearer')
    op.drop_table('clearer')

    op.drop_index('ix_broker_broker_id', table_name='broker')
    op.drop_table('broker')

    op.drop_index('ix_account_account_id', table_name='account')
    op.drop_table('account')

