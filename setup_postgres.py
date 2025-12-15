#!/usr/bin/env python3
"""
PostgreSQL Database Setup and Initialization Script
This script:
1. Starts PostgreSQL container (via docker-compose)
2. Creates the database and tables
3. Seeds initial data
"""
import os
import sys
import subprocess
import time
from pathlib import Path

# Add mock-trade-api to path
sys.path.insert(0, str(Path(__file__).parent / 'mock-trade-api'))

def run_command(cmd, description):
    """Run a shell command and report status"""
    print(f"\n{'='*70}")
    print(f"→ {description}")
    print(f"{'='*70}")
    try:
        result = subprocess.run(cmd, shell=True, cwd=str(Path(__file__).parent))
        if result.returncode == 0:
            print(f"✓ {description} completed successfully")
            return True
        else:
            print(f"✗ {description} failed with return code {result.returncode}")
            return False
    except Exception as e:
        print(f"✗ Error during {description}: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("MockTrade PostgreSQL Setup")
    print("="*70)

    # Step 1: Start Docker Compose
    print("\n[1/4] Starting PostgreSQL container...")
    # Try newer docker compose first, fall back to docker-compose
    docker_cmd = "docker compose up -d db"
    result = subprocess.run(docker_cmd, shell=True, cwd=str(Path(__file__).parent), capture_output=True)
    if result.returncode != 0:
        docker_cmd = "docker-compose up -d db"
        result = subprocess.run(docker_cmd, shell=True, cwd=str(Path(__file__).parent), capture_output=True)

    if result.returncode != 0:
        print("Failed to start PostgreSQL. Make sure Docker is installed and running.")
        print(f"Error: {result.stderr.decode() if result.stderr else 'Unknown error'}")
        sys.exit(1)
    print("✓ PostgreSQL container started")

    # Wait for PostgreSQL to be ready
    print("\n[2/4] Waiting for PostgreSQL to be ready...")
    max_retries = 30
    retry = 0
    while retry < max_retries:
        try:
            import psycopg2
            conn = psycopg2.connect(
                host="localhost",
                user="postgres",
                password="mock1234",
                database="mocktrade"
            )
            conn.close()
            print("✓ PostgreSQL is ready")
            break
        except Exception as e:
            retry += 1
            if retry < max_retries:
                print(f"  Waiting... ({retry}/{max_retries})")
                time.sleep(1)
            else:
                print(f"✗ PostgreSQL failed to start after {max_retries} seconds")
                print(f"  Error: {e}")
                print("\nTroubleshooting:")
                print("  - Check if Docker is running: docker ps")
                print("  - Check logs: docker logs mocktrade-db")
                print("  - Make sure port 5432 is not in use: lsof -i :5432")
                sys.exit(1)

    # Step 3: Set DATABASE_URL and initialize tables
    print("\n[3/4] Creating database tables...")
    os.environ['DATABASE_URL'] = 'postgresql://postgres:mock1234@localhost:5432/mocktrade'

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

    # Step 4: Seed initial data (optional)
    print("\n[4/4] PostgreSQL setup complete!")

    print("\n" + "="*70)
    print("✓ PostgreSQL is ready!")
    print("="*70)
    print("\nNext steps:")
    print("1. Start the backend API (with DATABASE_URL set):")
    print('   export DATABASE_URL="postgresql://postgres:mock1234@localhost:5432/mocktrade"')
    print("   cd mock-trade-api")
    print("   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\n2. In another terminal, start the frontend:")
    print("   cd mock-trade-ui")
    print("   npm run dev -- --port 5174")
    print("\n3. Open http://localhost:5174 in your browser")

    print("\nPostgreSQL connection string:")
    print('  postgresql://postgres:mock1234@localhost:5432/mocktrade')
    print("\n" + "="*70)

if __name__ == "__main__":
    main()

