#!/usr/bin/env python3
"""
Simple script to start the MockTrade API with SQLite for testing
NOTE: This script used to create SQLite tables at startup. That behavior has been removed.
Schema creation must be performed manually via scripts/init_db_once.py or via Alembic migrations.
"""
import os
import sys
from pathlib import Path

# Do NOT set DATABASE_URL to SQLite automatically; require explicit env var or external config
# If you want a local SQLite dev DB, set it before running this script, e.g.:
# export DATABASE_URL='sqlite:///./dev.db'

# Add mock-trade-api to path
sys.path.insert(0, str(Path(__file__).parent / 'mock-trade-api'))

print("NOTE: startup will NOT create or modify database schema.")
print("If you need to initialize the database schema for development, run:")
print("  python3 scripts/init_db_once.py --seed  # run manually")

# Now start the server
import uvicorn
print("Starting FastAPI server on http://localhost:8000")
uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

