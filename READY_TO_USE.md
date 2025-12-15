# MockTrade - READY TO USE ✅

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Backend API** | ✅ Running | Port 8000 - PostgreSQL connected |
| **Database** | ✅ Configured | PostgreSQL mocktrade database |
| **Trader Creation** | ✅ Working | Verified with test |
| **Account Creation** | ✅ Working | Verified with test |
| **Debug Logging** | ✅ Enabled | Comprehensive logs in api.log |
| **Frontend UI** | 🔴 Stopped | Ready to start |

---

## Start the Frontend (NEXT STEP)

### In a new terminal:
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev -- --port 5174
```

### Wait for output like:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5174/
  ➜  press h to show help
```

### Then open in browser:
```
http://localhost:5174
```

---

## What You Can Do Now

✅ **Create Traders** - Click "Create New Trader" button in UI  
✅ **Create Accounts** - Click "Create New Account" button in UI  
✅ **View Traders** - See list of all traders  
✅ **View Accounts** - See list of all accounts  
✅ **View Logs** - Check detailed operation logs  
✅ **Query Database** - Use PostgreSQL CLI  

---

## Commands Summary

### Backend API (Already Running)
```bash
# View logs
tail -f /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log

# Kill if needed
pkill -f "uvicorn app.main:app"
```

### Frontend (Start in new terminal)
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev -- --port 5174
```

### API Health Check
```bash
curl http://localhost:8000/health
```

### Test Trader Creation
```bash
curl -X POST http://localhost:8000/api/v1/static-data/traders \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","name":"Test","desk":"TEST","status":"ACTIVE"}'
```

---

## Verify Everything Works

### Backend API Logs
Look for these messages in logs:
```
✓ Application startup complete
✓ All routes registered successfully  
✓ Registering static_data routes...
```

### Create Trader Test
```bash
$ curl -s http://localhost:8000/api/v1/static-data/traders | python3 -m json.tool

# Should show array of traders with:
# - trader_id
# - user_id
# - name
# - desk
# - status
# - created_at
# - updated_at
```

---

## Database Access

### View Traders in PostgreSQL
```bash
psql -U postgres -d mocktrade -c "SELECT * FROM trader;"
```

### View Accounts
```bash
psql -U postgres -d mocktrade -c "SELECT * FROM account;"
```

### View Brokers
```bash
psql -U postgres -d mocktrade -c "SELECT * FROM broker;"
```

---

## Troubleshooting

### If API doesn't respond
```bash
# Check if it's running
ps aux | grep uvicorn

# Check logs
tail -50 /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log
```

### If database connection fails
```bash
# Verify PostgreSQL is running
psql -U postgres -d mocktrade -c "SELECT version();"

# Check environment variable
echo $DATABASE_URL
```

### If frontend won't start
```bash
# Kill any existing processes
lsof -i :5174 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Try again
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm install  # In case node_modules is missing
npm run dev -- --port 5174
```

---

## Key Files & Locations

| Purpose | Path |
|---------|------|
| Backend API Code | `/Users/ravikiranreddygajula/MockTrade/mock-trade-api` |
| Frontend UI Code | `/Users/ravikiranreddygajula/MockTrade/mock-trade-ui` |
| API Logs | `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log` |
| Database Config | `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/app/database.py` |
| Routes | `/Users/ravikiranreddygajula/MockTrade/mock-trade-api/app/modules/static_data/routes.py` |
| Debug Guide | `/Users/ravikiranreddygajula/MockTrade/DEBUG_SUMMARY_AND_FIX.md` |
| API Guide | `/Users/ravikiranreddygajula/MockTrade/API_USAGE_GUIDE.md` |

---

## Environment Variables

If you need to restart, remember to set:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"
```

---

## Success Indicators

You'll know everything is working when:

1. ✅ Backend API starts without errors
2. ✅ Frontend loads in browser at http://localhost:5174
3. ✅ You can see "Create Trader" button in UI
4. ✅ Clicking "Create Trader" shows a form
5. ✅ Filling form and submitting creates a trader
6. ✅ New trader appears in the traders list

---

## Next: Start Frontend

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev -- --port 5174
```

Then open: **http://localhost:5174**

