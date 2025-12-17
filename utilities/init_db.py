#!/usr/bin/env python3
"""
Direct database initialization helper (DEPRECATED as an automatic initializer).
This project now uses Alembic for schema migrations. If you need to create tables
manually for a fresh database, run the one-off script:

  python3 scripts/init_db_once.py --seed

Do not run this file automatically as part of application startup.
"""
import sys
from pathlib import Path

print("This script has been deprecated for automatic use.")
print("To create the database schema run: python3 scripts/init_db_once.py --seed")
sys.exit(0)
