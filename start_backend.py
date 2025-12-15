#!/usr/bin/env python3
"""
Simple script to start the MockTrade API with SQLite for testing
"""
import os
import sys
from pathlib import Path
from datetime import datetime
import uuid

# Set database URL to SQLite
os.environ['DATABASE_URL'] = 'sqlite:///./dev.db'

# Add mock-trade-api to path
sys.path.insert(0, str(Path(__file__).parent / 'mock-trade-api'))

from app.database import Base, engine, SessionLocal
from app import models

print("Creating tables in SQLite database...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

# Seed basic data
print("Seeding basic data...")
db = SessionLocal()

try:
    # Check if data already exists
    if db.query(models.Instrument).count() == 0:
        # Seed instruments
        instruments = [
            models.Instrument(
                instrument_id=str(uuid.uuid4()),
                symbol="ES",
                name="E-mini S&P 500",
                asset_class="EQUITY",
                instrument_type="FUTURES",
                status="ACTIVE",
                created_at=datetime.utcnow()
            ),
            models.Instrument(
                instrument_id=str(uuid.uuid4()),
                symbol="NQ",
                name="E-mini Nasdaq-100",
                asset_class="EQUITY",
                instrument_type="FUTURES",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
        ]
        for inst in instruments:
            db.add(inst)
        print("✓ Seeded instruments")

    if db.query(models.Trader).count() == 0:
        # Seed traders
        traders = [
            models.Trader(
                trader_id=str(uuid.uuid4()),
                user_id="TRADER001",
                name="John Doe",
                desk="Equity Desk",
                status="ACTIVE",
                created_at=datetime.utcnow()
            ),
            models.Trader(
                trader_id=str(uuid.uuid4()),
                user_id="TRADER002",
                name="Jane Smith",
                desk="FX Desk",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
        ]
        for trader in traders:
            db.add(trader)
        print("✓ Seeded traders")

    if db.query(models.Account).count() == 0:
        # Seed accounts
        accounts = [
            models.Account(
                account_id=str(uuid.uuid4()),
                code="ACC001",
                name="Main Trading Account",
                status="ACTIVE",
                created_at=datetime.utcnow()
            ),
            models.Account(
                account_id=str(uuid.uuid4()),
                code="ACC002",
                name="Prop Trading Account",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
        ]
        for account in accounts:
            db.add(account)
        print("✓ Seeded accounts")

    db.commit()
    print("Basic data seeded successfully!")

except Exception as e:
    print(f"Error seeding data: {e}")
    db.rollback()

finally:
    db.close()

# Now start the server
import uvicorn
print("Starting FastAPI server on http://localhost:8000")
uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

