"""
Job service — owns the lifecycle of an analysis job.

Launches the ML pipeline in a background thread and updates job state
as each stage completes. The ML adapter is the only caller of ML code.
"""

import threading
from datetime import datetime
from pathlib import Path

from app.storage import job_store
from app.ml_adapter import pipeline_wrapper

_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_UPLOADS_DIR = _BASE_DIR / "uploads"
_JOBS_DIR = _BASE_DIR / "jobs"


# --------------------------------------------------
# Public entry point
# --------------------------------------------------

def launch_job(job_id: str) -> None:
    """Start job execution in a daemon background thread."""
    t = threading.Thread(target=_run, args=(job_id,), daemon=True)
    t.start()


# --------------------------------------------------
# Internal execution
# --------------------------------------------------

def _run(job_id: str) -> None:
    job = job_store.get_job(job_id)
    if not job:
        return

    study_id = job["study_id"]
    upload_dir = _UPLOADS_DIR / study_id
    output_dir = _JOBS_DIR / job_id / "outputs"

    job_store.update_job(
        job_id,
        status="running",
        started_at=datetime.utcnow().isoformat(),
    )

    try:
        result = pipeline_wrapper.run_full_pipeline(
            path_4ch=str(upload_dir / "4ch.nii.gz"),
            path_2ch=str(upload_dir / "2ch.nii.gz"),
            output_dir=output_dir,
            on_stage_update=lambda stage, pct: job_store.update_job(
                job_id, stage=stage, progress_pct=pct
            ),
        )

        job_store.update_job(
            job_id,
            status="completed",
            stage="done",
            progress_pct=100,
            completed_at=datetime.utcnow().isoformat(),
            measurements=result["measurements"],
            visualizations=_build_url_map(job_id, result["visualizations"]),
        )

    except Exception as exc:
        job_store.update_job(
            job_id,
            status="failed",
            error_message=str(exc),
            completed_at=datetime.utcnow().isoformat(),
        )


def _build_url_map(job_id: str, viz_filenames: dict) -> dict:
    """
    Convert bare filenames returned by the ML adapter into URL paths
    served by the /media mount in main.py.

    /media  →  jobs/   (mounted in main.py)
    so /media/{job_id}/outputs/{filename} serves jobs/{job_id}/outputs/{filename}
    """
    base = f"/media/{job_id}/outputs"
    return {
        "original_gif": f"{base}/{viz_filenames['original_gif']}",
        "overlay_gif":  f"{base}/{viz_filenames['overlay_gif']}",
        "ed_original":  f"{base}/{viz_filenames['ed_original']}",
        "ed_overlay":   f"{base}/{viz_filenames['ed_overlay']}",
        "es_original":  f"{base}/{viz_filenames['es_original']}",
        "es_overlay":   f"{base}/{viz_filenames['es_overlay']}",
    }
