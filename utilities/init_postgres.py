#!/usr/bin/env python3
"""
PostgreSQL Database Setup and Initialization Script (Local Installation)
This script initializes the MockTrade PostgreSQL database availability.

PREREQUISITES:
  1. PostgreSQL must be installed and running
  2. Create a database called 'mocktrade' with user 'postgres'

This script will NOT create database tables. Use Alembic or scripts/init_db_once.py --seed
for schema creation.
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

    # Guidance for schema creation
    print("\nSchema creation is not performed automatically by this script.")
    print("To create tables, run:")
    print("  python3 scripts/init_db_once.py --seed")
    print("Or use Alembic migrations:")
    print("  export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/mocktrade'")
    print("  cd mock-trade-api && alembic upgrade head")

    # Success
    print("\n[done] Setup complete!")

    print("\n" + "="*70)
    print("✓ PostgreSQL is reachable")
    print("="*70)

if __name__ == "__main__":
    main()

