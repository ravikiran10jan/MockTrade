#!/usr/bin/env python3
"""
MockTrade API Server Launcher - Persistent and Reliable
"""
import subprocess
import sys
import time
import os
import signal
import socket

def is_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True

def kill_port(port):
    """Kill process using the port"""
    os.system(f"lsof -ti:{port} | xargs kill -9 2>/dev/null || true")
    time.sleep(1)

def main():
    port = 8000

    print("=" * 60)
    print("MockTrade API Server Launcher")
    print("=" * 60)

    # Check and free port if needed
    if is_port_in_use(port):
        print(f"\n⚠️  Port {port} is in use. Killing existing processes...")
        kill_port(port)
        time.sleep(2)

        if is_port_in_use(port):
            print(f"❌ Failed to free port {port}. Trying alternate port 9000...")
            port = 9000

    # Change to api directory
    os.chdir("/Users/ravikiranreddygajula/MockTrade/mock-trade-api")

    # Check virtual environment
    if not os.path.exists(".venv"):
        print("❌ Virtual environment not found!")
        print("Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt")
        sys.exit(1)

    print(f"\n🚀 Starting MockTrade API on port {port}...")
    print("Press Ctrl+C to stop\n")

    # Start uvicorn
    try:
        subprocess.run(
            [sys.executable, "-m", "uvicorn", "app.main:app",
             "--host", "0.0.0.0", "--port", str(port), "--reload"],
            check=False
        )
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped gracefully")
        sys.exit(0)

if __name__ == "__main__":
    main()

