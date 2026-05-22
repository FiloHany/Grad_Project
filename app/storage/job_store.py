"""
Job store — in-memory dict backed by per-job JSON files.

Each job lives at  jobs/{job_id}/state.json
History is intentionally NOT reloaded on startup; run.py wipes the dirs first.
"""

import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
JOBS_DIR = BASE_DIR / "jobs"
JOBS_DIR.mkdir(exist_ok=True)

_lock = threading.Lock()
_jobs: dict = {}


# --------------------------------------------------
# Internal helpers
# --------------------------------------------------

def _job_dir(job_id: str) -> Path:
    d = JOBS_DIR / job_id
    d.mkdir(exist_ok=True)
    return d


def _persist(job_id: str, data: dict) -> None:
    path = _job_dir(job_id) / "state.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def _load_all() -> None:
    for job_dir in JOBS_DIR.iterdir():
        state_file = job_dir / "state.json"
        if state_file.is_file():
            try:
                with open(state_file, encoding="utf-8") as f:
                    data = json.load(f)
                _jobs[data["job_id"]] = data
            except Exception:
                pass  # corrupt state file — skip


# --------------------------------------------------
# Public API
# --------------------------------------------------

def create_job(job_id: str, study_id: str, patient_name: str = None, patient_id: str = None) -> dict:
    data = {
        "job_id": job_id,
        "study_id": study_id,
        "status": "queued",
        "stage": None,
        "progress_pct": 0,
        "error_message": None,
        "started_at": None,
        "completed_at": None,
        "created_at": datetime.utcnow().isoformat(),
        "measurements": None,
        "visualizations": None,
        "patient_name": patient_name,
        "patient_id": patient_id,
    }
    with _lock:
        _jobs[job_id] = data
        _persist(job_id, data)
    return data


def get_job(job_id: str) -> Optional[dict]:
    with _lock:
        return dict(_jobs[job_id]) if job_id in _jobs else None


def update_job(job_id: str, **kwargs) -> Optional[dict]:
    with _lock:
        if job_id not in _jobs:
            return None
        _jobs[job_id].update(kwargs)
        _persist(job_id, _jobs[job_id])
        return dict(_jobs[job_id])


def list_jobs() -> list:
    with _lock:
        return [dict(j) for j in _jobs.values()]


