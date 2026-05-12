"""
CardioVision — FastAPI application entry point.

Mounts:
  /          → demo UI  (app/static/index.html)
  /static    → static assets
  /media     → generated job outputs (GIFs, PNGs)
  /api       → REST API
  /docs      → auto-generated Swagger UI
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import jobs, studies

# --------------------------------------------------
# Directory setup
# --------------------------------------------------
_APP_DIR = Path(__file__).resolve().parent
_REPO_DIR = _APP_DIR.parent
_STATIC_DIR = _APP_DIR / "static"
_JOBS_DIR = _REPO_DIR / "jobs"

_STATIC_DIR.mkdir(exist_ok=True)
_JOBS_DIR.mkdir(exist_ok=True)

# --------------------------------------------------
# App
# --------------------------------------------------
app = FastAPI(
    title="CardioVision API",
    description=(
        "Automated cardiac function analysis from echocardiography.\n\n"
        "Upload 4CH + 2CH NIfTI sequences → get EF, EDV, ESV, diagnosis, "
        "annotated frames and GIFs."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Static / media mounts
# --------------------------------------------------
app.mount("/static", StaticFiles(directory=str(_STATIC_DIR)), name="static")

# /media/{job_id}/outputs/{filename}  → jobs/{job_id}/outputs/{filename}
app.mount("/media", StaticFiles(directory=str(_JOBS_DIR)), name="media")

# --------------------------------------------------
# API routers
# --------------------------------------------------
app.include_router(studies.router, prefix="/api/studies", tags=["Studies"])
app.include_router(jobs.router,    prefix="/api/jobs",    tags=["Jobs"])


# --------------------------------------------------
# Root → demo UI
# --------------------------------------------------
@app.get("/", include_in_schema=False)
def serve_ui():
    return FileResponse(str(_STATIC_DIR / "index.html"))


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "CardioVision API"}
