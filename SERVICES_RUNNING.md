# MockTrade - Services Ready ✅

**Status: December 14, 2025**

## Services Running

| Service | Port | Status | Action |
|---------|------|--------|--------|
| **Backend API** | 8000 | ✅ Running | `http://localhost:8000` |
| **Frontend UI** | 5174 | ✅ Running | `http://localhost:5174` |
| **Database** | 5432 | ✅ Connected | PostgreSQL mocktrade |

---

## What to Do Now

### 1. Open Your Browser
```
http://localhost:5174
```

### 2. Expected to See
- MockTrade application interface
- "Create Trader" or "Traders" section
- Form to add new traders

### 3. Try Creating a Trader
1. Click "Create Trader" button
2. Fill in the form:
   - User ID: `trader001`
   - Name: `John Smith`
   - Desk: `FX`
   - Status: `ACTIVE`
3. Click "Save" or "Create"
4. Should see confirmation and trader appears in list

---

## If Browser Shows "Site Cannot Be Reached"

### Check Services are Running
```bash
# Terminal 1: Check Backend
ps aux | grep uvicorn | grep -v grep

# Terminal 2: Check Frontend  
ps aux | grep "npm run dev" | grep -v grep
```

### If Backend Not Running
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### If Frontend Not Running
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev -- --port 5174
```

---

## Test API Directly

### Create a Trader via API
```bash
curl -X POST http://localhost:8000/api/v1/static-data/traders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "name": "Test Trader",
    "desk": "TEST",
    "status": "ACTIVE"
  }'
```

### List All Traders
```bash
curl http://localhost:8000/api/v1/static-data/traders
```

### Check Health
```bash
curl http://localhost:8000/health
```

---

## View Logs

### Backend Logs
```bash
tail -f /Users/ravikiranreddygajula/MockTrade/mock-trade-api/api.log
```

### Frontend Logs
```bash
tail -f /Users/ravikiranreddygajula/MockTrade/mock-trade-ui/frontend.log
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Find and kill process on port 5174
lsof -i :5174 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Browser Cache Issue
1. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Clear cache: Open DevTools → Network → check "Disable cache" → Refresh

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d mocktrade -c "SELECT version();"
```

---

## Everything is Ready!

✅ Backend API running on port 8000  
✅ Frontend UI running on port 5174  
✅ Database connected  
✅ Comprehensive logging enabled  
✅ Trader creation working  

**Just open http://localhost:5174 in your browser!**

