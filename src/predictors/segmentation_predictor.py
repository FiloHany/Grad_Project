# segmentation_predictor.py -- Segmentation predictor for echocardiogram videos.

import numpy as np
import cv2
import torch
from pathlib import Path

from models import UNetDeepSupervision


# ---------------------------
# Load model
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SEG_MODEL_PATH = BASE_DIR / "weights" / "best_unet_camus.pt"

def load_segmentation_model():

    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = UNetDeepSupervision(
        in_channels=1,
        num_classes=4
    ).to(device)

    ckpt = torch.load(
        SEG_MODEL_PATH,
        map_location=device
    )

    model.load_state_dict(ckpt)

    model.eval()

    return model, device


# ---------------------------
# Preprocess frame
# ---------------------------
def preprocess_frame(frame):

    frame = frame.astype(np.float32)

    p1, p99 = np.percentile(frame, (1, 99))

    frame = np.clip(frame, p1, p99)

    frame = (frame - p1) / (p99 - p1 + 1e-6)

    frame = cv2.resize(frame, (384, 384))

    return torch.from_numpy(frame)\
        .float()\
        .unsqueeze(0)


# ---------------------------
# Predict masks
# ---------------------------
def predict_masks(frames, model, device):

    preds = []

    for frame in frames:

        inp = preprocess_frame(frame)\
            .unsqueeze(0)\
            .to(device)

        with torch.no_grad():

            out, _, _, _ = model(inp)

            pred = torch.argmax(
                out,
                dim=1
            ).squeeze().cpu().numpy()

        pred = cv2.resize(
            pred.astype(np.uint8),
            (frame.shape[1], frame.shape[0]),
            interpolation=cv2.INTER_NEAREST
        )

        preds.append(pred)

    return np.array(preds)