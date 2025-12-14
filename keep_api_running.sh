#!/bin/bash
# keep_api_running.sh
# Starts the MockTrade FastAPI app inside the repo virtualenv and keeps it running.
# Designed to be used by macOS launchd or run manually.

set -euo pipefail
LOGFILE="/Users/ravikiranreddygajula/MockTrade/mock-trade-api/uvicorn_launchd.log"
ERRFILE="/Users/ravikiranreddygajula/MockTrade/mock-trade-api/uvicorn_launchd.err"
REPO_DIR="/Users/ravikiranreddygajula/MockTrade/mock-trade-api"
VENV_DIR="$REPO_DIR/.venv"
PYTHON="/usr/bin/env python3"

mkdir -p "$(dirname "$LOGFILE")"

cd "$REPO_DIR"

# Activate venv if present
if [ -f "$VENV_DIR/bin/activate" ]; then
  # shellcheck source=/dev/null
  source "$VENV_DIR/bin/activate"
fi

# Print environment info to log
echo "=== Starting MockTrade API - $(date) ===" >> "$LOGFILE"
echo "Working dir: $(pwd)" >> "$LOGFILE"
echo "Python: $($PYTHON --version 2>&1)" >> "$LOGFILE"

# Exec uvicorn so it becomes the managed process (launchd will respawn if it exits when KeepAlive true)
exec $PYTHON -m uvicorn app.main:app --host 127.0.0.1 --port 8000 >> "$LOGFILE" 2>> "$ERRFILE"

