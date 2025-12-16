#!/bin/bash

# Database restore script for MockTrade
# Usage: ./scripts/restore_db.sh backup_file.sql

set -e

if [ $# -eq 0 ]; then
    echo "Error: No backup file specified"
    echo "Usage: ./scripts/restore_db.sh backup_file.sql"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Confirm before restoring
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Restore backup
docker exec -i mocktrade-db psql -U postgres mocktrade < "$BACKUP_FILE"

echo "Database restored successfully from: $BACKUP_FILE"