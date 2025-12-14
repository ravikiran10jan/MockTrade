# ✅ MOCKTRADE SETUP COMPLETE

## What You Need to Do RIGHT NOW

### Step 1: Start the Backend API (REQUIRED)

Open a **NEW terminal window** and run:

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Expected output:**
```
Connecting to DB at: sqlite:///./dev.db
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Keep this terminal window open!**

---

### Step 2: Access the Frontend UI

Once the backend is running, open your browser to:
```
http://localhost:5173
```

---

## What I've Changed for You

### 1. ✅ Updated OrderEntry Component
- Instruments dropdown now **dynamically fetches** from your Static Data API
- No more hardcoded instrument list
- Automatically shows only instruments you've created

### 2. ✅ Fixed "Failed to fetch" Error
- The error was because **backend API was not running**
- Backend must run on `http://localhost:8000`
- I've added better error handling in the UI

### 3. ✅ Created Startup Scripts
- `start_mocktrade.sh` - Starts both backend and frontend automatically
- `check_status.sh` - Verifies both are running

---

## Workflow to Create Your First Order

### Step 1: Create an Instrument
1. Go to **Static Data** module (left sidebar)
2. Click **Instruments** tab
3. Click **New Entry** button
4. Fill in:
   - Symbol: `ES`
   - Name: `E-mini S&P 500`
   - Asset Class: `INDEX`
   - Instrument Type: `FUTURE`
   - Status: `ACTIVE`
5. Click **Create instrument** button

### Step 2: Create an Order
1. Go to **Order Entry** module (left sidebar)
2. Instrument dropdown will now show `ES` (and any other instruments you created)
3. Fill in:
   - Instrument: `ES`
   - Side: `Buy`
   - Qty: `100`
   - Price: `4500`
   - Type: `Limit`
   - TIF: `Day`
   - Trader: `T001`
   - Account: `ACC001`
4. Click **Create** button

### Step 3: View Your Order
- Order appears in the **Orders (1)** table below
- Click the order row to see details on the right panel
- Click **Refresh** to refresh the list

---

## Troubleshooting

### ❌ "Error: Failed to fetch" or "Cannot reach API server"

**Solution:** Backend is not running!

1. Open a new terminal
2. Run:
   ```bash
   cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
   source .venv/bin/activate
   python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. Refresh the browser (`Cmd+R`)

---

### ❌ Instrument dropdown is empty

**Solution:** You haven't created any instruments yet

1. Go to **Static Data** module
2. Click **Instruments**
3. Click **New Entry** and create at least one instrument
4. Go back to **Order Entry** - dropdown will update

---

### ❌ Port already in use (Error: address already in use)

**Solution:** Kill the existing process

```bash
# Kill any existing uvicorn on port 8000
lsof -ti:8000 | xargs kill -9

# Then restart
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Quick Commands Reference

### Verify backend is running:
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### List all instruments:
```bash
curl http://localhost:8000/api/v1/static-data/instruments
```

### List all orders:
```bash
curl http://localhost:8000/order/
```

### Create an order via API:
```bash
curl -X POST http://localhost:8000/order/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES",
    "qty": 100,
    "side": "BUY",
    "type": "LIMIT",
    "price": 4500,
    "trader": "T001",
    "account": "ACC001",
    "tif": "DAY"
  }'
```

---

## Architecture Summary

```
┌─────────────────────────────────────┐
│  Frontend UI (React + Vite)         │
│  http://localhost:5173              │
├─────────────────────────────────────┤
│  Modules:                           │
│  - Order Entry ✅                   │
│  - Static Data ✅                   │
│  - Confirmations ✅                 │
│  - Market Data                      │
│  - Enrichment                       │
│  - Trade Module                     │
└─────────────────────────────────────┘
                 ↓ (HTTP/REST)
┌─────────────────────────────────────┐
│  Backend API (FastAPI)              │
│  http://localhost:8000              │
├─────────────────────────────────────┤
│  Endpoints:                         │
│  - /health ✅                       │
│  - /order/ ✅                       │
│  - /api/v1/static-data/* ✅         │
└─────────────────────────────────────┘
                 ↓ (SQLite)
┌─────────────────────────────────────┐
│  Database                           │
│  mock-trade-api/dev.db              │
└─────────────────────────────────────┘
```

---

## Summary

✅ **Backend API** - Ready to run on port 8000
✅ **Frontend UI** - Ready to run on port 5173  
✅ **Order Entry Module** - Instruments fetched from Static Data
✅ **Static Data Module** - Create instruments, accounts, traders
✅ **Confirmations Module** - Monitor trade confirmations

**Just start the backend and go to http://localhost:5173!**

---

## Support

For detailed setup instructions, see:
- `LAUNCH_GUIDE_UPDATED.md` - Complete launch guide
- `check_status.sh` - Verify everything is running
- `start_mocktrade.sh` - Automated startup script

