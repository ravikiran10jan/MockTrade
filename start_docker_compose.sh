#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Building and starting Docker Compose stack..."

docker compose -f docker-compose.yml up -d --build

# Wait for DB to be healthy
echo "Waiting for database to become healthy..."
RETRIES=30
for i in $(seq 1 $RETRIES); do
  STATUS=$(docker inspect --format='{{json .State.Health.Status}}' mocktrade-db 2>/dev/null || echo '"unknown"')
  if [[ "$STATUS" == '"healthy"' ]]; then
    echo "Database healthy"
    break
  fi
  echo "Waiting for DB... ($i/$RETRIES)"
  sleep 2
done

# Run DB init inside backend container
echo "Initializing database schema (running init_postgres.py inside backend)..."
if docker exec -it mocktrade-backend python init_postgres.py; then
  echo "DB initialization succeeded"
else
  echo "DB initialization failed - check backend logs"
fi


echo "Stack should be up. Check logs:"
echo "  docker compose ps"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"

echo "Open: http://localhost:5174"

