#!/usr/bin/env python3
"""
Direct database initialization script that creates all tables from models
"""
import os
import sys
from pathlib import Path

# Set database URL to PostgreSQL
os.environ['DATABASE_URL'] = 'postgresql://postgres:mock1234@localhost:5432/mocktrade'

# Add mock-trade-api to path
sys.path.insert(0, str(Path(__file__).parent / 'mock-trade-api'))

from app.database import Base, engine
# Import models to register them with Base
from app import models

print("=" * 70)
print("MockTrade Database Initialization")
print("=" * 70)

print("\nCreating tables from SQLAlchemy models...")
try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

    # List tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"\nCreated {len(tables)} tables:")
    for table in sorted(tables):
        print(f"  - {table}")

except Exception as e:
    print(f"✗ Error creating tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("Database initialization complete!")
print("=" * 70)

print("=" * 70)
print("MockTrade Database Initialization")
print("=" * 70)

print("\nCreating tables from SQLAlchemy models...")
try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

    # List tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"\nCreated {len(tables)} tables:")
    for table in sorted(tables):
        print(f"  - {table}")

except Exception as e:
    print(f"✗ Error creating tables: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("Database initialization complete!")
print("=" * 70)

