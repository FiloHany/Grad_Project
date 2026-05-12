# visualization_utils.py -- Visualization utilities for echocardiogram analysis

import cv2
import imageio
import numpy as np
from pathlib import Path


#---------------------------
# Loading and saving paths
#---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = BASE_DIR / "outputs"

# ---------------------------
# GIF Creation
# ---------------------------

def create_gifs(data, preds):

    orig_path = OUTPUT_DIR / "original.gif"
    overlay_path = OUTPUT_DIR / "overlay.gif"

    frames_orig = []
    frames_overlay = []

    for frame, mask in zip(data, preds):

        frame_disp = (
            frame - frame.min()
        ) / (
            frame.max() - frame.min() + 1e-6
        )

        frame_rgb = cv2.cvtColor(
            (frame_disp * 255).astype(np.uint8),
            cv2.COLOR_GRAY2RGB
        )

        overlay = frame_rgb.copy()

        class_colors = {
            1: (0, 0, 255), # LV - Green
            2: (0, 255, 0), # Myocardium - Blue
            3: (255, 0, 0)  # LA - Red
        }

        for cls, color in class_colors.items():

            binary_mask = (
                mask == cls
            ).astype(np.uint8)

            contours, _ = cv2.findContours(
                binary_mask,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )

            cv2.drawContours(
                overlay,
                contours,
                -1,
                color,
                thickness=2
            )

        frames_orig.append(frame_rgb)
        frames_overlay.append(overlay)

    frames_orig.append(frames_orig[0])
    frames_overlay.append(frames_overlay[0])

    imageio.mimsave(
        orig_path,
        frames_orig,
        duration=0.05,
        loop=0
    )

    imageio.mimsave(
        overlay_path,
        frames_overlay,
        duration=0.05,
        loop=0
    )

    return orig_path, overlay_path


# ---------------------------
# ED / ES Visualization
# ---------------------------
def visualize_ed_es(
    data,
    preds,
    ED_frame,
    ES_frame
):

    def prepare_frame(frame, mask):

        frame_disp = (frame - frame.min()) / (frame.max() - frame.min() + 1e-6)

        frame_rgb = cv2.cvtColor(
            (frame_disp * 255).astype(np.uint8),
            cv2.COLOR_GRAY2RGB
        )

        overlay = frame_rgb.copy()

        class_colors = {
            1: (255, 0, 0),
            2: (0, 255, 0),
            3: (0, 0, 255)
        }

        for cls, color in class_colors.items():

            binary_mask = (mask == cls).astype(np.uint8)

            contours, _ = cv2.findContours(
                binary_mask,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )

            cv2.drawContours(
                overlay,
                contours,
                -1,
                color,
                thickness=2
            )

        return frame_rgb, overlay

    # ED
    ed_frame = data[ED_frame]
    ed_mask = preds[ED_frame]

    ed_orig, ed_overlay = prepare_frame(ed_frame, ed_mask)

    # ES
    es_frame = data[ES_frame]
    es_mask = preds[ES_frame]

    es_orig, es_overlay = prepare_frame(es_frame, es_mask)

    cv2.imwrite(OUTPUT_DIR / "ED_overlay.png", ed_overlay)

    cv2.imwrite(OUTPUT_DIR / "ES_overlay.png", es_overlay)

    cv2.imwrite(OUTPUT_DIR / "ED_original.png", ed_orig)
    
    cv2.imwrite(OUTPUT_DIR / "ES_original.png", es_orig)    

    return {
        "ED_original": ed_orig,
        "ED_overlay": ed_overlay,
        "ES_original": es_orig,
        "ES_overlay": es_overlay
    }

