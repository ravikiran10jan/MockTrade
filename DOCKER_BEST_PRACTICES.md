# Docker Best Practices for Data Persistence

## Volume Configuration
Your docker-compose.yml already has the correct volume configuration:
```yaml
volumes:
  - db_data:/var/lib/postgresql/data
```

This ensures that PostgreSQL data is stored in a named volume that persists between container restarts.

## Correct Commands for Data Persistence

### ✅ Recommended Commands (Preserve Data)
```bash
# Stop containers (data preserved)
docker-compose down

# Start containers (data preserved)
docker-compose up -d

# Rebuild containers (data preserved)
docker-compose up -d --build

# Rebuild only specific services (data preserved)
docker-compose up -d --build backend frontend

# Safely restart services without stopping database
./scripts/restart_safe.sh
```

### ❌ Commands to Avoid (Will Lose Data)
```bash
# DON'T use -v flag as it removes volumes
docker-compose down -v

# DON'T remove volumes manually unless intentionally clearing data
docker volume rm mocktrade_db_data
```

## Checking Volume Status
To verify your volume exists and is being used:

### Using provided script
```bash
./scripts/check_volumes.sh
```

### Manual commands
```bash
# List volumes
docker volume ls | grep db_data

# Inspect volume
docker volume inspect mocktrade_db_data
```

## Database Backup and Restore

Convenient backup and restore scripts are provided in the `scripts/` directory:

### Backup Database
```bash
# Create a timestamped backup
./scripts/backup_db.sh

# Create a named backup
./scripts/backup_db.sh my_backup_name
```

### Restore Database
```bash
# Restore from a backup file
./scripts/restore_db.sh backup_file.sql
```

Manual backup/restore commands are also available:

### Manual Backup
```bash
docker exec mocktrade-db pg_dump -U postgres mocktrade > backup.sql
```

### Manual Restore
```bash
docker exec -i mocktrade-db psql -U postgres mocktrade < backup.sql
```

## Troubleshooting Data Loss

If you're still experiencing data loss:

1. **Check if you're using `docker-compose down -v`** - This is the most common cause
2. **Verify volume configuration** - Ensure the volume is correctly mapped in docker-compose.yml
3. **Check for destructive migrations** - Review Alembic migration files for drop operations
4. **Look for initialization scripts** - Check if any scripts run on startup that might reset data

## Development Workflow Recommendations

1. **Daily Development**:
   ```bash
   # Start services
   docker-compose up -d
   
   # Work on your application...
   
   # Stop services at end of day
   docker-compose down
   ```

2. **Code Changes**:
   ```bash
   # Rebuild only the services you changed
   docker-compose up -d --build backend
   ```

3. **Complete Environment Reset** (Only when needed):
   ```bash
   # Only use this when you want to completely start fresh
   docker-compose down -v
   docker-compose up -d --build
   ```

## Environment Variables
Ensure your `.env.docker` file is properly configured:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mock1234
POSTGRES_DB=mocktrade
DATABASE_URL=postgresql://postgres:mock1234@db:5432/mocktrade
```

Following these practices will ensure your data persists between container restarts and rebuilds.