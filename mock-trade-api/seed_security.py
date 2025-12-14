#!/usr/bin/env python3
"""
Seed security module with default roles, permissions, modules, and mappings
"""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    Role, Permission, Module, RolePermissionMapping, UserRole, Trader
)

def seed_security_data():
    """Populate default security data"""
    db = SessionLocal()

    try:
        # Check if data already exists
        existing_roles = db.query(Role).count()
        if existing_roles > 0:
            print("Security data already exists. Skipping seed...")
            return

        print("Seeding security module data...")

        # ============ CREATE ROLES ============
        roles_data = [
            {"role_id": "ROLE_FO_USER", "role_name": "FO_USER", "description": "Front Office User - Can place orders, view trades"},
            {"role_id": "ROLE_BO_USER", "role_name": "BO_USER", "description": "Back Office User - Can manage settlements, confirmations"},
            {"role_id": "ROLE_SUPPORT", "role_name": "SUPPORT", "description": "Support User - Can view data, limited write access"}
        ]

        roles = []
        for role_data in roles_data:
            role = Role(
                role_id=role_data["role_id"],
                role_name=role_data["role_name"],
                description=role_data["description"],
                status="ACTIVE",
                created_at=datetime.now()
            )
            db.add(role)
            roles.append(role)
            print(f"✓ Created role: {role_data['role_name']}")

        # ============ CREATE PERMISSIONS ============
        permissions_data = [
            {"permission_id": "PERM_READ", "permission_name": "READ", "description": "Read-only access"},
            {"permission_id": "PERM_READ_WRITE", "permission_name": "READ_WRITE", "description": "Read and Write access"}
        ]

        permissions = []
        for perm_data in permissions_data:
            permission = Permission(
                permission_id=perm_data["permission_id"],
                permission_name=perm_data["permission_name"],
                description=perm_data["description"],
                status="ACTIVE",
                created_at=datetime.now()
            )
            db.add(permission)
            permissions.append(permission)
            print(f"✓ Created permission: {perm_data['permission_name']}")

        # ============ CREATE MODULES ============
        modules_data = [
            {"module_id": "MOD_ORDER_ENTRY", "module_name": "OrderEntry", "description": "Order Entry and Management"},
            {"module_id": "MOD_STATIC_DATA", "module_name": "StaticData", "description": "Static Data Management"},
            {"module_id": "MOD_MARKET_DATA", "module_name": "MarketData", "description": "Market Data Management"},
            {"module_id": "MOD_ENRICHMENT", "module_name": "Enrichment", "description": "Enrichment Mappings"},
            {"module_id": "MOD_TRADE", "module_name": "Trade", "description": "Trade Management"},
            {"module_id": "MOD_CONFIRMATIONS", "module_name": "Confirmations", "description": "Confirmation Matching"},
            {"module_id": "MOD_SECURITY", "module_name": "Security", "description": "Security and Access Control"}
        ]

        modules = []
        for mod_data in modules_data:
            module = Module(
                module_id=mod_data["module_id"],
                module_name=mod_data["module_name"],
                description=mod_data["description"],
                status="ACTIVE",
                created_at=datetime.now()
            )
            db.add(module)
            modules.append(module)
            print(f"✓ Created module: {mod_data['module_name']}")

        db.flush()

        # ============ CREATE ROLE-PERMISSION MAPPINGS ============
        mappings = [
            # FO_USER: READ_WRITE on OrderEntry, Trade; READ on others
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_ORDER_ENTRY", "permission_id": "PERM_READ_WRITE"},
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_TRADE", "permission_id": "PERM_READ_WRITE"},
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_STATIC_DATA", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_MARKET_DATA", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_ENRICHMENT", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_FO_USER", "module_id": "MOD_CONFIRMATIONS", "permission_id": "PERM_READ"},

            # BO_USER: READ_WRITE on ConfirmationMonitor, StaticData; READ on others
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_CONFIRMATIONS", "permission_id": "PERM_READ_WRITE"},
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_STATIC_DATA", "permission_id": "PERM_READ_WRITE"},
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_TRADE", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_ORDER_ENTRY", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_MARKET_DATA", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_BO_USER", "module_id": "MOD_ENRICHMENT", "permission_id": "PERM_READ"},

            # SUPPORT: READ on all modules
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_ORDER_ENTRY", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_STATIC_DATA", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_MARKET_DATA", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_ENRICHMENT", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_TRADE", "permission_id": "PERM_READ"},
            {"role_id": "ROLE_SUPPORT", "module_id": "MOD_CONFIRMATIONS", "permission_id": "PERM_READ"},
        ]

        for idx, mapping_data in enumerate(mappings):
            mapping = RolePermissionMapping(
                mapping_id=f"MAP_{idx + 1:03d}",
                role_id=mapping_data["role_id"],
                module_id=mapping_data["module_id"],
                permission_id=mapping_data["permission_id"],
                status="ACTIVE",
                created_at=datetime.now()
            )
            db.add(mapping)
            print(f"✓ Created mapping: {mapping_data['role_id']} -> {mapping_data['module_id']} ({mapping_data['permission_id']})")

        db.commit()
        print("\n✅ Security data seeded successfully!")
        print(f"\nCreated:")
        print(f"  - {len(roles)} roles")
        print(f"  - {len(permissions)} permissions")
        print(f"  - {len(modules)} modules")
        print(f"  - {len(mappings)} role-permission mappings")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_security_data()

