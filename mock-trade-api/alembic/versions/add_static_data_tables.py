"""Add all core static data tables - traders, brokers, clearers, accounts"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'add_static_data_tables'
down_revision = 'add_core_static_tables'
branch_labels = None
depends_on = None

# This migration creates or updates all core static data tables

def upgrade() -> None:
    # Create trader table
    op.create_table(
        'trader',
        sa.Column('trader_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('desk', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='ACTIVE'),
        sa.PrimaryKeyConstraint('trader_id'),
    )
    op.create_index(op.f('ix_trader_trader_id'), 'trader', ['trader_id'], unique=False)

    # Create broker table
    op.create_table(
        'broker',
        sa.Column('broker_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('broker_id'),
    )
    op.create_index(op.f('ix_broker_broker_id'), 'broker', ['broker_id'], unique=False)

    # Create clearer table
    op.create_table(
        'clearer',
        sa.Column('clearer_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('leid', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('clearer_id'),
    )
    op.create_index(op.f('ix_clearer_clearer_id'), 'clearer', ['clearer_id'], unique=False)

    # Create account table
    op.create_table(
        'account',
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('account_id'),
    )
    op.create_index(op.f('ix_account_account_id'), 'account', ['account_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_account_account_id'), table_name='account')
    op.drop_table('account')
    op.drop_index(op.f('ix_clearer_clearer_id'), table_name='clearer')
    op.drop_table('clearer')
    op.drop_index(op.f('ix_broker_broker_id'), table_name='broker')
    op.drop_table('broker')
    op.drop_index(op.f('ix_trader_trader_id'), table_name='trader')
    op.drop_table('trader')
