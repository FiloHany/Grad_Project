"""
Studies routes
  POST /api/studies/upload          — upload 4CH + 2CH NIfTI files
  POST /api/studies/{study_id}/analyze — create and queue an analysis job
"""

import json
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.study import StudyUploadResponse
from app.storage import job_store
from app.services import job_service

router = APIRouter()

_BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
_UPLOADS_DIR = _BASE_DIR / "uploads"
_UPLOADS_DIR.mkdir(exist_ok=True)

_ALLOWED_EXTENSIONS = {".nii", ".gz"}


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def _validate_nifti(upload: UploadFile) -> None:
    name = upload.filename or ""
    if not (name.endswith(".nii") or name.endswith(".nii.gz")):
        raise HTTPException(
            status_code=400,
            detail=f"'{name}' is not a valid NIfTI file. Expected .nii or .nii.gz",
        )


# --------------------------------------------------
# Routes
# --------------------------------------------------

@router.post(
    "/upload",
    response_model=StudyUploadResponse,
    status_code=201,
    summary="Upload a new echocardiography study",
)
async def upload_study(
    file_4ch: UploadFile = File(..., description="4-Chamber view (.nii / .nii.gz)"),
    file_2ch: UploadFile = File(..., description="2-Chamber view (.nii / .nii.gz)"),
    patient_name: Optional[str] = Form(None, description="Patient full name"),
    patient_id: Optional[str] = Form(None, description="Hospital patient ID"),
):
    """
    Upload both NIfTI sequences for a single echocardiography study.
    Returns a study_id to use when triggering analysis.
    """
    _validate_nifti(file_4ch)
    _validate_nifti(file_2ch)

    study_id = str(uuid.uuid4())
    study_dir = _UPLOADS_DIR / study_id
    study_dir.mkdir(parents=True, exist_ok=True)

    with open(study_dir / "4ch.nii.gz", "wb") as f:
        shutil.copyfileobj(file_4ch.file, f)

    with open(study_dir / "2ch.nii.gz", "wb") as f:
        shutil.copyfileobj(file_2ch.file, f)

    study_info = {
        "patient_name": patient_name or None,
        "patient_id": patient_id or None,
        "created_at": datetime.utcnow().isoformat(),
    }
    with open(study_dir / "study_info.json", "w", encoding="utf-8") as f:
        json.dump(study_info, f)

    return StudyUploadResponse(
        study_id=study_id,
        status="uploaded",
        created_at=study_info["created_at"],
        message="Files saved. POST /api/studies/{study_id}/analyze to start analysis.",
    )


@router.post(
    "/{study_id}/analyze",
    status_code=202,
    summary="Create and queue an analysis job for a study",
)
def analyze_study(study_id: str):
    """
    Creates an AnalysisJob and starts the ML pipeline in the background.
    Returns a job_id. Poll GET /api/jobs/{job_id} for status.
    """
    study_dir = _UPLOADS_DIR / study_id
    if not study_dir.exists():
        raise HTTPException(status_code=404, detail="Study not found.")

    if not (study_dir / "4ch.nii.gz").exists() or not (study_dir / "2ch.nii.gz").exists():
        raise HTTPException(
            status_code=422,
            detail="Both 4CH and 2CH files must be present. Re-upload the study.",
        )

    patient_name = patient_id_val = None
    info_file = study_dir / "study_info.json"
    if info_file.exists():
        try:
            with open(info_file, encoding="utf-8") as f:
                info = json.load(f)
            patient_name = info.get("patient_name")
            patient_id_val = info.get("patient_id")
        except Exception:
            pass

    job_id = str(uuid.uuid4())
    job = job_store.create_job(
        job_id=job_id, study_id=study_id,
        patient_name=patient_name, patient_id=patient_id_val,
    )
    job_service.launch_job(job_id)

    return {
        "job_id": job_id,
        "study_id": study_id,
        "status": "queued",
        "created_at": job["created_at"],
    }
