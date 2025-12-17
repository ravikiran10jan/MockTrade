#!/bin/bash

# MockTrade Application Launcher
# This script sets up and launches the entire MockTrade application with proper configuration

set -e

PROJECT_DIR="/Users/ravikiranreddygajula/MockTrade"
API_DIR="$PROJECT_DIR/mock-trade-api"
UI_DIR="$PROJECT_DIR/mock-trade-ui"

echo "================================================================================"
echo "MockTrade Application Launcher"
echo "================================================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@16
    sleep 2
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Initialize database if needed
echo -e "\n${YELLOW}Checking database...${NC}"
DB_EXISTS=$(psql -U postgres -l 2>/dev/null | grep mocktrade || true)
if [ -z "$DB_EXISTS" ]; then
    echo "Initializing database..."
    cd "$PROJECT_DIR"
    python3 init_postgres.py
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

# Start backend API
echo -e "\n${YELLOW}Starting Backend API...${NC}"
cd "$API_DIR"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"

# Kill any existing process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 1

python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > api.log 2>&1 &
API_PID=$!
sleep 3

# Check if API started successfully
if kill -0 $API_PID 2>/dev/null; then
    echo -e "${GREEN}✓ API Server Started (PID: $API_PID)${NC}"
    echo -e "${GREEN}  Running on: http://localhost:8000${NC}"
else
    echo "Error starting API server. Check logs:"
    cat "$API_DIR/api.log"
    exit 1
fi

# Start frontend UI
echo -e "\n${YELLOW}Starting Frontend UI...${NC}"
cd "$UI_DIR"

# Kill any existing process on port 5174
lsof -i :5174 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 1

npm run dev -- --port 5174 > /dev/null 2>&1 &
UI_PID=$!
sleep 3

# Check if UI started successfully
if kill -0 $UI_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend UI Started (PID: $UI_PID)${NC}"
    echo -e "${GREEN}  Running on: http://localhost:5174${NC}"
else
    echo "Error starting UI. Check node_modules is installed."
fi

echo ""
echo "================================================================================"
echo -e "${GREEN}MockTrade is ready!${NC}"
echo "================================================================================"
echo ""
echo "Access the application:"
echo -e "  ${GREEN}Frontend: http://localhost:5174${NC}"
echo -e "  ${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "  ${GREEN}API Docs: http://localhost:8000/docs${NC}"
echo ""
echo "View logs:"
echo "  Backend:  tail -f $API_DIR/api.log"
echo "  Frontend: check npm output above"
echo ""
echo "To stop the application, press Ctrl+C or use:"
echo "  kill $API_PID  # Stop backend"
echo "  kill $UI_PID   # Stop frontend"
echo ""
echo "================================================================================"
echo ""

# Keep the script running
wait

