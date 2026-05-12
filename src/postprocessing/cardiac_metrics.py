# cardiac_metrics.py -- Post-processing functions for cardiac metrics calculation.

import numpy as np

# ---------------------------
# Volume (Biplane Simpson)
# ---------------------------
def compute_volume_biplane(mask4, mask2, sx, sy):

    volume = 0.0

    H = mask4.shape[0]

    for y in range(H):

        row4 = (mask4[y, :] == 1)
        row2 = (mask2[y, :] == 1)

        if np.any(row4) and np.any(row2):

            D1 = np.sum(row4) * sx
            D2 = np.sum(row2) * sx

            area = np.pi * (D1 * D2) / 4.0

            volume += area * sy

    return volume


# ---------------------------
# Main pipeline
# ---------------------------
def run_pipeline(
    data_4ch,
    data_2ch,
    preds_4ch,
    preds_2ch,
    sx,
    sy
):

    T = min(len(data_4ch), len(data_2ch))

    volumes = []
    lv_areas = []
    la_areas = []

    for t in range(T):

        mask4 = preds_4ch[t]
        mask2 = preds_2ch[t]

        # Volume
        vol = compute_volume_biplane(
            mask4,
            mask2,
            sx,
            sy
        )

        volumes.append(vol)

        # Areas
        lv_area = np.sum(mask4 == 1) * sx * sy
        la_area = np.sum(mask4 == 3) * sx * sy

        lv_areas.append(lv_area)
        la_areas.append(la_area)

    volumes = np.array(volumes) / 1000.0

    lv_areas = np.array(lv_areas)
    la_areas = np.array(la_areas)

    # ED / ES
    ED_frame = np.argmax(volumes)
    ES_frame = np.argmin(volumes)

    EDV = volumes[ED_frame]
    ESV = volumes[ES_frame]

    EF = (EDV - ESV) / EDV * 100

    SV = EDV - ESV

    LV_area_max = np.max(lv_areas)
    LV_area_max = np.max(lv_areas)
    LV_area_min = np.min(lv_areas)

    FAC = (
        (LV_area_max - LV_area_min)
        / LV_area_max
    ) * 100

    LA_area_max = np.max(la_areas) 
    LA_area_min = np.min(la_areas)

    LA_EF = (
        (LA_area_max - LA_area_min)
        / LA_area_max
    ) * 100

    return (
        EDV,
        ESV,
        EF,
        SV,
        LV_area_max / 100.0,
        FAC,
        LA_area_max / 100.0,
        LA_EF,
        ED_frame,
        ES_frame
    )


# ---------------------------
# Diagnosis
# ---------------------------
def get_ef_class(EF):

    if EF >= 55:
        return "Normal"

    elif EF >= 40:
        return "Mild Dysfunction"

    elif EF >= 30:
        return "Moderate Dysfunction"

    else:
        return "Severe Dysfunction"
