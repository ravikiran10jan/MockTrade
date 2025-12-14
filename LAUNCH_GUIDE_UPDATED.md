# MockTrade Platform - Launch Guide

## Quick Start (Recommended)

### Option 1: Use the Startup Script (Easiest)
```bash
cd /Users/ravikiranreddygajula/MockTrade
./start_mocktrade.sh
```

This will:
- Kill any existing processes on ports 8000 and 5173
- Start the Backend API on http://localhost:8000
- Start the Frontend UI on http://localhost:5173
- Display connection status

### Option 2: Manual Startup (Two Terminal Windows)

**Terminal 1 - Backend API:**
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Terminal 2 - Frontend UI:**
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Testing the Connection

### Health Check
```bash
curl http://localhost:8000/health
# Expected response: {"status":"healthy"}
```

### List Instruments
```bash
curl http://localhost:8000/api/v1/static-data/instruments
# Expected response: JSON array of instruments
```

### Create an Order
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

## Troubleshooting

### "Error: Failed to fetch" in UI
**Problem:** Backend is not running on port 8000

**Solution:**
1. Make sure you started the backend with: `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. Check if port 8000 is in use: `lsof -i :8000`
3. If occupied, kill the process: `lsof -ti:8000 | xargs kill -9`

### "Cannot reach API server at localhost:8000"
**Solution:** Same as above - ensure backend is running on port 8000

### Instrument Dropdown is Empty
**Problem:** No instruments created in Static Data

**Solution:**
1. Go to **Static Data** module in the UI
2. Click **New Entry** under Instruments
3. Add some instruments (e.g., ES, NQ, AAPL)
4. Go back to **Order Entry** - dropdown will now show your instruments

### Orders Not Loading
**Problem:** Order endpoint not responding

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check the backend logs in the terminal window

## Architecture

### Backend (Port 8000)
- **Framework:** FastAPI (Python)
- **Database:** SQLite (dev.db)
- **Main Endpoints:**
  - `/health` - Health check
  - `/api/v1/static-data/instruments` - Instruments management
  - `/api/v1/static-data/accounts` - Accounts management
  - `/api/v1/static-data/traders` - Traders management
  - `/order/` - Order management (legacy)

### Frontend (Port 5173)
- **Framework:** React + Vite
- **Modules:**
  - Order Entry - Create and manage orders
  - Static Data - Manage instruments, accounts, traders
  - Confirmations - Monitor trade confirmations
  - Market Data - Market data feeds
  - Enrichment - Data enrichment rules
  - Trade Module - Trade lifecycle management

## Key Features

### Order Entry Module
- Create orders with automatic instrument lookup from Static Data
- Instrument dropdown populated from your configured instruments
- Side: Buy/Sell
- Order Type: Market, Limit, Stop, Stop Limit, etc.
- Time in Force: Day, GTC, IOC, FOK, GTD
- Advanced parameters: Iceberg, VWAP, TWAP, etc.

### Static Data Module
- Configure instruments (Symbol, Name, Asset Class, Type)
- Manage accounts, traders, brokers, and clearers
- OTC, ETD, and Strategy detail forms

## Common Workflows

### 1. Create Your First Order

1. **Start the Application**
   ```bash
   ./start_mocktrade.sh
   ```

2. **Go to Static Data Module**
   - Click "Instruments"
   - Click "New Entry"
   - Add: Symbol=ES, Name=E-mini S&P 500, Asset Class=INDEX, Type=FUTURE
   - Click "Create instrument"

3. **Go to Order Entry Module**
   - Instrument dropdown now shows "ES"
   - Fill in: Qty=100, Price=4500, Side=Buy, Type=Limit
   - Click "Create"

4. **See Your Order**
   - Order appears in the Orders table
   - Click on it to see details on the right panel

### 2. Test Confirmations
- Go to Confirmations module
- Create instruments and orders first
- Confirmations will appear as orders are matched

### 3. Manage Market Data
- Go to Market Data module
- Add market data quotes
- View price feeds for instruments

## Default Test Data

After startup, you can use these values:
- **Instruments:** ES, NQ, AAPL (or create your own)
- **Accounts:** ACC001, ACC002, ACC003
- **Traders:** T001, T002, T003
- **Order Types:** MARKET, LIMIT, STOP
- **TIF:** DAY, GTC, IOC, FOK, GTD

## Stopping the Application

**If using startup script:**
Press `Ctrl+C` in the terminal

**If running manually:**
Press `Ctrl+C` in each terminal window

## Questions or Issues?

Check the terminal logs for detailed error messages. The backend logs in Terminal 1 and frontend logs in Terminal 2 will help diagnose issues.

