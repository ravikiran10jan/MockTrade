"""Add instrument subtype tables (OTC, ETD, Strategy)

Revision ID: add_instrument_subtypes
Revises: 1dcb8c4fb47c
Create Date: 2025-12-14 12:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_instrument_subtypes'
down_revision = '1dcb8c4fb47c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add instrument subtype tables:
    - instrument_otc: OTC-specific details (1:1 with instrument)
    - instrument_etd: ETD-specific details (1:1 with instrument)
    - instrument_strategy: Strategy-specific details (1:1 with instrument)
    - strategy_leg: Links strategy to component instruments with ratios
    """

    # Create instrument_otc table
    op.create_table(
        'instrument_otc',
        sa.Column('instrument_id', sa.String(), nullable=False),
        sa.Column('forward_points_multiplier', sa.Float(), nullable=True),
        sa.Column('settlement_type', sa.String(), nullable=True),
        sa.Column('settlement_day_offset', sa.Integer(), nullable=True),
        sa.Column('day_count_convention', sa.String(), nullable=True),
        sa.Column('payment_frequency', sa.String(), nullable=True),
        sa.Column('primary_calendar', sa.String(), nullable=True),
        sa.Column('secondary_calendar', sa.String(), nullable=True),
        sa.Column('is_cleared', sa.String(), default='N'),
        sa.Column('clearing_house', sa.String(), nullable=True),
        sa.Column('clearing_code', sa.String(), nullable=True),
        sa.Column('bilateral_cpty', sa.String(), nullable=True),
        sa.Column('otc_details_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['instrument_id'], ['instrument.instrument_id'], ),
        sa.PrimaryKeyConstraint('instrument_id')
    )
    op.create_index('ix_instrument_otc_instrument_id', 'instrument_otc', ['instrument_id'])

    # Create instrument_etd table
    op.create_table(
        'instrument_etd',
        sa.Column('instrument_id', sa.String(), nullable=False),
        sa.Column('exchange', sa.String(), nullable=False),
        sa.Column('exchange_code', sa.String(), nullable=True),
        sa.Column('mic_code', sa.String(), nullable=True),
        sa.Column('contract_size', sa.DECIMAL(), nullable=True),
        sa.Column('contract_multiplier', sa.Float(), nullable=True),
        sa.Column('tick_size', sa.DECIMAL(), nullable=True),
        sa.Column('tick_value', sa.DECIMAL(), nullable=True),
        sa.Column('contract_months', sa.String(), nullable=True),
        sa.Column('last_trade_day_rule', sa.String(), nullable=True),
        sa.Column('last_trade_date_of_year', sa.Date(), nullable=True),
        sa.Column('margin_group', sa.String(), nullable=True),
        sa.Column('initial_margin', sa.DECIMAL(), nullable=True),
        sa.Column('maintenance_margin', sa.DECIMAL(), nullable=True),
        sa.Column('trading_hours', sa.String(), nullable=True),
        sa.Column('etd_details_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['instrument_id'], ['instrument.instrument_id'], ),
        sa.PrimaryKeyConstraint('instrument_id')
    )
    op.create_index('ix_instrument_etd_instrument_id', 'instrument_etd', ['instrument_id'])

    # Create instrument_strategy table
    op.create_table(
        'instrument_strategy',
        sa.Column('instrument_id', sa.String(), nullable=False),
        sa.Column('strategy_template', sa.String(), nullable=True),
        sa.Column('payoff_type', sa.String(), nullable=True),
        sa.Column('rebalance_frequency', sa.String(), nullable=True),
        sa.Column('rebalance_threshold', sa.Float(), nullable=True),
        sa.Column('pricing_model', sa.String(), nullable=True),
        sa.Column('valuation_currency', sa.String(), nullable=True),
        sa.Column('strategy_details_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['instrument_id'], ['instrument.instrument_id'], ),
        sa.PrimaryKeyConstraint('instrument_id')
    )
    op.create_index('ix_instrument_strategy_instrument_id', 'instrument_strategy', ['instrument_id'])

    # Create strategy_leg table
    op.create_table(
        'strategy_leg',
        sa.Column('leg_id', sa.String(), nullable=False),
        sa.Column('strategy_id', sa.String(), nullable=False),
        sa.Column('component_instrument_id', sa.String(), nullable=False),
        sa.Column('leg_sequence', sa.Integer(), nullable=True),
        sa.Column('side', sa.String(), nullable=True),
        sa.Column('ratio', sa.DECIMAL(), nullable=True),
        sa.Column('quantity_type', sa.String(), nullable=True),
        sa.Column('hedge_ratio', sa.Float(), nullable=True),
        sa.Column('leg_details_json', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['component_instrument_id'], ['instrument.instrument_id'], ),
        sa.ForeignKeyConstraint(['strategy_id'], ['instrument.instrument_id'], ),
        sa.PrimaryKeyConstraint('leg_id')
    )
    op.create_index('ix_strategy_leg_leg_id', 'strategy_leg', ['leg_id'])
    op.create_index('ix_strategy_leg_strategy_id', 'strategy_leg', ['strategy_id'])
    op.create_index('ix_strategy_leg_component_instrument_id', 'strategy_leg', ['component_instrument_id'])


def downgrade() -> None:
    """
    Drop all subtype tables and indices.
    """
    op.drop_index('ix_strategy_leg_component_instrument_id', table_name='strategy_leg')
    op.drop_index('ix_strategy_leg_strategy_id', table_name='strategy_leg')
    op.drop_index('ix_strategy_leg_leg_id', table_name='strategy_leg')
    op.drop_table('strategy_leg')

    op.drop_index('ix_instrument_strategy_instrument_id', table_name='instrument_strategy')
    op.drop_table('instrument_strategy')

    op.drop_index('ix_instrument_etd_instrument_id', table_name='instrument_etd')
    op.drop_table('instrument_etd')

    op.drop_index('ix_instrument_otc_instrument_id', table_name='instrument_otc')
    op.drop_table('instrument_otc')

