#!/usr/bin/env python3
"""
Initialize SQLite database directly from SQLAlchemy models
DEPRECATED: Do not create schema automatically; use scripts/init_db_once.py instead.
"""
import sys
from pathlib import Path

print("This script is deprecated. To create the database schema run:")
print("  python3 scripts/init_db_once.py --seed  # ensure DATABASE_URL is set to sqlite:///path if desired")
sys.exit(0)
