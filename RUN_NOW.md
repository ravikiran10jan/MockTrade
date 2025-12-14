# 🚀 EXACT STEPS TO RUN MOCKTRADE NOW

## Copy and Paste These Commands

### In Terminal 1 (Backend API):

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Wait until you see:
```
INFO:     Application startup complete.
```

**Leave this terminal running!**

---

### In Terminal 2 (Frontend UI):

```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev
```

Wait until you see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

**Leave this terminal running!**

---

### In Your Browser:

Open: **http://localhost:5173**

---

## You're Done! ✅

The app is now running. 

To create your first order:
1. Go to **Static Data** module
2. Create an instrument (Symbol: ES, Name: E-mini S&P 500, etc.)
3. Go to **Order Entry** module
4. Fill in the form and click **Create**

---

## If You Get "Failed to fetch" Error

It means the backend is not running. Make sure you executed the commands in Terminal 1 and see:
```
INFO:     Application startup complete.
```

If not, check for errors in Terminal 1 and fix them.

---

Done! Enjoy MockTrade! 🎉

