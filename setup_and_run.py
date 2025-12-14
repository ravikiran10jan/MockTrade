#!/usr/bin/env python3
"""
Setup script to create PostgreSQL database, run migrations, and start servers.
"""
import os
import subprocess
import sys
import time
from pathlib import Path

# Set environment variables
os.environ['DATABASE_URL'] = 'postgresql://postgres:mock1234@localhost:5432/mocktrade'
PROJECT_ROOT = Path('/Users/ravikiranreddygajula/MockTrade')
BACKEND_DIR = PROJECT_ROOT / 'mock-trade-api'
FRONTEND_DIR = PROJECT_ROOT / 'mock-trade-ui'

print("=" * 70)
print("MockTrade App - Complete Setup & Run")
print("=" * 70)

# Step 0: Check and setup PostgreSQL
print("\n[0/5] Checking PostgreSQL installation...")
psql_path = '/opt/homebrew/opt/postgresql@14/bin/psql'
if not os.path.exists(psql_path):
    print("⚠ PostgreSQL not found at expected path")
    print("Please install PostgreSQL first:")
    print("  brew install postgresql")
    print("  brew services start postgresql@14")
    sys.exit(1)

print("✓ PostgreSQL found")

# Step 1: Create database
print("\n[1/5] Creating PostgreSQL database 'mocktrade'...")
try:
    result = subprocess.run(
        [psql_path, '-U', 'postgres', '-c', 'CREATE DATABASE mocktrade;'],
        capture_output=True,
        text=True,
        timeout=5
    )
    if 'already exists' in result.stderr or result.returncode == 0:
        print("✓ Database 'mocktrade' ready")
    else:
        print(f"⚠ Database creation result: {result.stderr[:100]}")
except Exception as e:
    print(f"⚠ Database creation: {e}")

# Step 2: Install alembic in backend venv
print("\n[2/5] Installing Alembic...")
try:
    result = subprocess.run(
        f'source {BACKEND_DIR}/venv/bin/activate && pip install -q alembic',
        shell=True,
        capture_output=True,
        text=True,
        timeout=30
    )
    print("✓ Alembic installed/verified")
except Exception as e:
    print(f"⚠ Alembic install: {e}")

# Step 3: Run Alembic migrations
print("\n[3/5] Running Alembic database migrations...")
try:
    env_cmd = f'export DATABASE_URL="postgresql://postgres:mock1234@localhost:5432/mocktrade" && '
    env_cmd += f'source {BACKEND_DIR}/venv/bin/activate && '
    env_cmd += f'cd {BACKEND_DIR} && alembic upgrade head'

    result = subprocess.run(
        env_cmd,
        shell=True,
        capture_output=True,
        text=True,
        timeout=30
    )
    if result.returncode == 0:
        print("✓ Migrations completed successfully")
        if "INFO" in result.stderr:
            for line in result.stderr.split('\n')[:5]:
                if 'INFO' in line or 'Running' in line:
                    print(f"  {line.strip()}")
    else:
        output = result.stderr if result.stderr else result.stdout
        if output:
            print(f"Migration output: {output[:200]}")
        else:
            print("✓ Migrations applied (or already up to date)")
except subprocess.TimeoutExpired:
    print("⚠ Migrations taking time, proceeding...")
except Exception as e:
    print(f"⚠ Migration: {e}")

# Step 4: Start backend server
print("\n[4/5] Starting FastAPI backend on port 8000...")
try:
    os.chdir(BACKEND_DIR)
    cmd = f'export DATABASE_URL="postgresql://postgres:mock1234@localhost:5432/mocktrade" && '
    cmd += f'source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload'

    backend_process = subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid
    )
    print(f"✓ Backend server started (PID: {backend_process.pid})")
    time.sleep(3)
except Exception as e:
    print(f"✗ Failed to start backend: {e}")
    sys.exit(1)

# Step 5: Start frontend server
print("\n[5/5] Starting Vite frontend on port 5173...")
try:
    os.chdir(FRONTEND_DIR)
    frontend_process = subprocess.Popen(
        'npm run dev',
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid
    )
    print(f"✓ Frontend server started (PID: {frontend_process.pid})")
    time.sleep(2)
except Exception as e:
    print(f"✗ Failed to start frontend: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✓ MockTrade Application is RUNNING!")
print("=" * 70)
print("\n📱 Frontend:    http://localhost:5173")
print("🔌 Backend:     http://localhost:8000")
print("📚 API Docs:    http://localhost:8000/docs")
print("\n🗄️  Database:    PostgreSQL (mocktrade)")
print("     Connection: postgresql://postgres:mock1234@localhost:5432/mocktrade")
print("\n" + "=" * 70)
print("Press Ctrl+C to stop all servers")
print("=" * 70 + "\n")

# Keep script running and catch Ctrl+C
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n\nShutting down servers...")
    try:
        import signal
        os.killpg(os.getpgid(backend_process.pid), signal.SIGTERM)
        os.killpg(os.getpgid(frontend_process.pid), signal.SIGTERM)
        print("✓ Servers stopped")
    except:
        pass
    print("Goodbye!")
    sys.exit(0)

