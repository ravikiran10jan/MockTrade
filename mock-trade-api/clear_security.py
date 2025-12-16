#!/usr/bin/env python3
"""
Clear security module data
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    Role, Permission, Module, RolePermissionMapping, UserRole, Trader
)

def clear_security_data():
    """Clear all security data"""
    db = SessionLocal()

    try:
        print("Clearing security module data...")
        
        # Delete in reverse order of dependencies
        db.query(UserRole).delete()
        db.query(RolePermissionMapping).delete()
        db.query(Role).delete()
        db.query(Permission).delete()
        db.query(Module).delete()
        
        db.commit()
        print("✅ Security data cleared successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error clearing data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clear_security_data()