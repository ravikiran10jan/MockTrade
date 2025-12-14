# 🚀 COMPLETE SETUP GUIDE - RUN THIS NOW

## The Issue
When you click "Create" on an order, you get "Error: Failed to fetch" because the backend API is not running.

## The Solution

### STEP 1: Open TWO Terminal Windows

#### Terminal Window 1 - Start the Backend API
Copy and paste this ENTIRE command:

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api && source .venv/bin/activate && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Wait until you see:**
```
INFO:     Application startup complete.
```

**DO NOT CLOSE THIS TERMINAL - Leave it open and running!**

---

#### Terminal Window 2 - Start the Frontend UI (Optional)
If the frontend is not already running on http://localhost:5173:

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui && npm run dev
```

---

### STEP 2: Test in Browser
1. Open http://localhost:5173 in your browser
2. Hard refresh: `Cmd + Shift + R`
3. Try creating an order - it should work now!

---

## If You Still Get the Error

### Check if API is Running
In a terminal, run:
```bash
curl http://localhost:8000/health
```

**Expected response:** `{"status":"healthy"}`

If you get "Connection refused", the API is NOT running. Go back to Step 1 and start the backend.

---

## Quick Test - Create an Order via Command Line

Make sure API is running, then run:

```bash
curl -X POST http://localhost:8000/order/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD_FWD_3M",
    "qty": 100,
    "side": "BUY",
    "type": "LIMIT",
    "price": 1.15,
    "trader": "TRADER1",
    "account": "ACC001",
    "tif": "DAY"
  }'
```

If this works, the API is fine and you can use the UI to create orders.

---

## Summary

✅ **Backend API must be running on port 8000**
✅ **Frontend must be running on port 5173 (or you access it via that port)**
✅ **Keep the backend terminal open at all times**

That's it! The app is fully configured. Just keep both services running.

