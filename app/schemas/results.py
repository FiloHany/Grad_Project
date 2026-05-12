from typing import Optional
from pydantic import BaseModel


class MeasurementsResult(BaseModel):
    ef_biplane: float
    ef_cnn: Optional[float] = None
    ef_final: float
    edv_ml: float
    esv_ml: float
    sv_ml: float
    lv_area_max_cm2: float
    fac_pct: float
    la_area_max_cm2: float
    la_ef_pct: float
    ed_frame_index: int
    es_frame_index: int
    diagnosis: str


class VisualizationAssets(BaseModel):
    original_gif: str
    overlay_gif: str
    ed_original: str
    ed_overlay: str
    es_original: str
    es_overlay: str


class FullReport(BaseModel):
    job_id: str
    study_id: str
    generated_at: str
    diagnosis: str
    ef_final: float
    measurements: MeasurementsResult
    visualizations: VisualizationAssets
