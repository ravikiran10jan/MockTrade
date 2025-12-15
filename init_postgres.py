#!/usr/bin/env python3
"""
PostgreSQL Database Setup and Initialization Script (Local Installation)
This script initializes the MockTrade PostgreSQL database and tables.

PREREQUISITES:
  1. PostgreSQL must be installed and running
  2. Create a database called 'mocktrade' with user 'postgres'

To install PostgreSQL on macOS:
  brew install postgresql@16
  brew services start postgresql@16
  createdb -U postgres mocktrade
"""
import os
import sys
from pathlib import Path

# Add mock-trade-api to path
sys.path.insert(0, str(Path(__file__).parent / 'mock-trade-api'))

def main():
    print("\n" + "="*70)
    print("MockTrade PostgreSQL Database Initialization")
    print("="*70)

    # Set DATABASE_URL for PostgreSQL
    db_url = 'postgresql://postgres:postgres@localhost:5432/mocktrade'
    os.environ['DATABASE_URL'] = db_url

    print("\nAttempting to connect to PostgreSQL...")
    print(f"Connection string: {db_url}")

    try:
        import psycopg2
    except ImportError:
        print("\n✗ psycopg2 not installed")
        print("Install it with: pip install psycopg2-binary")
        sys.exit(1)

    # Test connection
    print("\nTesting connection...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="postgres",
            database="mocktrade"
        )
        conn.close()
        print("✓ Successfully connected to PostgreSQL")
    except psycopg2.OperationalError as e:
        print(f"\n✗ Failed to connect to PostgreSQL")
        print(f"Error: {e}")
        print("\nMake sure PostgreSQL is running:")
        print("  brew services start postgresql@16")
        print("\nAnd the database exists:")
        print("  createdb -U postgres mocktrade")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)

    # Create tables from SQLAlchemy models
    print("\n[1/2] Creating database tables...")
    try:
        from app.database import Base, engine
        from app import models

        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")

        # List created tables
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

    # Success
    print("\n[2/2] Setup complete!")

    print("\n" + "="*70)
    print("✓ PostgreSQL is ready!")
    print("="*70)
    print("\nNext steps - Start the backend API:")
    print('  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"')
    print("  cd mock-trade-api")
    print("  python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\nIn another terminal, start the frontend:")
    print("  cd mock-trade-ui")
    print("  npm run dev -- --port 5174")
    print("\nThen open http://localhost:5174 in your browser")
    print("\n" + "="*70)

if __name__ == "__main__":
    main()

