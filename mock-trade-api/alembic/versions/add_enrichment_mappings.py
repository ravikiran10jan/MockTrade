"""Add enrichment mapping tables (Portfolio, Trader, Broker, Clearer)

Revision ID: add_enrichment_mappings
Revises: add_instrument_subtypes
Create Date: 2025-12-14 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_enrichment_mappings'
down_revision = 'add_instrument_subtypes'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add enrichment mapping tables:
    - portfolio_enrichment_mapping: maps trader accounts/instruments to portfolio codes
    - trader_enrichment_mapping: maps source trader UUIDs to internal trader IDs
    - broker_enrichment_mapping: maps source system + account to broker details
    - clearer_enrichment_mapping: maps source system + account to clearer details
    """

    # Create portfolio_enrichment_mapping table
    op.create_table(
        'portfolio_enrichment_mapping',
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('source_system', sa.String(), nullable=False),
        # split trader/account into separate fields
        sa.Column('trader_id', sa.String(), nullable=True),
        sa.Column('account_id', sa.String(), nullable=True),
        sa.Column('instrument_code', sa.String(), nullable=True),
        # rename portfolio_code -> portfolio
        sa.Column('portfolio', sa.String(), nullable=False),
        sa.Column('comments', sa.String(), nullable=True),
        sa.Column('active', sa.String(), default='Y'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('rule_id')
    )
    op.create_index('ix_portfolio_enrichment_mapping_rule_id', 'portfolio_enrichment_mapping', ['rule_id'])
    op.create_index('ix_portfolio_enrichment_mapping_source_system', 'portfolio_enrichment_mapping', ['source_system'])
    op.create_index('ix_portfolio_enrichment_mapping_trader_id', 'portfolio_enrichment_mapping', ['trader_id'])
    op.create_index('ix_portfolio_enrichment_mapping_account_id', 'portfolio_enrichment_mapping', ['account_id'])
    op.create_index('ix_portfolio_enrichment_mapping_active', 'portfolio_enrichment_mapping', ['active'])

    # Create trader_enrichment_mapping table
    op.create_table(
        'trader_enrichment_mapping',
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('source_system', sa.String(), nullable=False),
        sa.Column('source_trader_uuid', sa.String(), nullable=False),
        sa.Column('internal_trader_id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('active', sa.String(), default='Y'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('rule_id')
    )
    op.create_index('ix_trader_enrichment_mapping_rule_id', 'trader_enrichment_mapping', ['rule_id'])
    op.create_index('ix_trader_enrichment_mapping_source_system', 'trader_enrichment_mapping', ['source_system'])
    op.create_index('ix_trader_enrichment_mapping_source_trader_uuid', 'trader_enrichment_mapping', ['source_trader_uuid'])
    op.create_index('ix_trader_enrichment_mapping_internal_trader_id', 'trader_enrichment_mapping', ['internal_trader_id'])
    op.create_index('ix_trader_enrichment_mapping_active', 'trader_enrichment_mapping', ['active'])

    # Create broker_enrichment_mapping table
    op.create_table(
        'broker_enrichment_mapping',
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('source_system', sa.String(), nullable=False),
        sa.Column('account_name', sa.String(), nullable=False),
        sa.Column('broker', sa.String(), nullable=False),
        sa.Column('broker_leid', sa.String(), nullable=False),
        sa.Column('comments', sa.String(), nullable=True),
        sa.Column('active', sa.String(), default='Y'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('rule_id')
    )
    op.create_index('ix_broker_enrichment_mapping_rule_id', 'broker_enrichment_mapping', ['rule_id'])
    op.create_index('ix_broker_enrichment_mapping_source_system', 'broker_enrichment_mapping', ['source_system'])
    op.create_index('ix_broker_enrichment_mapping_account_name', 'broker_enrichment_mapping', ['account_name'])
    op.create_index('ix_broker_enrichment_mapping_active', 'broker_enrichment_mapping', ['active'])

    # Create clearer_enrichment_mapping table
    op.create_table(
        'clearer_enrichment_mapping',
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('source_system', sa.String(), nullable=False),
        sa.Column('account_name', sa.String(), nullable=False),
        sa.Column('clearer', sa.String(), nullable=False),
        sa.Column('clearer_leid', sa.String(), nullable=False),
        sa.Column('comments', sa.String(), nullable=True),
        sa.Column('active', sa.String(), default='Y'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('rule_id')
    )
    op.create_index('ix_clearer_enrichment_mapping_rule_id', 'clearer_enrichment_mapping', ['rule_id'])
    op.create_index('ix_clearer_enrichment_mapping_source_system', 'clearer_enrichment_mapping', ['source_system'])
    op.create_index('ix_clearer_enrichment_mapping_account_name', 'clearer_enrichment_mapping', ['account_name'])
    op.create_index('ix_clearer_enrichment_mapping_active', 'clearer_enrichment_mapping', ['active'])


def downgrade() -> None:
    """
    Drop all enrichment mapping tables and indices.
    """
    op.drop_index('ix_clearer_enrichment_mapping_active', table_name='clearer_enrichment_mapping')
    op.drop_index('ix_clearer_enrichment_mapping_account_name', table_name='clearer_enrichment_mapping')
    op.drop_index('ix_clearer_enrichment_mapping_source_system', table_name='clearer_enrichment_mapping')
    op.drop_index('ix_clearer_enrichment_mapping_rule_id', table_name='clearer_enrichment_mapping')
    op.drop_table('clearer_enrichment_mapping')

    op.drop_index('ix_broker_enrichment_mapping_active', table_name='broker_enrichment_mapping')
    op.drop_index('ix_broker_enrichment_mapping_account_name', table_name='broker_enrichment_mapping')
    op.drop_index('ix_broker_enrichment_mapping_source_system', table_name='broker_enrichment_mapping')
    op.drop_index('ix_broker_enrichment_mapping_rule_id', table_name='broker_enrichment_mapping')
    op.drop_table('broker_enrichment_mapping')

    op.drop_index('ix_trader_enrichment_mapping_active', table_name='trader_enrichment_mapping')
    op.drop_index('ix_trader_enrichment_mapping_internal_trader_id', table_name='trader_enrichment_mapping')
    op.drop_index('ix_trader_enrichment_mapping_source_trader_uuid', table_name='trader_enrichment_mapping')
    op.drop_index('ix_trader_enrichment_mapping_source_system', table_name='trader_enrichment_mapping')
    op.drop_index('ix_trader_enrichment_mapping_rule_id', table_name='trader_enrichment_mapping')
    op.drop_table('trader_enrichment_mapping')

    op.drop_index('ix_portfolio_enrichment_mapping_active', table_name='portfolio_enrichment_mapping')
    op.drop_index('ix_portfolio_enrichment_mapping_account_id', table_name='portfolio_enrichment_mapping')
    op.drop_index('ix_portfolio_enrichment_mapping_trader_id', table_name='portfolio_enrichment_mapping')
    op.drop_index('ix_portfolio_enrichment_mapping_source_system', table_name='portfolio_enrichment_mapping')
    op.drop_index('ix_portfolio_enrichment_mapping_rule_id', table_name='portfolio_enrichment_mapping')
    op.drop_table('portfolio_enrichment_mapping')

