# ─────────────────────────────────────────────────────────────────────────────
#  CardioVision — Production Dockerfile
#
#  Build order is carefully layered for maximum Docker cache reuse:
#    1. System libs  (rarely changes)
#    2. PyTorch CPU  (large, rarely changes — ~1.5 GB, own layer)
#    3. Other Python deps  (requirements.txt changes infrequently)
#    4. Application code   (changes most often — last layer)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.10-slim

WORKDIR /app

# ── 1. System libs required by OpenCV and nibabel ────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        libglib2.0-0 libsm6 libxrender1 libxext6 libgl1 \
    && rm -rf /var/lib/apt/lists/*

# ── 2. PyTorch CPU (separate layer — avoids re-downloading 1.5 GB on each ────
#       code change, as long as this line doesn't change)
RUN pip install --no-cache-dir \
        torch==2.3.1+cpu \
        torchvision==0.18.1+cpu \
        --extra-index-url https://download.pytorch.org/whl/cpu

# ── 3. Other Python dependencies ─────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── 4. Application code (changes most often — always last) ───────────────────
COPY src/     ./src/
COPY app/     ./app/
COPY weights/ ./weights/
COPY run.py   .

# Runtime dirs — created fresh on startup by run.py anyway
RUN mkdir -p jobs uploads

# Railway injects $PORT; expose a sensible default for local runs
EXPOSE 8000

# Health-check for docker-compose / orchestrators
HEALTHCHECK --interval=30s --timeout=8s --start-period=30s --retries=3 \
    CMD python -c \
        "import os,urllib.request; \
         urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\",8000)}/health')"

# run.py reads $PORT from the environment automatically
CMD ["python", "run.py"]
