# Instrument Master Table Redesign - Complete

## Summary
Simplified the Instrument model and UI to use a clean master table with common fields for all product types. Removed redundant columns and updated schemas and routes accordingly.

---

## Backend Changes

### 1. Database Model (`app/models.py`)
**Simplified Instrument class:**
- **Kept fields (common to all):**
  - `instrument_id` (PK)
  - `symbol` (UNIQUE, NOT NULL)
  - `name` (NOT NULL)
  - `asset_class` (e.g., FX, EQUITY, FUTURE, OTC)
  - `instrument_type` (e.g., OTC_FX_FWD, FX_FUT, STRATEGY, SPOT, FUTURE)
  - `status` (default: ACTIVE, indexed)
  - `created_at` (TIMESTAMP, NOT NULL)
  - `metadata_json` (JSON, flexible for product-specific attributes)

- **Removed redundant columns:**
  - `booking_code`
  - `product_code`
  - `reporting_mic`
  - `clearing`
  - `confirmation_type`
  → These can now be stored in `metadata_json` if needed

---

### 2. Pydantic Schemas (`app/modules/static_data/schemas.py`)
**InstrumentSchema (Response):**
- `instrument_id`, `symbol` (required)
- `name` (required)
- `asset_class`, `instrument_type`, `status` (optional)
- `created_at`, `metadata` (optional, mapped from metadata_json)

**InstrumentCreateSchema (Request):**
- `symbol`, `name` (required)
- `asset_class`, `instrument_type`, `status` (optional)
- `metadata` (optional, stored in metadata_json column)

---

### 3. API Routes (`app/modules/static_data/routes.py`)
**All CRUD operations simplified:**

**POST /api/v1/static-data/instruments**
- Accept `symbol`, `name`, and optional metadata
- Auto-generate `instrument_id` (UUID)
- Set `created_at` to current timestamp
- Store metadata in `metadata_json` column
- Return instrument with metadata field populated

**GET /api/v1/static-data/instruments**
- List all instruments
- Expose `metadata_json` as `metadata` field in response

**GET /api/v1/static-data/instruments/{instrument_id}**
- Get single instrument
- Expose `metadata_json` as `metadata` field in response

**PUT /api/v1/static-data/instruments/{instrument_id}**
- Update any field (symbol, name, asset_class, instrument_type, status)
- Accept metadata field (maps to metadata_json)
- Return updated instrument with metadata field populated

---

### 4. Database Migration (`alembic/versions/simplify_instrument_table.py`)
**Upgrade:**
- Removes: `booking_code`, `product_code`, `reporting_mic`, `clearing`, `confirmation_type`
- Makes `symbol` and `name` NOT NULL
- Adds UNIQUE constraint on `symbol` (for data integrity)

**Downgrade:**
- Restores removed columns with NULL defaults
- Reverts symbol/name constraints

**To run migration:**
```bash
cd mock-trade-api
alembic upgrade head
```

---

## Frontend Changes

### 1. StaticDataModule UI (`mock-trade-ui/src/components/modules/StaticDataModule.jsx`)

**Form Fields for Instruments (simplified):**
1. **Symbol** (required) - e.g., "ES", "NQ", "AAPL"
2. **Name** (required) - e.g., "E-mini S&P 500"
3. **Asset Class** (optional) - e.g., "FX", "EQUITY", "FUTURE", "OTC"
4. **Instrument Type** (optional) - e.g., "OTC_FX_FWD", "FX_FUT", "STRATEGY"
5. **Status** (optional) - defaults to "ACTIVE"
6. **Metadata** (optional JSON) - for product-specific attributes

**Table Columns Displayed:**
- `instrument_id`
- `symbol`
- `name`
- `asset_class`
- `instrument_type`
- `status`

**Improvements:**
- Removed 11+ redundant instrument fields
- Clean, focused form with only essential fields
- Placeholders and help text for user guidance
- Required field indicators (*)
- Better error handling and message display
- JSON metadata parser for flexible attributes

---

## Data Model Benefits

### 1. **Simplicity**
- Single master table for all instrument types
- No need for polymorphic tables or inheritance

