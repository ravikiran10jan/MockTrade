# Quick Fix for "Error: Not Found" when adding traders

## Problem
The Static Data module shows "Error: Not Found" when trying to add a new trader because:
1. The backend API is not running
2. The trader table doesn't exist in the database (migrations not run)

## Solution

### Step 1: Start the Backend
Run this command in a terminal:
```bash
cd /Users/ravikiranreddygajula/MockTrade
python3 start_backend.py
```
This will:
- Create the SQLite database with all tables (including trader)
- Seed basic instruments, traders, and accounts for testing
- Start the FastAPI server on http://localhost:8000

### Step 2: Start the Frontend  
In another terminal:
```bash
cd /Users/ravikiranreddygajula/MockTrade
bash start_frontend.sh
```
This starts the Vite dev server on http://localhost:5173

### Step 3: Test
1. Open http://localhost:5173 in your browser
2. Go to Static Data → Traders
3. Try adding a new trader - it should work now!

## What was fixed
- Updated `vite.config.js` to proxy `/api` requests to `http://localhost:8000` (for local dev)
- Created scripts to easily start backend and frontend with SQLite
- Backend now creates all database tables automatically when started

## For Docker (when working)
If you want to use Docker later:
```bash
docker compose up -d db backend frontend
```
But the local scripts above should work immediately.

## Additional Fixes Applied
- **Order Entry 404 Error**: Fixed proxy configuration to forward `/order/` requests to backend
- **Response Body Read Error**: Fixed "body stream already read" error in error handling
- **Order Creation 500 Error**: Fixed frontend to send correct instrument_id and trader_id instead of display values
- **Trader Dropdown**: Now displays user_id but stores trader_id for database operations
- **Accounts Dropdown**: Now loads from Static Data API and displays account codes but stores account_ids
