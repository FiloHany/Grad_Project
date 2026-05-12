from enum import Enum
from typing import Optional
from pydantic import BaseModel


class JobStatus(str, Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class JobStage(str, Enum):
    segmentation = "segmentation"
    measurement = "measurement"
    cnn_inference = "cnn_inference"
    visualization = "visualization"
    done = "done"


class JobStatusResponse(BaseModel):
    job_id: str
    study_id: str
    status: JobStatus
    stage: Optional[JobStage] = None
    progress_pct: int = 0
    error_message: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str
