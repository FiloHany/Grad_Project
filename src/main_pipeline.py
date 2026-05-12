# main_pipeline.py -- Main pipeline for echocardiogram video analysis.

import numpy as np
import nibabel as nib

from predictors import load_segmentation_model, predict_masks, predict_ef_video_model
from postprocessing import compute_volume_biplane, run_pipeline, get_ef_class
from visualization import create_gifs, visualize_ed_es

# ---------------------------
# Load NIfTI
# ---------------------------
def load_nii(path):

    nii = nib.load(path)

    data = nii.get_fdata()

    # (W,H,T) → (T,H,W)
    data = np.transpose(data, (2, 1, 0))

    sx, sy = nii.header.get_zooms()[:2]

    return data, sx, sy


# ---------------------------
# MAIN
# ---------------------------
if __name__ == "__main__":

    path_4ch = r"F:/Cardiac_Ultrasound_Analysis/test_cases/patient0233/patient0233_4CH_half_sequence.nii.gz"

    path_2ch = r"F:/Cardiac_Ultrasound_Analysis/test_cases/patient0233/patient0233_2CH_half_sequence.nii.gz"

    # Load segmentation model
    model, device = load_segmentation_model()

    # Load videos
    data_4ch, sx, sy = load_nii(path_4ch)

    data_2ch, _, _ = load_nii(path_2ch)

    # Predict masks
    preds_4ch = predict_masks(
        data_4ch,
        model,
        device
    )

    preds_2ch = predict_masks(
        data_2ch,
        model,
        device
    )

    # Main calculations
    (
        EDV,
        ESV,
        EF,
        SV,
        LV_area_max,
        FAC,
        LA_area_max,
        LA_EF,
        ED_frame,
        ES_frame
    ) = run_pipeline(
        data_4ch,
        data_2ch,
        preds_4ch,
        preds_2ch,
        sx,
        sy
    )


    # Video EF prediction
    ef_pred = predict_ef_video_model(data_4ch, ES_frame, clip_len=48)

    final_ef = (EF + ef_pred) / 2 if ef_pred is not None else EF

    # Diagnosis
    diagnosis = get_ef_class(final_ef)

    # Visualizations
    create_gifs(
        data_4ch,
        preds_4ch
    )

    visualize_ed_es(
        data_4ch,
        preds_4ch,
        ED_frame,
        ES_frame
    )

    # Report
    print("\n===== Cardiac Report =====")

    print(f"Diagnosis: {diagnosis}")

    print(f"Final EF        : {final_ef:.2f} %")

    print(f"\nEDV : {EDV:.2f} mL")
    print(f"ESV : {ESV:.2f} mL")
    print(f"SV  : {SV:.2f} mL")
    print(f"LV Area Max : {LV_area_max:.2f} cm²")
    print(f"LA Area Max : {LA_area_max:.2f} cm²")

    print(f"\nFAC   : {FAC:.2f} %")
    print(f"LA EF : {LA_EF:.2f} %")