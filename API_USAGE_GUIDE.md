# MockTrade API - Complete Usage Guide

**Last Updated:** December 14, 2025  
**Status:** ✅ Production Ready - Trader and Account Creation Working

---

## Quick Start (3 Steps)

### Step 1: Set Database Connection
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"
```

### Step 2: Start Backend API
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Start Frontend (in another terminal)
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev -- --port 5174
```

**Open:** http://localhost:5174

---

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{"status": "healthy"}
```

---

### 1. Trader Management

#### Create a Trader
```bash
curl -X POST http://localhost:8000/api/v1/static-data/traders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "trader001",
    "name": "John Smith",
    "desk": "FX",
    "status": "ACTIVE"
  }'
```

**Response:**
```json
{
  "trader_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "trader001",
  "name": "John Smith",
  "desk": "FX",
  "status": "ACTIVE",
  "created_at": "2025-12-14T17:01:49.957654",
  "updated_at": "2025-12-14T17:01:49.957654"
}
```

#### List All Traders
```bash
curl http://localhost:8000/api/v1/static-data/traders
```

#### Get Single Trader
```bash
curl http://localhost:8000/api/v1/static-data/traders/550e8400-e29b-41d4-a716-446655440000
```

#### Update Trader
```bash
curl -X PUT http://localhost:8000/api/v1/static-data/traders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "trader001",
    "name": "John Smith Updated",
    "desk": "EQUITIES",
    "status": "ACTIVE"
  }'
```

#### Delete Trader
```bash
curl -X DELETE http://localhost:8000/api/v1/static-data/traders/550e8400-e29b-41d4-a716-446655440000
```

---

### 2. Account Management

#### Create an Account
```bash
curl -X POST http://localhost:8000/api/v1/static-data/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ACC001",
    "name": "Primary Trading Account",
    "status": "ACTIVE"
  }'
```

**Response:**
```json
{
  "account_id": "660e8400-e29b-41d4-a716-446655440001",
  "code": "ACC001",
  "name": "Primary Trading Account",
  "status": "ACTIVE",
  "created_at": "2025-12-14T17:03:50.162662",
  "updated_at": "2025-12-14T17:03:50.162662"
}
```

#### List All Accounts
```bash
curl http://localhost:8000/api/v1/static-data/accounts
```

#### Get Single Account
```bash
curl http://localhost:8000/api/v1/static-data/accounts/660e8400-e29b-41d4-a716-446655440001
```

#### Update Account
```bash
curl -X PUT http://localhost:8000/api/v1/static-data/accounts/660e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ACC001",
    "name": "Primary Trading Account Updated",
    "status": "ACTIVE"
  }'
```

#### Delete Account
```bash
curl -X DELETE http://localhost:8000/api/v1/static-data/accounts/660e8400-e29b-41d4-a716-446655440001
```

---

### 3. Broker Management

#### Create a Broker
```bash
curl -X POST http://localhost:8000/api/v1/static-data/brokers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BRK001",
    "name": "Goldman Sachs",
    "status": "ACTIVE"
  }'
```

#### List All Brokers
```bash
curl http://localhost:8000/api/v1/static-data/brokers
```

#### Get Single Broker
```bash
curl http://localhost:8000/api/v1/static-data/brokers/{broker_id}
```

---

### 4. Instrument Management

#### Create an Instrument
```bash
curl -X POST http://localhost:8000/api/v1/static-data/instruments \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD",
    "name": "Euro/US Dollar",
    "asset_class": "FX",
    "instrument_type": "SPOT",
    "status": "ACTIVE",
    "metadata": {
      "lot_size": 100000,
      "decimal_places": 5
    }
  }'
```

#### List All Instruments
```bash
curl http://localhost:8000/api/v1/static-data/instruments
```

#### Get Single Instrument
```bash
curl http://localhost:8000/api/v1/static-data/instruments/{instrument_id}
```

---

## Database Query Examples

### View Traders in PostgreSQL
```bash
psql -U postgres -d mocktrade -c "SELECT * FROM trader;"
```

### View Accounts
```bash
psql -U postgres -d mocktrade -c "SELECT * FROM account;"
```

### Count Traders
```bash
psql -U postgres -d mocktrade -c "SELECT COUNT(*) FROM trader;"
```

### View Recently Created Traders (with timestamps)
```bash
psql -U postgres -d mocktrade -c "SELECT trader_id, user_id, name, created_at FROM trader ORDER BY created_at DESC LIMIT 5;"
```

---

## Debugging

### Check API Logs
```bash
# Last 50 lines
tail -50 /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log

