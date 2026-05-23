"""
CardioVision — FastAPI application entry point.

Environment variables:
  DATABASE_URL   SQLite (default) or PostgreSQL connection string
  JWT_SECRET     Token signing secret (change in production)
  DISABLE_DOCS   Set to "true" to hide /docs and /redoc
  PORT           Set automatically by Railway

Route priority (registered before static mounts):
  /api/auth/*    → doctor registration + login
  /api/studies/* → study upload + analysis
  /api/jobs/*    → job status + reports
  /health        → health-check
  /media/*       → job output files (GIFs, PNGs)
  /              → React SPA (catch-all, must be last)
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import init_db
from app.storage.job_store import load_all
from app.api.routes import auth, jobs, studies

_APP_DIR    = Path(__file__).resolve().parent
_REPO_DIR   = _APP_DIR.parent
_STATIC_DIR = _APP_DIR / "static"
_JOBS_DIR   = _REPO_DIR / "jobs"

_STATIC_DIR.mkdir(exist_ok=True)
_JOBS_DIR.mkdir(exist_ok=True)

_disable_docs = os.environ.get("DISABLE_DOCS", "").lower() in ("true", "1", "yes")

app = FastAPI(
    title       = "CardioVision API",
    description = (
        "Automated cardiac function analysis from echocardiography.\n\n"
        "Upload 4CH + 2CH NIfTI sequences → get EF, EDV, ESV, diagnosis, "
        "annotated frames and GIFs."
    ),
    version  = "2.0.0",
    docs_url = None if _disable_docs else "/docs",
    redoc_url= None if _disable_docs else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()     # create tables if they don't exist
    load_all()    # hydrate in-memory job cache from DB


# ── API routes ─────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(studies.router, prefix="/api/studies", tags=["Studies"])
app.include_router(jobs.router,    prefix="/api/jobs",    tags=["Jobs"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "CardioVision API", "version": "2.0.0"}


# ── Static mounts (MUST come after all API routes) ────────────────────────────
app.mount("/media", StaticFiles(directory=str(_JOBS_DIR)), name="media")
app.mount("/",      StaticFiles(directory=str(_STATIC_DIR), html=True), name="spa")
