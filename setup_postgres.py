#!/usr/bin/env python3
"""
PostgreSQL Database Setup and Initialization Script
This script:
1. Starts PostgreSQL container (via docker-compose)
2. Waits for DB readiness

NOTE: Schema creation is no longer performed automatically by this script.
Use Alembic or the one-off script `scripts/init_db_once.py --seed` to create tables.
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
    print("\n[1/3] Starting PostgreSQL container...")
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
    print("\n[2/3] Waiting for PostgreSQL to be ready...")
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
                sys.exit(1)

    # Final instructions
    print("\n[3/3] PostgreSQL is running.")
    print("Schema creation is NOT performed automatically by this script.")
    print("To create tables, run:")
    print("  python3 scripts/init_db_once.py --seed")
    print("Or use Alembic migrations:")
    print("  export DATABASE_URL='postgresql://postgres:mock1234@localhost:5432/mocktrade'")
    print("  cd mock-trade-api && alembic upgrade head")

    print("\nPostgreSQL connection string:")
    print('  postgresql://postgres:mock1234@localhost:5432/mocktrade')
    print("\n" + "="*70)

if __name__ == "__main__":
    main()

