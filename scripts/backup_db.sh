#!/bin/bash

# Database backup script for MockTrade
# Usage: ./scripts/backup_db.sh [backup_name]

set -e

# Default backup name with timestamp
BACKUP_NAME=${1:-"mocktrade_backup_$(date +%Y%m%d_%H%M%S)"}

echo "Creating database backup: $BACKUP_NAME.sql"

# Create backup
docker exec mocktrade-db pg_dump -U postgres mocktrade > "$BACKUP_NAME.sql"

echo "Backup created successfully: $BACKUP_NAME.sql"
echo "To restore, use: docker exec -i mocktrade-db psql -U postgres mocktrade < $BACKUP_NAME.sql"