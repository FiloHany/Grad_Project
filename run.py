"""
CardioVision — server entry point.

Usage:
    python run.py            # default port 8000
    python run.py --port 8080

Notes:
  - reload=False is intentional: hot-reload restarts the process and kills
    background inference threads mid-run.
  - Job and upload history is cleared on every start (fresh session).
"""

import argparse
import os
import shutil
import socket
import sys
from pathlib import Path

_REPO_DIR   = Path(__file__).resolve().parent
_JOBS_DIR   = _REPO_DIR / "jobs"
_UPLOADS_DIR = _REPO_DIR / "uploads"


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def _clean_runtime_dirs() -> None:
    """Wipe jobs/ and uploads/ so every session starts with a clean slate."""
    for d in (_JOBS_DIR, _UPLOADS_DIR):
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True)


def main():
    # Railway (and most PaaS) inject PORT via environment; --port flag overrides locally.
    env_port = int(os.environ.get("PORT", 8000))

    parser = argparse.ArgumentParser(description="CardioVision API server")
    parser.add_argument("--port", type=int, default=env_port, help="Port to listen on (default: $PORT or 8000)")
    args = parser.parse_args()

    # Only check port availability when running locally (PaaS handles this externally).
    if not os.environ.get("PORT") and _port_in_use(args.port):
        print(
            f"\n[ERROR] Port {args.port} is already in use.\n"
            f"  Option 1 — stop the existing server first, then run again.\n"
            f"  Option 2 — use a different port:  python run.py --port 8080\n"
        )
        sys.exit(1)

    _clean_runtime_dirs()

    import uvicorn
    print(f"\n  CardioVision  →  http://0.0.0.0:{args.port}\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=args.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
