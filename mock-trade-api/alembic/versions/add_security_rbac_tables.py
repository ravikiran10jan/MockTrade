"""Add security and RBAC tables

Revision ID: add_security_rbac_tables
Revises: add_static_data_tables
Create Date: 2025-12-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import func
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'add_security_rbac_tables'
down_revision = 'add_static_data_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create role table
    op.create_table(
        'role',
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('role_name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('role_id'),
        sa.UniqueConstraint('role_name')
    )
    op.create_index('ix_role_role_name', 'role', ['role_name'], unique=True)
    op.create_index('ix_role_status', 'role', ['status'])

    # Create permission table
    op.create_table(
        'permission',
        sa.Column('permission_id', sa.String(), nullable=False),
        sa.Column('permission_name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('permission_id'),
        sa.UniqueConstraint('permission_name')
    )
    op.create_index('ix_permission_permission_name', 'permission', ['permission_name'], unique=True)
    op.create_index('ix_permission_status', 'permission', ['status'])

    # Create module table
    op.create_table(
        'module',
        sa.Column('module_id', sa.String(), nullable=False),
        sa.Column('module_name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('module_id'),
        sa.UniqueConstraint('module_name')
    )
    op.create_index('ix_module_module_name', 'module', ['module_name'], unique=True)
    op.create_index('ix_module_status', 'module', ['status'])

    # Create role_permission_mapping table
    op.create_table(
        'role_permission_mapping',
        sa.Column('mapping_id', sa.String(), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('module_id', sa.String(), nullable=False),
        sa.Column('permission_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['role.role_id']),
        sa.ForeignKeyConstraint(['module_id'], ['module.module_id']),
        sa.ForeignKeyConstraint(['permission_id'], ['permission.permission_id']),
        sa.PrimaryKeyConstraint('mapping_id')
    )
    op.create_index('ix_role_permission_mapping_role_id', 'role_permission_mapping', ['role_id'])
    op.create_index('ix_role_permission_mapping_module_id', 'role_permission_mapping', ['module_id'])
    op.create_index('ix_role_permission_mapping_status', 'role_permission_mapping', ['status'])

    # Create user_role table
    op.create_table(
        'user_role',
        sa.Column('user_role_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('assigned_at', sa.TIMESTAMP(), nullable=False),
        sa.Column('assigned_by', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['trader.trader_id']),
        sa.ForeignKeyConstraint(['role_id'], ['role.role_id']),
        sa.PrimaryKeyConstraint('user_role_id')
    )
    op.create_index('ix_user_role_user_id', 'user_role', ['user_id'])
    op.create_index('ix_user_role_role_id', 'user_role', ['role_id'])
    op.create_index('ix_user_role_status', 'user_role', ['status'])

    # Insert default roles
    op.execute("""
        INSERT INTO role (role_id, role_name, description, status, created_at) VALUES
        ('role_fo_user', 'FO_USER', 'Front Office User - Traders and Dealers', 'ACTIVE', CURRENT_TIMESTAMP),
        ('role_bo_user', 'BO_USER', 'Back Office User - Operations and Settlement', 'ACTIVE', CURRENT_TIMESTAMP),
        ('role_support', 'SUPPORT', 'Support User - Reporting and Monitoring', 'ACTIVE', CURRENT_TIMESTAMP);
    """)

    # Insert default permissions
    op.execute("""
        INSERT INTO permission (permission_id, permission_name, description, status, created_at) VALUES
        ('perm_read', 'READ', 'Read-only access to view data', 'ACTIVE', CURRENT_TIMESTAMP),
        ('perm_read_write', 'READ_WRITE', 'Read and write access to create/modify data', 'ACTIVE', CURRENT_TIMESTAMP);
    """)

    # Insert default modules
    op.execute("""
        INSERT INTO module (module_id, module_name, description, status, created_at) VALUES
        ('mod_order_entry', 'OrderEntry', 'Order Entry and Management', 'ACTIVE', CURRENT_TIMESTAMP),
        ('mod_static_data', 'StaticData', 'Static Data Management', 'ACTIVE', CURRENT_TIMESTAMP),
        ('mod_market_data', 'MarketData', 'Market Data Management', 'ACTIVE', CURRENT_TIMESTAMP),
        ('mod_enrichment', 'Enrichment', 'Enrichment Mappings', 'ACTIVE', CURRENT_TIMESTAMP),
        ('mod_trade', 'Trade', 'Trade Module', 'ACTIVE', CURRENT_TIMESTAMP),
        ('mod_security', 'Security', 'Security and RBAC Management', 'ACTIVE', CURRENT_TIMESTAMP);
    """)

    # Insert default role-permission mappings
    op.execute("""
        INSERT INTO role_permission_mapping (mapping_id, role_id, module_id, permission_id, status, created_at) VALUES
        ('rpm_fo_order_rw', 'role_fo_user', 'mod_order_entry', 'perm_read_write', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_fo_trade_rw', 'role_fo_user', 'mod_trade', 'perm_read_write', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_fo_market_r', 'role_fo_user', 'mod_market_data', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        
        ('rpm_bo_static_rw', 'role_bo_user', 'mod_static_data', 'perm_read_write', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_bo_trade_r', 'role_bo_user', 'mod_trade', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_bo_enrichment_rw', 'role_bo_user', 'mod_enrichment', 'perm_read_write', 'ACTIVE', CURRENT_TIMESTAMP),
        
        ('rpm_sup_all_r', 'role_support', 'mod_order_entry', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_sup_trade_r', 'role_support', 'mod_trade', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_sup_market_r', 'role_support', 'mod_market_data', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_sup_static_r', 'role_support', 'mod_static_data', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP),
        ('rpm_sup_enrichment_r', 'role_support', 'mod_enrichment', 'perm_read', 'ACTIVE', CURRENT_TIMESTAMP);
    """)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_user_role_status', table_name='user_role')
    op.drop_index('ix_user_role_role_id', table_name='user_role')
    op.drop_index('ix_user_role_user_id', table_name='user_role')
    op.drop_table('user_role')

    op.drop_index('ix_role_permission_mapping_status', table_name='role_permission_mapping')
    op.drop_index('ix_role_permission_mapping_module_id', table_name='role_permission_mapping')
    op.drop_index('ix_role_permission_mapping_role_id', table_name='role_permission_mapping')
    op.drop_table('role_permission_mapping')

    op.drop_index('ix_module_status', table_name='module')
    op.drop_index('ix_module_module_name', table_name='module')
    op.drop_table('module')

    op.drop_index('ix_permission_status', table_name='permission')
    op.drop_index('ix_permission_permission_name', table_name='permission')
    op.drop_table('permission')

    op.drop_index('ix_role_status', table_name='role')
    op.drop_index('ix_role_role_name', table_name='role')
    op.drop_table('role')