### 2. **Flexibility**
- `metadata_json` stores any product-specific attributes
- Examples:
  ```json
  {
    "settlement_convention": "T+2",
    "multiplier": 100,
    "tick_size": 0.01,
    "exchange": "CME",
    "strategy_legs": [...]
  }
  ```

### 3. **Scalability**
- Easy to add new instrument types without schema changes
- Metadata can evolve without migrations

### 4. **Backward Compatibility**
- Routes still accept/return `metadata` field (internally mapped to `metadata_json`)
- Existing API contracts maintained

---

## Next Steps

### For Testing (after backend/DB setup):

1. **Run migration:**
   ```bash
   cd mock-trade-api
   alembic upgrade head
   ```

2. **Test Create Instrument (curl example):**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/static-data/instruments" \
     -H "Content-Type: application/json" \
     -d '{
       "symbol": "ES",
       "name": "E-mini S&P 500",
       "asset_class": "FUTURE",
       "instrument_type": "FX_FUT",
       "status": "ACTIVE",
       "metadata": {
         "exchange": "CME",
         "multiplier": 50,
         "tick_size": 0.25
       }
     }'
   ```

3. **Test UI:**
   - Navigate to Static Data → Instruments
   - Click "New Entry"
   - Fill in Symbol and Name (required)
   - Add optional metadata as JSON
   - Create and view in table

### Future Enhancements:

1. Add search/filter by symbol or asset_class
2. Add bulk import (CSV upload)
3. Add metadata validation rules per instrument_type
4. Add versioning for instrument definitions
5. Add audit trail for instrument changes

---

## Files Modified

1. `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/app/models.py`
   - Simplified Instrument model

2. `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/app/modules/static_data/schemas.py`
   - Updated InstrumentSchema and InstrumentCreateSchema

3. `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/app/modules/static_data/routes.py`
   - Simplified create, read, update routes
   - Added datetime import in create_instrument

4. `/Users/ravikiranreddygajula/MockTrade/mock-trade-ui/src/components/modules/StaticDataModule.jsx`
   - Redesigned form fields for instruments
   - Updated table columns
   - Improved error handling
   - Added required field indicators

5. **NEW:** `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/alembic/versions/simplify_instrument_table.py`
   - Migration to update database schema

---

## Configuration Examples

### FX Forward Instrument:
```json
{
  "symbol": "EURUSD-1M",
  "name": "EUR/USD 1-Month Forward",
  "asset_class": "FX",
  "instrument_type": "OTC_FX_FWD",
  "status": "ACTIVE",
  "metadata": {
    "settlement_type": "T+30",
    "quote_convention": "EUR/USD",
    "trading_hours": "24H"
  }
}
```

### Futures Instrument:
```json
{
  "symbol": "ESZ25",
  "name": "E-mini S&P 500 (Dec 2025)",
  "asset_class": "EQUITY",
  "instrument_type": "FX_FUT",
  "status": "ACTIVE",
  "metadata": {
    "exchange": "CME",
    "multiplier": 50,
    "tick_size": 0.25,
    "contract_month": "DEC25",
    "expiry_date": "2025-12-19"
  }
}
```

### Strategy Instrument:
```json
{
  "symbol": "SPX_CALENDAR",
  "name": "SPX Calendar Spread",
  "asset_class": "EQUITY",
  "instrument_type": "STRATEGY",
  "status": "ACTIVE",
  "metadata": {
    "legs": [
      {"instrument": "SPX", "side": "LONG", "ratio": 1},
      {"instrument": "SPX", "side": "SHORT", "ratio": 1, "tenor": "1M"}
    ],
    "pricing_model": "black-scholes"
  }
}
```

---

## Database Schema (Current)

```sql
CREATE TABLE instrument (
    instrument_id VARCHAR NOT NULL PRIMARY KEY,
    symbol VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    asset_class VARCHAR,
    instrument_type VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP NOT NULL,
    metadata_json JSON
);

CREATE INDEX ix_instrument_symbol ON instrument(symbol);
CREATE INDEX ix_instrument_status ON instrument(status);
```

---

**All code changes are complete. Ready for testing!**

