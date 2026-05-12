"""
Jobs routes
  GET /api/jobs/{job_id}                — job status (poll this)
  GET /api/jobs/{job_id}/measurements   — clinical measurements
  GET /api/jobs/{job_id}/visualizations — image / GIF URLs
  GET /api/jobs/{job_id}/report         — full structured report
"""

from fastapi import APIRouter, HTTPException

from app.schemas.job import JobStatusResponse
from app.storage import job_store

router = APIRouter()


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def _get_or_404(job_id: str) -> dict:
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


def _require_completed(job: dict) -> None:
    if job["status"] != "completed":
        raise HTTPException(
            status_code=409,
            detail=f"Results not ready. Job status: {job['status']}.",
        )


# --------------------------------------------------
# Routes
# --------------------------------------------------

@router.get(
    "/{job_id}",
    response_model=JobStatusResponse,
    summary="Get job status",
)
def get_job_status(job_id: str):
    """
    Poll this endpoint every 3–5 seconds to track pipeline progress.

    Status lifecycle:  queued → running → completed | failed
    """
    job = _get_or_404(job_id)
    return JobStatusResponse(
        job_id=job["job_id"],
        study_id=job["study_id"],
        status=job["status"],
        stage=job.get("stage"),
        progress_pct=job.get("progress_pct", 0),
        error_message=job.get("error_message"),
        started_at=job.get("started_at"),
        completed_at=job.get("completed_at"),
        created_at=job["created_at"],
    )


@router.get(
    "/{job_id}/measurements",
    summary="Get clinical measurements",
)
def get_measurements(job_id: str):
    """
    Returns all computed cardiac measurements once the job is completed.

    Fields: ef_biplane, ef_cnn, ef_final, edv_ml, esv_ml, sv_ml,
            lv_area_max_cm2, fac_pct, la_area_max_cm2, la_ef_pct,
            ed_frame_index, es_frame_index, diagnosis
    """
    job = _get_or_404(job_id)
    _require_completed(job)
    return job["measurements"]


@router.get(
    "/{job_id}/visualizations",
    summary="Get visualization asset URLs",
)
def get_visualizations(job_id: str):
    """
    Returns URL paths for all generated images and GIFs.

    Assets: original_gif, overlay_gif, ed_original, ed_overlay,
            es_original, es_overlay
    """
    job = _get_or_404(job_id)
    _require_completed(job)
    return job["visualizations"]


@router.get(
    "/{job_id}/report",
    summary="Get full diagnostic report",
)
def get_report(job_id: str):
    """
    Returns the complete structured report combining all results:
    diagnosis, final EF, all measurements, and visualization URLs.
    """
    job = _get_or_404(job_id)
    _require_completed(job)
    return {
        "job_id": job_id,
        "study_id": job["study_id"],
        "generated_at": job["completed_at"],
        "diagnosis": job["measurements"]["diagnosis"],
        "ef_final": job["measurements"]["ef_final"],
        "measurements": job["measurements"],
        "visualizations": job["visualizations"],
    }
