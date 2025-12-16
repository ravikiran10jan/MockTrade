#!/bin/bash

# Safe restart script for MockTrade - preserves data
# Usage: ./scripts/restart_safe.sh [service1] [service2] ...

echo "=== Safe Restart for MockTrade ==="

# If no services specified, restart all except database
if [ $# -eq 0 ]; then
    echo "Restarting all services except database..."
    docker-compose restart backend frontend nginx
else
    echo "Restarting specified services: $@"
    docker-compose restart "$@"
fi

echo "Services restarted successfully!"
echo "Database data has been preserved."
echo "=== Restart Complete ==="