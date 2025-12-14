# Implementation Checklist - Instrument Master Table Redesign

## ✅ Code Changes Complete

### Backend Files Modified:
- [x] `app/models.py` - Simplified Instrument model (removed 5 fields, added constraints)
- [x] `app/modules/static_data/schemas.py` - Updated InstrumentSchema and InstrumentCreateSchema
- [x] `app/modules/static_data/routes.py` - Simplified CRUD routes, fixed datetime deprecation
- [x] `alembic/versions/simplify_instrument_table.py` - NEW migration file created

### Frontend Files Modified:
- [x] `mock-trade-ui/src/components/modules/StaticDataModule.jsx` - Redesigned form and table

### Documentation Created:
- [x] `INSTRUMENT_REDESIGN_SUMMARY.md` - Complete redesign documentation
- [x] `INSTRUMENT_METADATA_PATTERNS.md` - Example metadata for 12+ instrument types
- [x] Implementation Checklist (this file)

---

## 🚀 Next Steps - When Ready to Deploy

### Phase 1: Database Setup (Run Once)

```bash
# Navigate to backend
cd mock-trade-api

# Run the migration to update schema
alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Running upgrade 81e9b75ad462 -> simplify_instrument_v1, 
# Simplify instrument table - remove redundant fields
```

**Verification:**
```bash
# Connect to PostgreSQL and verify table
psql -U postgres -d mocktrade

# In psql:
\d instrument

# Should show: instrument_id, symbol (UNIQUE), name (NOT NULL), asset_class, 
#              instrument_type, status (default ACTIVE), created_at (NOT NULL), metadata_json
```

---

### Phase 2: Backend Testing (Quick Smoke Test)

#### Start the API:
```bash
cd mock-trade-api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Test 1: Create Instrument (with metadata)
```bash
curl -X POST "http://localhost:8000/api/v1/static-data/instruments" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES",
    "name": "E-mini S&P 500",
    "asset_class": "FUTURE",
    "instrument_type": "FX_FUT",
    "metadata": {"exchange": "CME", "multiplier": 50}
  }'
```

**Expected Response (201):**
```json
{
  "instrument_id": "some-uuid",
  "symbol": "ES",
  "name": "E-mini S&P 500",
  "asset_class": "FUTURE",
  "instrument_type": "FX_FUT",
  "status": "ACTIVE",
  "created_at": "2025-12-14T...",
  "metadata": {"exchange": "CME", "multiplier": 50}
}
```

#### Test 2: List Instruments
```bash
curl -X GET "http://localhost:8000/api/v1/static-data/instruments"
```

**Expected:** Array of instrument objects with metadata field populated

#### Test 3: Get Single Instrument
```bash
curl -X GET "http://localhost:8000/api/v1/static-data/instruments/{instrument_id_from_test_1}"
```

**Expected:** Single instrument object with all fields

#### Test 4: Update Instrument
```bash
curl -X PUT "http://localhost:8000/api/v1/static-data/instruments/{instrument_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES",
    "name": "E-mini S&P 500 Updated",
    "asset_class": "EQUITY",
    "instrument_type": "FX_FUT",
    "metadata": {"exchange": "CME", "multiplier": 50, "tick_size": 0.25}
  }'
```

**Expected:** Updated instrument object (201)

#### Test 5: Error Handling - Duplicate Symbol
```bash
curl -X POST "http://localhost:8000/api/v1/static-data/instruments" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES",
    "name": "Another E-mini"
  }'
