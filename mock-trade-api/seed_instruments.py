#!/usr/bin/env python3
"""
Seed script to insert instruments into the database using SQLAlchemy models.
This script will NOT create tables automatically; ensure the schema exists (use Alembic
or scripts/init_db_once.py to create tables before running this seed script).
"""
import os
import sys
from pathlib import Path

# Add project to path
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DATABASE_URL', os.getenv('DATABASE_URL', 'sqlite:///./dev.db'))

from app.database import SessionLocal, engine
from app.models import Instrument
from datetime import datetime
import json

print('NOTE: This seed script assumes the database schema already exists.')
print('If needed, create schema first: python3 scripts/init_db_once.py --seed')

instruments = [
    {
        "instrument_id": "FXFWD-EURUSD-001",
        "symbol": "EURUSD_FWD",
        "name": "EUR/USD FX Forward",
        "asset_class": "FX",
        "instrument_type": "OTC_FX_FWD",
        "status": "ACTIVE",
        "metadata": {
            "notional_currency": "EUR",
            "default_notional": 10000000,
            "counter_currency": "USD",
            "settlement_type": "CASH",
            "settlement_currency": "USD",
            "settlement_convention": "ACT/360_MODIFIED_FOLLOWING_TARGET",
            "pricing_model": "FX_FORWARD_IRPARITY",
            "booking_code": "OTC_FWD_EURUSD",
            "reporting_mic": "XOFF",
            "clearing": "BILATERAL",
            "confirmation_type": "ISDA_2002_FX"
        }
    },
    {
        "instrument_id": "6E-FUT-CME-001",
        "symbol": "6E",
        "name": "CME Euro FX Futures",
        "asset_class": "FX",
        "instrument_type": "FX_FUT",
        "status": "ACTIVE",
        "metadata": {
            "root_symbol": "6E",
            "contract_size_eur": 125000,
            "price_quotation": "USD per EUR to 5 decimals",
            "tick_size": 0.00005,
            "tick_value": 6.25,
            "contract_months": ["MAR","JUN","SEP","DEC"],
            "clearing_house": "CME Clearing",
            "trading_venue_mic": "XCME",
            "product_code": "FUT_EURUSD_CME_6E"
        }
    },
    {
        "instrument_id": "STRAD-6E-ATM-001",
        "symbol": "6E-STRAD-ATM",
        "name": "Long ATM Straddle on 6E",
        "asset_class": "FX",
        "instrument_type": "STRATEGY",
        "status": "ACTIVE",
        "metadata": {
            "strategy_id": "STRAD-6E-ATM-001",
            "strategy_name": "Long ATM Straddle on Euro FX Futures",
            "legs": [
                {"leg_id": "STRAD-6E-ATM-001-CALL", "type": "OPTION_ON_FUTURES", "right": "CALL", "position": "LONG", "underlying": "6E", "strike": "ATM", "expiry": "MATCH_FUTURES_EXPIRY", "style": "EUROPEAN", "contract_multiplier": 125000},
                {"leg_id": "STRAD-6E-ATM-001-PUT", "type": "OPTION_ON_FUTURES", "right": "PUT", "position": "LONG", "underlying": "6E", "strike": "ATM", "expiry": "MATCH_FUTURES_EXPIRY", "style": "EUROPEAN", "contract_multiplier": 125000}
            ],
            "default_ratio": "1:1",
            "tradable_as_strategy": True,
            "strategy_code": "6E-STRAD-ATM",
            "quoting_convention": "NET_PREMIUM_USD_PER_CONTRACT"
        }
    }
]


def seed():
    db = SessionLocal()
    try:
        for ins in instruments:
            existing = db.query(Instrument).filter(Instrument.instrument_id == ins["instrument_id"]).first()
            if existing:
                print(f"Skipping existing: {ins['instrument_id']}")
                continue
            db_ins = Instrument(
                instrument_id=ins["instrument_id"],
                symbol=ins["symbol"],
                name=ins.get("name"),
                asset_class=ins.get("asset_class"),
                instrument_type=ins.get("instrument_type"),
                status=ins.get("status", "ACTIVE"),
                created_at=datetime.utcnow(),
                metadata_json=ins.get("metadata"),
            )
            db.add(db_ins)
        db.commit()
        print("Seed complete")
    except Exception as e:
        print("Seed error:", e)
    finally:
        db.close()


if __name__ == '__main__':
    seed()
