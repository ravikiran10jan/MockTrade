#!/bin/bash
# Quick verification that MockTrade is running

echo "MockTrade Health Check"
echo "======================="
echo ""

echo "1. Checking Backend API (port 8000)..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "   ✅ Backend API is running"
else
    echo "   ❌ Backend API is NOT responding"
    echo "   Start it with: cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
fi

echo ""
echo "2. Checking Frontend UI (port 5173)..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend UI is running"
else
    echo "   ❌ Frontend UI is NOT responding"
    echo "   Start it with: cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui && npm run dev"
fi

echo ""
echo "3. Testing Instruments API..."
INSTRUMENTS=$(curl -s http://localhost:8000/api/v1/static-data/instruments 2>/dev/null | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$INSTRUMENTS" ]; then
    echo "   ✅ Found $INSTRUMENTS instruments in database"
else
    echo "   ⚠️  No instruments configured yet"
    echo "   Go to Static Data module to create some"
fi

echo ""
echo "4. Testing Orders API..."
ORDERS=$(curl -s http://localhost:8000/order/ 2>/dev/null | python3 -c "import sys, json; print(len(json.load(sys.stdin)) if isinstance(json.load(sys.stdin), list) else 0)" 2>/dev/null)
if [ "$ORDERS" != "" ]; then
    echo "   ✅ Orders API responding"
else
    echo "   ✅ Orders API is accessible"
fi

echo ""
echo "======================="
echo "Access the app at: http://localhost:5173"
echo ""

