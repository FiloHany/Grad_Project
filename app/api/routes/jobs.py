"""
Jobs routes — all require a valid JWT.
  GET /api/jobs                       — list the current doctor's jobs
  GET /api/jobs/{job_id}              — job status
  GET /api/jobs/{job_id}/report       — full diagnostic report
  GET /api/jobs/{job_id}/measurements — clinical measurements
  GET /api/jobs/{job_id}/visualizations
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_doctor
from app.database.db import get_db
from app.database.models import Doctor
from app.schemas.job import JobStatusResponse
from app.storage import job_store

router = APIRouter()


def _get_or_404(job_id: str, doctor: Doctor) -> dict:
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.get("doctor_id") is not None and job["doctor_id"] != doctor.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return job


def _require_completed(job: dict) -> None:
    if job["status"] != "completed":
        raise HTTPException(
            status_code=409,
            detail=f"Results not ready. Job status: {job['status']}.",
        )


@router.get("", summary="List the current doctor's analysis jobs")
def list_jobs(
    doctor: Doctor  = Depends(get_current_doctor),
    db:     Session = Depends(get_db),
):
    jobs = job_store.list_jobs(doctor_id=doctor.id)
    return sorted(jobs, key=lambda j: j.get("created_at", ""), reverse=True)


@router.get("/{job_id}", response_model=JobStatusResponse, summary="Get job status")
def get_job_status(
    job_id: str,
    doctor: Doctor  = Depends(get_current_doctor),
    db:     Session = Depends(get_db),
):
    job = _get_or_404(job_id, doctor)
    return JobStatusResponse(
        job_id        = job["job_id"],
        study_id      = job["study_id"],
        status        = job["status"],
        stage         = job.get("stage"),
        progress_pct  = job.get("progress_pct", 0),
        error_message = job.get("error_message"),
        started_at    = job.get("started_at"),
        completed_at  = job.get("completed_at"),
        created_at    = job["created_at"],
        patient_name  = job.get("patient_name"),
        patient_id    = job.get("patient_id"),
    )


@router.get("/{job_id}/report", summary="Get full diagnostic report")
def get_report(
    job_id: str,
    doctor: Doctor  = Depends(get_current_doctor),
    db:     Session = Depends(get_db),
):
    job = _get_or_404(job_id, doctor)
    _require_completed(job)
    return {
        "job_id":       job_id,
        "study_id":     job["study_id"],
        "patient_name": job.get("patient_name"),
        "patient_id":   job.get("patient_id"),
        "generated_at": job["completed_at"],
        "diagnosis":    job["measurements"]["diagnosis"],
        "ef_final":     job["measurements"]["ef_final"],
        "measurements": job["measurements"],
        "visualizations": job["visualizations"],
    }


@router.get("/{job_id}/measurements", summary="Get clinical measurements")
def get_measurements(
    job_id: str,
    doctor: Doctor  = Depends(get_current_doctor),
    db:     Session = Depends(get_db),
):
    job = _get_or_404(job_id, doctor)
    _require_completed(job)
    return job["measurements"]


@router.get("/{job_id}/visualizations", summary="Get visualization URLs")
def get_visualizations(
    job_id: str,
    doctor: Doctor  = Depends(get_current_doctor),
    db:     Session = Depends(get_db),
):
    job = _get_or_404(job_id, doctor)
    _require_completed(job)
    return job["visualizations"]
