#!/bin/bash

# Script to check Docker volume status for MockTrade
# Usage: ./scripts/check_volumes.sh

echo "=== MockTrade Docker Volume Status ==="

# List volumes related to MockTrade
echo "Docker volumes:"
docker volume ls | grep mocktrade

# Show volume details
echo -e "\nVolume details:"
docker volume inspect mocktrade_db_data 2>/dev/null || echo "Volume 'mocktrade_db_data' not found"

# Check if containers are using the volume
echo -e "\nContainers using volumes:"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep mocktrade

echo -e "\n=== End Volume Status ==="