# Follow logs in real-time
tail -f /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log

# Search for trader creation logs
grep "CREATE TRADER" /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log
```

### Check if Ports are in Use
```bash
# Check port 8000 (API)
lsof -i :8000

# Check port 5174 (Frontend)
lsof -i :5174
```

### Stop Running Processes
```bash
# Kill API server
pkill -f "uvicorn app.main:app"

# Kill all Node processes (frontend)
pkill -f "npm run dev"
```

### Test API Response Times
```bash
# Time a request
time curl http://localhost:8000/api/v1/static-data/traders
```

---

## Common Issues & Solutions

### Issue: "Connection refused" on port 8000
**Solution:**
```bash
# Check if process is running
ps aux | grep uvicorn

# Kill and restart
pkill -f "uvicorn app.main:app"
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue: "no such table: trader"
**Solution:**
```bash
# Initialize database
cd /Users/ravikiranreddygajula/MockTrade
python3 init_postgres.py
```

### Issue: "column 'status' does not exist"
**Solution:**
```bash
# Add missing columns
psql -U postgres -d mocktrade << 'EOF'
ALTER TABLE trader ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'ACTIVE';
ALTER TABLE trader ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE trader ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
EOF
```

### Issue: PostgreSQL not running
**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@16

# Check status
brew services list | grep postgres
```

---

## Performance Tips

1. **Use environment variable for DATABASE_URL:**
   - Set it before starting the app
   - Prevents fallback to SQLite

2. **Monitor logs for slow queries:**
   - Check api.log for timing information
   - Look for database session warnings

3. **Test with bulk operations:**
   - Create multiple traders/accounts
   - Monitor memory usage

4. **Use list endpoints efficiently:**
   - Query all traders: `GET /api/v1/static-data/traders`
   - Filter results in application code if needed

---

## Integration Testing

### Test Complete Flow
```bash
#!/bin/bash

# Create a trader
TRADER=$(curl -s -X POST http://localhost:8000/api/v1/static-data/traders \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","name":"Test Trader","desk":"TEST","status":"ACTIVE"}')

TRADER_ID=$(echo $TRADER | python3 -c "import sys, json; print(json.load(sys.stdin)['trader_id'])")
echo "Created trader: $TRADER_ID"

# Create an account
ACCOUNT=$(curl -s -X POST http://localhost:8000/api/v1/static-data/accounts \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST001","name":"Test Account","status":"ACTIVE"}')

ACCOUNT_ID=$(echo $ACCOUNT | python3 -c "import sys, json; print(json.load(sys.stdin)['account_id'])")
echo "Created account: $ACCOUNT_ID"

# Verify they exist
echo "Verifying trader..."
curl -s http://localhost:8000/api/v1/static-data/traders/$TRADER_ID | python3 -m json.tool

echo "Verifying account..."
curl -s http://localhost:8000/api/v1/static-data/accounts/$ACCOUNT_ID | python3 -m json.tool

# Cleanup
echo "Deleting trader..."
curl -s -X DELETE http://localhost:8000/api/v1/static-data/traders/$TRADER_ID

echo "Deleting account..."
curl -s -X DELETE http://localhost:8000/api/v1/static-data/accounts/$ACCOUNT_ID

echo "Test complete!"
```

---

## API Documentation

**Interactive API Docs:** http://localhost:8000/docs

This provides Swagger UI for:
- Exploring all available endpoints
- Testing endpoints directly
- Viewing request/response schemas
- Understanding parameter requirements

---

## Next Steps

1. ✅ Backend API running on port 8000
2. ⏳ Start frontend: `npm run dev -- --port 5174`
3. ⏳ Test trader creation in UI
4. ⏳ Create sample data for testing
5. ⏳ Monitor logs for any issues

---

## Support

For debugging:
1. Check `api.log` for errors
2. Look at request/response logs
3. Verify database connection
4. Check PostgreSQL is running
5. Verify environment variables are set

