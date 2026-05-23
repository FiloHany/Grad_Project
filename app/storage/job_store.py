"""
Hybrid job store: in-memory dict (fast real-time reads) + SQLite/PostgreSQL (persistence).

  • create_job()  — adds to memory + DB
  • update_job()  — updates memory always; persists to DB on important state changes
  • get_job()     — memory-only (fast)
  • list_jobs()   — memory, optionally filtered by doctor_id
  • load_all()    — called at startup: hydrates memory from DB, marks orphaned jobs failed
"""

import threading
from datetime import datetime
from typing import Optional

_lock  = threading.Lock()
_jobs: dict = {}


# ── DB helpers (create a fresh session per call — safe for background threads) ─

def _db():
    from app.database.db import SessionLocal
    return SessionLocal()


def _write_to_db(data: dict) -> None:
    """Upsert a job record. Silently swallows DB errors so the app keeps running."""
    from app.database.models import JobRecord
    try:
        db = _db()
        rec = db.query(JobRecord).filter(JobRecord.job_id == data["job_id"]).first()
        if rec:
            rec.data   = dict(data)
            rec.status = data.get("status", "queued")
        else:
            rec = JobRecord(
                job_id    = data["job_id"],
                doctor_id = data.get("doctor_id"),
                status    = data.get("status", "queued"),
                data      = dict(data),
            )
            db.add(rec)
        db.commit()
    except Exception:
        pass
    finally:
        try:
            db.close()
        except Exception:
            pass


# ── Public API ─────────────────────────────────────────────────────────────────

def create_job(
    job_id:       str,
    study_id:     str,
    doctor_id:    Optional[int] = None,
    patient_name: Optional[str] = None,
    patient_id:   Optional[str] = None,
) -> dict:
    data = {
        "job_id":       job_id,
        "study_id":     study_id,
        "doctor_id":    doctor_id,
        "patient_name": patient_name,
        "patient_id":   patient_id,
        "status":       "queued",
        "stage":        None,
        "progress_pct": 0,
        "error_message": None,
        "started_at":   None,
        "completed_at": None,
        "created_at":   datetime.utcnow().isoformat(),
        "measurements": None,
        "visualizations": None,
    }
    with _lock:
        _jobs[job_id] = data
    _write_to_db(data)
    return data


def get_job(job_id: str) -> Optional[dict]:
    with _lock:
        return dict(_jobs[job_id]) if job_id in _jobs else None


def update_job(job_id: str, **kwargs) -> Optional[dict]:
    with _lock:
        if job_id not in _jobs:
            return None
        _jobs[job_id].update(kwargs)
        data = dict(_jobs[job_id])

    # Persist only on meaningful state transitions (not every progress % tick)
    _PERSIST_KEYS = {"status", "measurements", "visualizations", "error_message",
                     "completed_at", "started_at"}
    if _PERSIST_KEYS.intersection(kwargs.keys()):
        _write_to_db(data)

    return data


def list_jobs(doctor_id: Optional[int] = None) -> list:
    with _lock:
        jobs = list(_jobs.values())
    if doctor_id is not None:
        jobs = [j for j in jobs if j.get("doctor_id") == doctor_id]
    return [dict(j) for j in jobs]


def load_all() -> None:
    """
    Called once at startup. Loads all persisted jobs into memory.
    Any job left in running/queued state is marked failed (background threads are dead).
    """
    from app.database.models import JobRecord
    try:
        db = _db()
        records = db.query(JobRecord).all()
        orphan_ids = []

        with _lock:
            for rec in records:
                data = dict(rec.data) if rec.data else {}
                if data.get("status") in ("running", "queued"):
                    data["status"]        = "failed"
                    data["error_message"] = "Server was restarted while this job was in progress."
                    orphan_ids.append(rec.job_id)
                _jobs[data["job_id"]] = data

        # Persist the failed status back
        for job_id in orphan_ids:
            with _lock:
                d = dict(_jobs[job_id])
            _write_to_db(d)

    except Exception as e:
        print(f"[job_store] Warning: could not load jobs from DB — {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass
