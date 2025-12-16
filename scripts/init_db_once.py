#!/usr/bin/env python3
"""
One-off DB initialization script.

This script must be run manually and will create the database schema
from SQLAlchemy models and optionally seed minimal data.

USAGE (example):

# Ensure DATABASE_URL is set (Postgres only)
export DATABASE_URL='postgresql://postgres:mock1234@localhost:5432/mocktrade'
python3 scripts/init_db_once.py --seed

Note: This should NOT be run automatically by the application. Use Alembic for
schema migrations in normal operation.
"""
import os
import sys
from pathlib import Path
import argparse
from datetime import datetime
import uuid

parser = argparse.ArgumentParser(description='One-off DB init: create schema and optionally seed data')
parser.add_argument('--seed', action='store_true', help='Seed minimal data after creating tables')
args = parser.parse_args()

# Ensure mock-trade-api is importable
sys.path.insert(0, str(Path(__file__).parent.parent / 'mock-trade-api'))

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print('ERROR: DATABASE_URL environment variable is not set. This script requires a PostgreSQL URL.')
    print("Example: export DATABASE_URL='postgresql://postgres:mock1234@localhost:5432/mocktrade'")
    sys.exit(2)

print('Using DATABASE_URL:', DATABASE_URL)

try:
    from app.database import Base, engine, SessionLocal
    from app import models
except Exception as e:
    print('Failed to import application modules. Ensure mock-trade-api is on PYTHONPATH and DATABASE_URL is set.')
    raise

print('\nCreating tables from SQLAlchemy models (one-off)...')
try:
    Base.metadata.create_all(bind=engine)
    print('✓ Tables created successfully')
except Exception as e:
    print('✗ Error creating tables:', e)
    raise

if args.seed:
    print('\nSeeding minimal data...')
    db = SessionLocal()
    try:
        # Only seed if not present
        if db.query(models.Instrument).count() == 0:
            instruments = [
                models.Instrument(
                    instrument_id=str(uuid.uuid4()),
                    symbol='ES',
                    name='E-mini S&P 500',
                    asset_class='EQUITY',
                    instrument_type='FUTURES',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                ),
                models.Instrument(
                    instrument_id=str(uuid.uuid4()),
                    symbol='NQ',
                    name='E-mini Nasdaq-100',
                    asset_class='EQUITY',
                    instrument_type='FUTURES',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                )
            ]
            for inst in instruments:
                db.add(inst)
            print('✓ Seeded instruments')

        if db.query(models.Trader).count() == 0:
            traders = [
                models.Trader(
                    trader_id=str(uuid.uuid4()),
                    user_id='TRADER001',
                    name='John Doe',
                    desk='Equity Desk',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                ),
                models.Trader(
                    trader_id=str(uuid.uuid4()),
                    user_id='TRADER002',
                    name='Jane Smith',
                    desk='FX Desk',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                )
            ]
            for t in traders:
                db.add(t)
            print('✓ Seeded traders')

        if db.query(models.Account).count() == 0:
            accounts = [
                models.Account(
                    account_id=str(uuid.uuid4()),
                    code='ACC001',
                    name='Main Trading Account',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                ),
                models.Account(
                    account_id=str(uuid.uuid4()),
                    code='ACC002',
                    name='Prop Trading Account',
                    status='ACTIVE',
                    created_at=datetime.utcnow()
                )
            ]
            for a in accounts:
                db.add(a)
            print('✓ Seeded accounts')

        db.commit()
        print('Minimal seeding complete')
    except Exception as e:
        print('Error seeding data:', e)
        db.rollback()
        raise
    finally:
        db.close()

print('\nOne-off DB initialization finished. Remember: do NOT run this automatically in production; use Alembic for migrations.')

