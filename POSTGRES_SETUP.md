# PostgreSQL Setup Guide for MockTrade

## Quick Start (macOS with Homebrew)

### 1. Install PostgreSQL
```bash
brew install postgresql@16
```

### 2. Start PostgreSQL service
```bash
brew services start postgresql@16
```

### 3. Create the mocktrade database
```bash
# Default password is empty for local development
createdb -U postgres mocktrade
```

### 4. Verify installation
```bash
psql -U postgres -d mocktrade -c "SELECT version();"
```

### 5. Initialize MockTrade tables
```bash
cd /path/to/MockTrade
python3 init_postgres.py
```

### 6. Start the backend API
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"
cd mock-trade-api
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. In a new terminal, start the frontend
```bash
cd mock-trade-ui
npm install
npm run dev -- --port 5174
```

### 8. Open in browser
```
http://localhost:5174
```

---

## Connection Details

| Parameter | Value |
|-----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | mocktrade |
| User | postgres |
| Password | postgres (default for local dev) |
| Connection String | `postgresql://postgres:postgres@localhost:5432/mocktrade` |

---

## PostgreSQL Commands for macOS

### Check if PostgreSQL is running
```bash
brew services list | grep postgresql
```

### View PostgreSQL logs
```bash
tail -f /usr/local/var/log/postgres.log
```

### Connect to database directly
```bash
psql -U postgres -d mocktrade
```

### Stop PostgreSQL
```bash
brew services stop postgresql@16
```

### Restart PostgreSQL
```bash
brew services restart postgresql@16
```

### Reset database (delete all data)
```bash
dropdb -U postgres mocktrade
createdb -U postgres mocktrade
python3 init_postgres.py
```

---

## Common Issues

### "psycopg2" module not found
```bash
pip install psycopg2-binary
```

### "connection refused" or "port 5432 refused"
- Make sure PostgreSQL is running: `brew services start postgresql@16`
- Check if port 5432 is in use: `lsof -i :5432`

### "password authentication failed"
- Default password is empty (just press Enter when prompted)
- Or use: `psql -U postgres -d mocktrade` (no password for local)

### Database doesn't exist
```bash
createdb -U postgres mocktrade
```

### Want to use a different password
1. Connect as postgres user:
   ```bash
   psql -U postgres
   ```
2. Set new password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   ```
3. Update `DATABASE_URL` environment variable

---

## Docker Alternative (if Docker is available later)

Instead of local PostgreSQL, you can use Docker:

```bash
cd /path/to/MockTrade
docker compose up -d db

# Then run initialization:
export DATABASE_URL="postgresql://postgres:mock1234@db:5432/mocktrade"
python3 init_postgres.py
```

The `docker-compose.yml` is pre-configured with PostgreSQL 16.

---

## Environment Variables

Set these before running the backend:

```bash
# PostgreSQL connection
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocktrade"

# Optional: Backend host/port
export BACKEND_HOST="0.0.0.0"
export BACKEND_PORT="8000"

# Optional: Frontend dev server settings
export VITE_API_BASE="/api"
```

---

## Next Steps

1. ✓ Install PostgreSQL
2. ✓ Create database
3. ✓ Run `init_postgres.py`
4. ✓ Start backend API
5. ✓ Start frontend
6. ✓ Open browser to http://localhost:5174
7. Create traders, instruments, and start trading!

