#!/bin/bash
# MockTrade Complete Startup Script

echo "========================================="
echo "MockTrade Full Stack Startup"
echo "========================================="
echo ""

# Kill any existing processes on ports 8000 and 5173
echo "Cleaning up any existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Start Backend API
echo ""
echo "Starting Backend API on port 8000..."
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "ERROR: Virtual environment not found. Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Start uvicorn
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Test backend
echo ""
echo "Testing backend connection..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Backend is running and responding!"
else
    echo "❌ Backend is not responding. Check the error logs above."
fi

# Start Frontend UI
echo ""
echo "Starting Frontend UI on port 5173..."
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui

if command -v npm &> /dev/null; then
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"

    sleep 3
    echo ""
    echo "========================================="
    echo "✅ MockTrade is Ready!"
    echo "========================================="
    echo ""
    echo "Frontend:  http://localhost:5173"
    echo "Backend:   http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""

    # Keep the script running
    wait
else
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

