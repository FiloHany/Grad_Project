# ef_video_predictor.py -- EF predictor for echocardiogram videos.

from pathlib import Path
import numpy as np
import cv2
import torch

from models import ResNet3D_EF


# ---------------------------
# Device
# ---------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"


# ---------------------------
# Load EF model once
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
EF_MODEL_PATH = BASE_DIR / "weights" / "best_resnet_model.pt"

ef_model = ResNet3D_EF(
    pretrained=False,
    in_channels=3,
    dropout=0.3
).to(device)

ckpt = torch.load(EF_MODEL_PATH, map_location=device)

state_dict = ckpt["model_state"]

new_state_dict = {}

for k, v in state_dict.items():

    if k.startswith("module."):
        k = k.replace("module.", "")

    new_state_dict[k] = v

ef_model.load_state_dict(new_state_dict)

ef_model.eval()

# print("✅ EF video model loaded")


# ---------------------------
# Frame preprocessing
# ---------------------------
def preprocess_video_frame(frame, size=(112,112)):

    if frame.ndim == 3:
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    frame = cv2.resize(frame, size, interpolation=cv2.INTER_AREA)

    frame = frame.astype("float32")

    if frame.max() > 1:
        frame = frame / 255.0

    return frame


# ---------------------------
# ES-centered clip
# ---------------------------
def crop_es_center_window(
    frames,
    es_frame,
    clip_len=48
):

    total = len(frames)

    half = clip_len // 2

    start = es_frame - half
    end = es_frame + half

    if start < 0:

        start = 0
        end = clip_len

    if end > total:

        end = total
        start = total - clip_len

    return frames[start:end]

# ---------------------------
# Predict EF from clip
# clip shape:
# list/array of 48 frames
# ---------------------------
def predict_ef_video_model(
    data_4ch,
    es_frame,
    clip_len=48,
    in_channels=3,
    size=(112,112)
):
    if len(data_4ch) < clip_len:
        # print("Video too short for EF video model prediction. Skipping EF video model step.")
        return None
    
    clip = crop_es_center_window(
        data_4ch,
        es_frame,
        clip_len=48
    )

    # Safety padding
    clip = list(clip)

    while len(clip) < 48:
        clip.append(clip[-1])

    clip = clip[:48]

    # ---------------------------
    # Preprocess frames
    # ---------------------------
    processed = [
        preprocess_video_frame(f, size)
        for f in clip
    ]

    # ---------------------------
    # Convert to numpy
    # ---------------------------
    video = np.array(processed)   # (T,H,W)

    # ---------------------------
    # Min-max normalization
    # ---------------------------
    vmin = video.min()
    vmax = video.max()

    if vmax > vmin:
        video = (video - vmin) / (vmax - vmin + 1e-6)
    else:
        video = np.zeros_like(video)

    # ---------------------------
    # Add channels
    # ---------------------------
    if in_channels == 1:
        video = np.expand_dims(video, axis=0)
    else:
        video = np.stack([video, video, video], axis=0)

    # ---------------------------
    # Tensor
    # ---------------------------
    video_tensor = torch.from_numpy(video)\
        .float()\
        .unsqueeze(0)\
        .to(device)

    # Shape:
    # (1,3,48,112,112)

    # ---------------------------
    # Inference
    # ---------------------------
    with torch.no_grad():

        output = ef_model(video_tensor)

    ef_pred = output.item()

    return ef_pred