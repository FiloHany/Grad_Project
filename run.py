"""
CardioVision — server entry point.

Usage:
    python run.py            # default port 8000
    python run.py --port 8080

Then open:  http://localhost:<port>
API docs:   http://localhost:<port>/docs

Notes:
  - reload=False is intentional: hot-reload restarts the process and kills
    background inference threads mid-run.
  - Both ML models are loaded at startup (slow first launch; fast inference).
"""

import argparse
import socket
import sys


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def main():
    parser = argparse.ArgumentParser(description="CardioVision API server")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    args = parser.parse_args()

    if _port_in_use(args.port):
        print(
            f"\n[ERROR] Port {args.port} is already in use.\n"
            f"  Option 1 — stop the existing server first, then run again.\n"
            f"  Option 2 — use a different port:  python run.py --port 8080\n"
        )
        sys.exit(1)

    import uvicorn
    print(f"\n  CardioVision API  →  http://localhost:{args.port}")
    print(f"  API Docs (Swagger) →  http://localhost:{args.port}/docs\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=args.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
