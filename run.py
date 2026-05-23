"""
CardioVision — server entry point.

Usage:
    python run.py            # default port 8000
    python run.py --port 8080

Notes:
  - reload=False: hot-reload kills background inference threads mid-run.
  - uploads/ is cleaned on startup (NIfTI files are large, not needed after processing).
  - jobs/   is kept across restarts (GIF/PNG outputs must persist for report history).
  - The database is initialised and the job cache is loaded inside app.main (FastAPI startup event).
"""

import argparse
import os
import shutil
import socket
import sys
from pathlib import Path

_REPO_DIR    = Path(__file__).resolve().parent
_UPLOADS_DIR = _REPO_DIR / "uploads"
_JOBS_DIR    = _REPO_DIR / "jobs"


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def _prepare_dirs() -> None:
    """Clean uploads (temp NIfTI files), keep jobs (media outputs)."""
    if _UPLOADS_DIR.exists():
        shutil.rmtree(_UPLOADS_DIR)
    _UPLOADS_DIR.mkdir(parents=True)
    _JOBS_DIR.mkdir(exist_ok=True)


def main():
    env_port = int(os.environ.get("PORT", 8000))

    parser = argparse.ArgumentParser(description="CardioVision server")
    parser.add_argument("--port", type=int, default=env_port)
    args = parser.parse_args()

    if not os.environ.get("PORT") and _port_in_use(args.port):
        print(
            f"\n[ERROR] Port {args.port} is already in use.\n"
            f"  Stop the existing server, or run:  python run.py --port 8080\n"
        )
        sys.exit(1)

    _prepare_dirs()

    import uvicorn
    print(f"\n  CardioVision  →  http://localhost:{args.port}\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=args.port, reload=False)


if __name__ == "__main__":
    main()
