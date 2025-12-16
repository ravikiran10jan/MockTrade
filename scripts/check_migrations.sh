#!/bin/bash

# Script to check for potentially destructive Alembic migrations
# Usage: ./scripts/check_migrations.sh

echo "=== Checking for Potentially Destructive Migrations ==="

# Look for drop operations in migration files
echo "Searching for 'drop_table' operations in migrations..."

# Count drop operations
DROP_COUNT=$(grep -r "drop_table" mock-trade-api/alembic/versions/ | wc -l)

if [ $DROP_COUNT -gt 0 ]; then
    echo "⚠️  Found $DROP_COUNT potential drop operations:"
    grep -r "drop_table" mock-trade-api/alembic/versions/ | grep -v ".pyc"
    echo ""
    echo "Review these migrations carefully as they may cause data loss!"
else
    echo "✅ No drop_table operations found in migrations"
fi

echo ""
echo "=== Migration Status ==="
# Show current migration status
cd mock-trade-api
if command -v alembic &> /dev/null; then
    alembic current 2>/dev/null || echo "Alembic not initialized or no migrations applied"
else
    echo "Alembic not installed or not in PATH"
fi
cd ..

echo ""
echo "=== End Migration Check ==="