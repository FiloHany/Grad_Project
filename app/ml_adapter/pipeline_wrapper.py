"""
ML Pipeline Adapter — the only file that knows about the src/ ML code.

Responsibilities:
  - Add src/ to sys.path so ML modules are importable
  - Load both models once at startup
  - Expose a single run_full_pipeline() function
  - Copy visualization outputs to the job-specific output directory

Nothing in this file modifies any ML logic. It only calls existing functions.
"""

import sys
import shutil
from pathlib import Path
from typing import Callable, Optional

import numpy as np
import nibabel as nib

# --------------------------------------------------
# Bootstrap: make src/ importable
# --------------------------------------------------
_SRC_DIR = Path(__file__).resolve().parent.parent.parent / "src"
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

from predictors import load_segmentation_model, predict_masks, predict_ef_video_model
from postprocessing import run_pipeline, get_ef_class
from visualization import create_gifs, visualize_ed_es

# Global outputs directory (hardcoded in the ML visualization code)
_REPO_OUTPUTS = Path(__file__).resolve().parent.parent.parent / "outputs"

# --------------------------------------------------
# Load models once at startup
# (ef_video_predictor also loads its model at import time above)
# --------------------------------------------------
_seg_model, _device = load_segmentation_model()


# --------------------------------------------------
# NIfTI loader (mirrors main_pipeline.load_nii)
# --------------------------------------------------
def _load_nii(path: str):
    nii = nib.load(path)
    data = nii.get_fdata()
    data = np.transpose(data, (2, 1, 0))  # (W,H,T) → (T,H,W)
    sx, sy = nii.header.get_zooms()[:2]
    return data, sx, sy


# --------------------------------------------------
# Main pipeline entry point
# --------------------------------------------------
def run_full_pipeline(
    path_4ch: str,
    path_2ch: str,
    output_dir: Path,
    on_stage_update: Optional[Callable[[str, int], None]] = None,
) -> dict:
    """
    Runs the complete CardioVision analysis pipeline.

    Parameters
    ----------
    path_4ch        : absolute path to the 4-Chamber NIfTI file
    path_2ch        : absolute path to the 2-Chamber NIfTI file
    output_dir      : job-specific directory where outputs are copied
    on_stage_update : optional callback(stage: str, pct: int)

    Returns
    -------
    dict with keys "measurements" and "visualizations"
    """

    def _update(stage: str, pct: int) -> None:
        if on_stage_update:
            on_stage_update(stage, pct)

    output_dir.mkdir(parents=True, exist_ok=True)

    # ---- Stage 1: Load sequences ----------------------------------------
    _update("segmentation", 5)
    data_4ch, sx, sy = _load_nii(path_4ch)
    data_2ch, _, _ = _load_nii(path_2ch)

    # ---- Stage 2: Frame-wise segmentation --------------------------------
    _update("segmentation", 15)
    preds_4ch = predict_masks(data_4ch, _seg_model, _device)
    _update("segmentation", 45)
    preds_2ch = predict_masks(data_2ch, _seg_model, _device)
    _update("segmentation", 60)

    # ---- Stage 3: Clinical measurements (ED/ES + biplane Simpson) --------
    _update("measurement", 65)
    (
        EDV, ESV, EF, SV,
        LV_area_max, FAC,
        LA_area_max, LA_EF,
        ED_frame, ES_frame,
    ) = run_pipeline(data_4ch, data_2ch, preds_4ch, preds_2ch, sx, sy)

    # ---- Stage 4: 3D CNN EF prediction -----------------------------------
    _update("cnn_inference", 70)
    ef_cnn = predict_ef_video_model(data_4ch, ES_frame, clip_len=48)

    final_ef = (EF + ef_cnn) / 2 if ef_cnn is not None else EF
    diagnosis = get_ef_class(final_ef)

    # ---- Stage 5: Visualizations -----------------------------------------
    _update("visualization", 80)
    # The ML visualization functions write to the repo-level outputs/ dir.
    # Ensure it exists (run.py deletes it on startup for a clean session).
    _REPO_OUTPUTS.mkdir(parents=True, exist_ok=True)
    create_gifs(data_4ch, preds_4ch)
    visualize_ed_es(data_4ch, preds_4ch, ED_frame, ES_frame)

    # Copy from global outputs/ to the job-specific directory
    _OUTPUT_FILES = [
        "original.gif", "overlay.gif",
        "ED_original.png", "ED_overlay.png",
        "ES_original.png", "ES_overlay.png",
    ]
    for fname in _OUTPUT_FILES:
        src = _REPO_OUTPUTS / fname
        if src.exists():
            shutil.copy2(src, output_dir / fname)

    _update("done", 100)

    return {
        "measurements": {
            "ef_biplane": round(float(EF), 2),
            "ef_cnn": round(float(ef_cnn), 2) if ef_cnn is not None else None,
            "ef_final": round(float(final_ef), 2),
            "edv_ml": round(float(EDV), 2),
            "esv_ml": round(float(ESV), 2),
            "sv_ml": round(float(SV), 2),
            "lv_area_max_cm2": round(float(LV_area_max), 2),
            "fac_pct": round(float(FAC), 2),
            "la_area_max_cm2": round(float(LA_area_max), 2),
            "la_ef_pct": round(float(LA_EF), 2),
            "ed_frame_index": int(ED_frame),
            "es_frame_index": int(ES_frame),
            "diagnosis": diagnosis,
        },
        "visualizations": {
            "original_gif":  f"original.gif",
            "overlay_gif":   f"overlay.gif",
            "ed_original":   f"ED_original.png",
            "ed_overlay":    f"ED_overlay.png",
            "es_original":   f"ES_original.png",
            "es_overlay":    f"ES_overlay.png",
        },
    }
