#!/bin/bash
# Verify MockTrade Database & API Setup

echo "=========================================="
echo "MockTrade Setup Verification"
echo "=========================================="
echo ""

# Check Backend
echo "1️⃣  Backend API Status:"
if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
    echo "   ✅ Backend is RUNNING on port 8000"
else
    echo "   ⚠️  Backend appears to be starting, wait 5 seconds..."
    sleep 5
    if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
        echo "   ✅ Backend is NOW RUNNING"
    else
        echo "   ❌ Backend is NOT RESPONDING - start with: cd mock-trade-api && .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
    fi
fi

# Check Database File
echo ""
echo "2️⃣  Database File:"
if [ -f "mock-trade-api/dev.db" ]; then
    SIZE=$(ls -lh mock-trade-api/dev.db | awk '{print $5}')
    echo "   ✅ Database exists (Size: $SIZE)"
else
    echo "   ❌ Database file not found"
fi

# Test Traders Endpoint
echo ""
echo "3️⃣  Testing Traders Endpoint:"
RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/static-data/traders)
if echo "$RESPONSE" | grep -q "trader_id"; then
    echo "   ✅ Traders endpoint working (found records)"
elif echo "$RESPONSE" | grep -q "^\[\]"; then
    echo "   ✅ Traders endpoint working (no records yet - ready for your data)"
else
    echo "   ⚠️  Traders endpoint response: ${RESPONSE:0:50}..."
fi

# Test Brokers Endpoint
echo ""
echo "4️⃣  Testing Brokers Endpoint:"
RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/static-data/brokers)
if echo "$RESPONSE" | grep -q "broker_id"; then
    echo "   ✅ Brokers endpoint working (found records)"
elif echo "$RESPONSE" | grep -q "^\[\]"; then
    echo "   ✅ Brokers endpoint working (no records yet - ready for your data)"
else
    echo "   ⚠️  Brokers endpoint response: ${RESPONSE:0:50}..."
fi

# Test Clearers Endpoint
echo ""
echo "5️⃣  Testing Clearers Endpoint:"
RESPONSE=$(curl -s http://127.0.0.1:8000/api/v1/static-data/clearers)
if echo "$RESPONSE" | grep -q "clearer_id"; then
    echo "   ✅ Clearers endpoint working (found records)"
elif echo "$RESPONSE" | grep -q "^\[\]"; then
    echo "   ✅ Clearers endpoint working (no records yet - ready for your data)"
else
    echo "   ⚠️  Clearers endpoint response: ${RESPONSE:0:50}..."
fi

# Check Frontend
echo ""
echo "6️⃣  Frontend UI Status:"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is RUNNING on port 5173"
else
    echo "   ⚠️  Frontend may not be running - start with: cd mock-trade-ui && npm run dev"
fi

echo ""
echo "=========================================="
echo "✅ VERIFICATION COMPLETE"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Go to: http://localhost:5173"
echo "2. Click 'Static Data' module"
echo "3. Create Traders, Brokers, Clearers using the UI"
echo "4. Use Edit/Delete buttons to modify"
echo ""

