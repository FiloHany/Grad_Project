from pydantic import BaseModel


class StudyUploadResponse(BaseModel):
    study_id: str
    status: str
    created_at: str
    message: str
