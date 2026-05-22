"""
CardioVision — FastAPI application entry point.

Environment variables:
  DISABLE_DOCS=true   Hides /docs and /redoc (set this in production).
  PORT                Overrides the listen port (set automatically by Railway).

Mounts (in priority order — API routes MUST come before static mounts):
  /api/studies  → study upload + analysis trigger
  /api/jobs     → job status polling + report retrieval
  /health       → health-check endpoint
  /media        → generated job outputs (GIFs, PNGs) served as static files
  /             → React SPA (catch-all, must be last)
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import jobs, studies

_APP_DIR    = Path(__file__).resolve().parent
_REPO_DIR   = _APP_DIR.parent
_STATIC_DIR = _APP_DIR / "static"
_JOBS_DIR   = _REPO_DIR / "jobs"

_STATIC_DIR.mkdir(exist_ok=True)
_JOBS_DIR.mkdir(exist_ok=True)

# Swagger UI and ReDoc are disabled when DISABLE_DOCS=true (recommended in production)
_disable_docs = os.environ.get("DISABLE_DOCS", "").lower() in ("true", "1", "yes")
_docs_url   = None if _disable_docs else "/docs"
_redoc_url  = None if _disable_docs else "/redoc"

app = FastAPI(
    title="CardioVision API",
    description=(
        "Automated cardiac function analysis from echocardiography.\n\n"
        "Upload 4CH + 2CH NIfTI sequences → get EF, EDV, ESV, diagnosis, "
        "annotated frames and GIFs."
    ),
    version="1.0.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API routes (registered before static mounts so they take priority) ────────
app.include_router(studies.router, prefix="/api/studies", tags=["Studies"])
app.include_router(jobs.router,    prefix="/api/jobs",    tags=["Jobs"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "CardioVision API"}


# ── Media files: job outputs (GIFs, PNGs) ─────────────────────────────────────
app.mount("/media", StaticFiles(directory=str(_JOBS_DIR)), name="media")

# ── SPA: React frontend (catch-all — MUST be last mount) ─────────────────────
# html=True serves index.html for any path not matching a real file (SPA routing).
app.mount("/", StaticFiles(directory=str(_STATIC_DIR), html=True), name="spa")