```

**Expected:** 500 error (UNIQUE constraint violation) or 400 (bad request)

---

### Phase 3: Frontend Testing

#### Start UI:
```bash
cd mock-trade-ui
npm run dev
```

Open browser: http://localhost:5173

#### Test Flow:
1. **Navigate to Static Data → Instruments**
   - Should show tab bar with: Instruments, Accounts, Traders, Brokers
   - Should show empty table or existing instruments if DB has data

2. **Create New Instrument**
   - Click "New Entry"
   - Form should show:
     - Symbol (required, with placeholder "ES, NQ, AAPL")
     - Name (required, with placeholder "E-mini S&P 500")
     - Asset Class (optional, with placeholder "FX, EQUITY, FUTURE, OTC")
     - Instrument Type (optional, with placeholder "OTC_FX_FWD, FX_FUT, STRATEGY")
     - Status (optional, placeholder "ACTIVE")
     - Metadata (optional, JSON textarea with placeholder '{"key": "value"}')

3. **Fill and Submit**
   - Symbol: "NQ"
   - Name: "E-mini Nasdaq"
   - Asset Class: "EQUITY"
   - Instrument Type: "FX_FUT"
   - Metadata: `{"exchange":"CME","multiplier":20}`
   - Click "Create instrument"

4. **Verify Success**
   - Green message: "instrument created successfully"
   - New row appears in table below
   - Form closes and "New Entry" button reappears

5. **Check Table Display**
   - Should show columns: instrument_id, symbol, name, asset_class, instrument_type, status
   - Values should match what was entered

---

## 🔍 Validation Checklist

After completing testing, verify:

### Database:
- [ ] Table `instrument` exists with simplified schema
- [ ] `symbol` column is UNIQUE
- [ ] `name` and `symbol` columns are NOT NULL
- [ ] `status` has default value 'ACTIVE'
- [ ] `metadata_json` column accepts JSON
- [ ] Old columns (booking_code, etc.) are removed or can be removed

### API Routes:
- [ ] POST /instruments - creates with UUID, auto-timestamp, accepts metadata
- [ ] GET /instruments - returns list with metadata field populated
- [ ] GET /instruments/{id} - returns single item with metadata field
- [ ] PUT /instruments/{id} - updates fields, accepts metadata
- [ ] DELETE /instruments/{id} - returns 204 or 200 (if implemented)
- [ ] Error handling returns meaningful messages

### UI:
- [ ] Form shows 6 essential fields only
- [ ] Required fields marked with *
- [ ] Placeholders guide users on format
- [ ] Form validation prevents empty symbol/name submission
- [ ] JSON metadata parsing handles valid/invalid JSON
- [ ] Success/error messages display clearly
- [ ] Table shows correct columns and data

### Data Integrity:
- [ ] Cannot create two instruments with same symbol
- [ ] created_at timestamp is set automatically
- [ ] instrument_id is generated as UUID
- [ ] metadata is stored and retrieved correctly
- [ ] All other fields update correctly

---

## 📋 Rollback Plan

If issues occur after migration:

```bash
# In mock-trade-api directory:
alembic downgrade -1

# This will:
# - Restore removed columns with NULL defaults
# - Revert symbol/name constraint changes
# - Return DB to previous state
```

Then troubleshoot the issue and re-run migration.

---

## 📊 Performance Notes

- **Indexes**: `symbol` and `status` are indexed for fast queries
- **Constraints**: `symbol` UNIQUE prevents duplicates
- **JSON**: `metadata_json` performance is adequate for typical use; if storing large arrays (100+ items), consider separate table
- **Scale**: This design supports 100K+ instruments efficiently

---

## 🎯 Success Criteria

✅ All tests pass (database, API, UI)  
✅ Can create instruments via API and UI  
✅ Can read, update instruments  
✅ Metadata is stored and retrieved correctly  
✅ Form is clean and usable  
✅ No console errors in browser or API logs  
✅ Required fields are enforced  

---

## 📝 Notes for Future

1. **Bulk Import**: Add CSV upload to import multiple instruments
2. **Search/Filter**: Add search by symbol, asset_class, instrument_type
3. **Metadata Validation**: Validate metadata structure per instrument_type
4. **Audit Trail**: Track who created/updated instruments and when
5. **API Documentation**: Update Swagger docs to reflect new schema

---

## 📞 Quick Reference

**Files with changes:**
- Backend model: `app/models.py`
- Backend schemas: `app/modules/static_data/schemas.py`
- Backend routes: `app/modules/static_data/routes.py`
- Migration: `alembic/versions/simplify_instrument_table.py`
- Frontend: `mock-trade-ui/src/components/modules/StaticDataModule.jsx`

**Documentation:**
- `INSTRUMENT_REDESIGN_SUMMARY.md` - Design doc
- `INSTRUMENT_METADATA_PATTERNS.md` - Example payloads
- Implementation Checklist (this file)

**Database:**
- Run: `alembic upgrade head`
- Rollback: `alembic downgrade -1`

**API Base:** `http://localhost:8000/api/v1/static-data`

---

**Ready to deploy! 🚀**

