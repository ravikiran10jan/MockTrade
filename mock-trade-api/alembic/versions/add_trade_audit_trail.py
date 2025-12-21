"""add trade audit trail table

Revision ID: add_trade_audit_trail
Revises: add_security_rbac_tables
Create Date: 2024-12-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_trade_audit_trail'
down_revision = ('93d7bc0a2260', 'update_instrument_columns')  # Multiple heads merged
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'trade_audit_trail',
        sa.Column('audit_id', sa.String(), nullable=False),
        sa.Column('trade_id', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_description', sa.String(), nullable=True),
        sa.Column('old_status', sa.String(), nullable=True),
        sa.Column('new_status', sa.String(), nullable=True),
        sa.Column('changed_by', sa.String(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('audit_id')
    )
    
    # Create index on trade_id for faster lookups
    op.create_index(
        'ix_trade_audit_trail_trade_id',
        'trade_audit_trail',
        ['trade_id']
    )
    
    # Create index on created_at for chronological queries
    op.create_index(
        'ix_trade_audit_trail_created_at',
        'trade_audit_trail',
        ['created_at']
    )


def downgrade():
    op.drop_index('ix_trade_audit_trail_created_at', table_name='trade_audit_trail')
    op.drop_index('ix_trade_audit_trail_trade_id', table_name='trade_audit_trail')
    op.drop_table('trade_audit_trail')
