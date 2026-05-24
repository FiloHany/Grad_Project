# CardioVision — AI Cardiac Ultrasound Analysis System

> Automated echocardiography analysis powered by deep learning.  
> Upload two cardiac ultrasound sequences → get EF, volumes, diagnosis, annotated frames, and a full clinical report.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start](#quick-start)
7. [Full Installation Guide](#full-installation-guide)
8. [Running in Development Mode](#running-in-development-mode)
9. [Authentication & User Management](#authentication--user-management)
10. [API Reference](#api-reference)
11. [ML Pipeline](#ml-pipeline)
12. [Frontend Pages](#frontend-pages)
13. [Clinical Outputs](#clinical-outputs)
14. [For the Team](#for-the-team)
15. [Troubleshooting](#troubleshooting)

---

## What It Does

CardioVision takes two echocardiography video sequences (4-Chamber and 2-Chamber views) and automatically:

1. **Segments** cardiac structures in every frame — Left Ventricle (LV), Myocardium, Left Atrium (LA)
2. **Detects** End-Diastole (ED) and End-Systole (ES) frames from the volume curve
3. **Computes** all standard clinical measurements using the Biplane Simpson method
4. **Predicts** Ejection Fraction using a 3D CNN video model (R(2+1)D-18 + Attention)
5. **Ensembles** both EF predictions into a final clinical value
6. **Classifies** cardiac function — Normal / Mild / Moderate / Severe Dysfunction
7. **Generates** annotated frame PNGs and cardiac cycle GIF overlays
8. **Returns** everything via a clean REST API with a full-featured React web UI

### What the Doctor Sees

```
Diagnosis:     Normal
Final EF:      61.42 %

EDV:           124.37 mL      End-Diastolic Volume
ESV:            48.12 mL      End-Systolic Volume
SV:             76.25 mL      Stroke Volume
LV Max Area:    21.42 cm²
LA Max Area:    18.37 cm²
FAC:            45.73 %       Fractional Area Change
LA EF:          52.18 %       Left Atrial Ejection Fraction
```

Plus four annotated images (ED and ES frames, raw + segmentation overlay) and two animated GIFs of the full cardiac cycle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **ML Models** | PyTorch — nnU-Net (segmentation) + R(2+1)D-18 + Attention (EF regression) |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, SQLite |
| **Auth** | JWT (python-jose), bcrypt password hashing |
| **Frontend** | React 18, Vite, Tailwind CSS v3, Ant Design 5, Recharts, Lucide |
| **Medical I/O** | NIfTI format via nibabel, OpenCV, imageio |
| **Database** | SQLite (file: `cardiovision.db`) — swappable to PostgreSQL via `DATABASE_URL` |

---

## System Architecture

```
Browser (React SPA)
       │  HTTP / REST
       ▼
  run.py  ──► uvicorn (port 8000)
       │
       ▼
  app/main.py  (FastAPI — CORS, static mounts, router registration)
       │
       ├──► /api/auth/*      register · login · profile · reset-password
       ├──► /api/studies/*   upload · analyze
       ├──► /api/jobs/*      status · measurements · visualizations · report
       ├──► /health          liveness check
       ├──► /media/*         static file server for GIFs and PNGs
       └──► /                React SPA (catch-all, must be last)
                  │
                  └── app/services/job_service.py   (background thread pool)
                              │
                              ▼
                  app/ml_adapter/pipeline_wrapper.py
                  (sole boundary between product and ML code)
                              │
                              ▼
                  src/  (ML pipeline — do not modify)
                  ├── models/         nnU-Net · R(2+1)D-18
                  ├── predictors/     segmentation · EF video
                  ├── postprocessing/ Biplane Simpson · cardiac metrics
                  └── visualization/  GIFs · annotated PNGs
```

**Key design rule:** The product layer (`app/`) and the ML pipeline (`src/`) are fully decoupled. `pipeline_wrapper.py` is the only file allowed to import from `src/`.

---

## Project Structure

```
CardioVision/
│
├── app/                            ← Product / API layer
│   ├── main.py                     FastAPI app entry — mounts, CORS, routers
│   ├── api/routes/
│   │   ├── auth.py                 /api/auth/* — register, login, profile, reset-password
│   │   ├── studies.py              /api/studies/* — upload, analyze
│   │   └── jobs.py                 /api/jobs/* — status, report, measurements
│   ├── core/
│   │   └── security.py             JWT creation/decode, bcrypt helpers
│   ├── database/
│   │   ├── db.py                   SQLAlchemy engine + session factory
│   │   └── models.py               Doctor + JobRecord ORM models
│   ├── schemas/                    Pydantic request/response contracts
│   ├── services/
│   │   └── job_service.py          Background thread manager
│   ├── storage/
│   │   └── job_store.py            Thread-safe in-memory + DB job cache
│   ├── ml_adapter/
│   │   └── pipeline_wrapper.py     ONLY file that imports from src/
│   └── static/                     ← Built React app goes here (vite build output)
│
├── frontend/                       ← React SPA source
│   ├── src/
│   │   ├── api/client.js           All fetch calls to the backend
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     JWT token + doctor state
│   │   │   └── ThemeContext.jsx    Dark / light mode toggle
│   │   ├── components/
│   │   │   ├── auth/               PrivateRoute guard
│   │   │   ├── layout/             AppSidebar, AppHeader
│   │   │   └── results/            DiagnosisBanner, MetricsGrid,
│   │   │                           MeasurementsTable, VisualizationPanel
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     Public marketing / hero page
│   │   │   ├── LoginPage.jsx       /login
│   │   │   ├── RegisterPage.jsx    /register
│   │   │   ├── ForgotPasswordPage.jsx  /forgot-password
│   │   │   ├── ResetPasswordPage.jsx   /reset-password
│   │   │   ├── Dashboard.jsx       Main overview with EF trend chart
│   │   │   ├── NewAnalysis.jsx     Upload + live progress tracking
│   │   │   ├── HistoryPage.jsx     All past studies
│   │   │   ├── ReportView.jsx      Full analysis report
│   │   │   ├── PatientsPage.jsx    Patients list (grouped from jobs)
│   │   │   ├── PatientDetailPage.jsx   Per-patient study history
│   │   │   └── ProfilePage.jsx     Doctor profile + settings
│   │   ├── constants/index.js      Shared helpers (fmtDate, diagTagColor, …)
│   │   └── App.jsx                 Router + AppShell
│   ├── package.json
│   └── vite.config.js              Dev proxy → http://localhost:8000
│
├── src/                            ← ML pipeline (do not modify)
│   ├── models/
│   │   ├── nnUnet_model.py         nnU-Net with Deep Supervision
│   │   └── resnet18_model.py       R(2+1)D-18 + Spatial/Temporal Attention
│   ├── predictors/
│   ├── postprocessing/
│   └── visualization/
│
├── weights/
│   ├── best_unet_camus.pt          Segmentation model weights  ← required
│   └── best_resnet_model.pt        EF prediction model weights ← required
│
├── test_cases/
│   └── patient0233/                Sample NIfTI files for testing
│       ├── patient0233_4CH_half_sequence.nii.gz
│       └── patient0233_2CH_half_sequence.nii.gz
│
├── cardiovision.db                 SQLite database (auto-created on first run)
├── jobs/                           Runtime — job state + output files (git-ignored)
├── uploads/                        Runtime — uploaded NIfTI files (git-ignored)
│
├── run.py                          Server entry point (auto-redirects to venv)
├── start.bat                       Windows one-click launcher
└── requirements.txt
```

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Python** | 3.10+ | Must use the project venv — see below |
| **Node.js** | 18+ | Only needed if editing the frontend |
| **PyTorch** | 2.x | Installed separately — see below |
| **GPU** | Optional | CPU works, but inference is ~4× slower |
| **Model weights** | — | `best_unet_camus.pt` + `best_resnet_model.pt` in `weights/` |

---

## Quick Start

> This is the fastest path to get the server running. Assumes the `ENV/` venv already exists and the model weights are in `weights/`.

**Windows:**
```bat
start.bat
```

**Manual (all platforms):**
```bash
ENV\Scripts\python.exe run.py        # Windows
ENV/bin/python run.py                # macOS / Linux
```

Then open **http://localhost:8000** — the full React UI will load.

---

## Full Installation Guide

Follow these steps when setting up the repo for the first time.

### 1 — Clone

```bash
git clone https://github.com/FiloHany/Grad_Project.git
cd Grad_Project
```

### 2 — Create the Python virtual environment

```bash
python -m venv ENV
```

### 3 — Activate the venv

```bash
# Windows (PowerShell)
.\ENV\Scripts\Activate.ps1

# Windows (CMD)
ENV\Scripts\activate.bat

# macOS / Linux
source ENV/bin/activate
```

### 4 — Install PyTorch

Visit [pytorch.org/get-started](https://pytorch.org/get-started/locally/) and choose the command for your system.

**CPU only (works on any machine):**
```bash
pip install torch==2.3.1+cpu torchvision==0.18.1+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu
```

**GPU (CUDA 12.1):**
```bash
pip install torch torchvision \
    --index-url https://download.pytorch.org/whl/cu121
```

### 5 — Install project dependencies

```bash
pip install -r requirements.txt
```

Installs: FastAPI, Uvicorn, SQLAlchemy, python-jose, bcrypt, nibabel, OpenCV, imageio.

### 6 — Add model weights

Place the two weight files in the `weights/` folder:

```
weights/
  best_unet_camus.pt        ← nnU-Net segmentation
  best_resnet_model.pt      ← R(2+1)D-18 EF regression
```

Contact the project owner for the download link if you don't have these.

### 7 — (Optional) Build the frontend

> Skip this if you are not editing the UI — the pre-built files in `app/static/` are already committed.

```bash
cd frontend
npm install
npm run build       # outputs to app/static/
cd ..
```

### 8 — Start the server

```bash
python run.py
```

Or on Windows, just double-click **`start.bat`**.

**Expected output:**
```
[run.py] Starting CardioVision API...
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Open **http://localhost:8000** in your browser.

---

## Running in Development Mode

When actively editing the frontend, run the Vite dev server alongside the backend for hot-reload:

**Terminal 1 — Backend:**
```bash
python run.py
```

**Terminal 2 — Frontend dev server:**
```bash
cd frontend
npm install        # first time only
npm run dev        # starts at http://localhost:5173
```

Open **http://localhost:5173**. Vite proxies all `/api/*` requests to the backend on port 8000 (configured in `vite.config.js`).

When you are done, build and commit the updated static files:
```bash
cd frontend
npm run build
```

> **Never edit files inside `app/static/` directly** — they are generated by `npm run build` and will be overwritten.

---

## Authentication & User Management

The system uses **JWT-based authentication**. Every doctor has an account — all jobs are linked to their profile.

### Register

```
POST /api/auth/register
```
```json
{
  "full_name":      "Dr. Jane Smith",
  "email":          "jane@hospital.com",
  "password":       "SecurePass1",
  "license_number": "MD-12345",
  "specialty":      "Cardiology"
}
```
Returns an `access_token` on success.

### Login

```
POST /api/auth/login
```
```json
{ "email": "jane@hospital.com", "password": "SecurePass1" }
```
Returns `{ "access_token": "...", "doctor": { ... } }`.

### Authenticated requests

Include the token as a `Bearer` header:
```
Authorization: Bearer <access_token>
```

### Forgot / Reset Password

1. `POST /api/auth/forgot-password` — verifies the email is registered
2. Navigate to `/reset-password` in the UI
3. `POST /api/auth/reset-password` — updates the password hash in the database

```json
{ "email": "jane@hospital.com", "new_password": "NewSecurePass1" }
```

> **Note:** There is no real email server in this build. The "instructions sent" screen in the UI is a UI simulation. The password is actually reset on the `/reset-password` page when you submit the new password.

### Password requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number

### Admin: clear the database (development)

```bash
ENV\Scripts\python.exe -c "
import sqlite3; conn = sqlite3.connect('cardiovision.db')
conn.execute('DELETE FROM job_records'); conn.execute('DELETE FROM doctors')
conn.commit(); print('DB cleared')
"
```

---

## API Reference

**Base URL:** `http://localhost:8000`  
**Interactive Swagger docs:** `http://localhost:8000/docs`  
**Auth header required** on all `/api/jobs/*` and `/api/studies/*` endpoints.

---

### Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Create a new doctor account |
| `POST` | `/api/auth/login` | ✗ | Get a JWT token |
| `GET` | `/api/auth/me` | ✓ | Get current doctor profile |
| `PATCH` | `/api/auth/me` | ✓ | Update name or specialty |
| `POST` | `/api/auth/forgot-password` | ✗ | Verify email is registered |
| `POST` | `/api/auth/reset-password` | ✗ | Update password by email |

---

### Study & Job Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/studies/upload` | ✓ | Upload 4CH + 2CH NIfTI files |
| `POST` | `/api/studies/{study_id}/analyze` | ✓ | Start ML pipeline (async) |
| `GET` | `/api/jobs` | ✓ | List all jobs for current doctor |
| `GET` | `/api/jobs/{job_id}` | ✓ | Poll job status + progress |
| `GET` | `/api/jobs/{job_id}/measurements` | ✓ | Clinical measurements (completed only) |
| `GET` | `/api/jobs/{job_id}/visualizations` | ✓ | GIF + PNG URLs (completed only) |
| `GET` | `/api/jobs/{job_id}/report` | ✓ | Full report in one call (completed only) |
| `GET` | `/health` | ✗ | Liveness check |

---

### Integration Flow (step by step)

```
1. POST /api/auth/login              → get access_token
2. POST /api/studies/upload          → get study_id
3. POST /api/studies/{id}/analyze    → get job_id
4. GET  /api/jobs/{id}               → poll every 3s until status == "completed"
5. GET  /api/jobs/{id}/report        → fetch full results in one call
```

---

### Job Status Values

| Status | Meaning |
|---|---|
| `queued` | Created, waiting for a thread |
| `running` | Pipeline is actively executing |
| `completed` | All stages done — results ready |
| `failed` | Error — see `error_message` field |

### Pipeline Stages (while `running`)

| Stage | Progress | What is happening |
|---|---|---|
| `segmentation` | 5 → 60% | nnU-Net segments every frame in both views |
| `measurement` | 65% | ED/ES detection + Biplane Simpson + all metrics |
| `cnn_inference` | 70% | ResNet3D predicts EF from 48-frame clip |
| `visualization` | 80% | GIFs and PNGs generated and saved to disk |

---

### Example: Full Measurements Response

```json
{
  "ef_biplane":       60.10,
  "ef_cnn":           62.80,
  "ef_final":         61.45,
  "edv_ml":          124.37,
  "esv_ml":           48.12,
  "sv_ml":            76.25,
  "lv_area_max_cm2":  21.42,
  "fac_pct":          45.73,
  "la_area_max_cm2":  18.37,
  "la_ef_pct":        52.18,
  "ed_frame_index":   14,
  "es_frame_index":    6,
  "diagnosis":        "Normal"
}
```

> `ef_cnn` is `null` when the sequence has fewer than 48 frames. `ef_final` falls back to `ef_biplane` automatically.

---

## ML Pipeline

### Input Format

Two echocardiography sequences in NIfTI format (`.nii` or `.nii.gz`):

| View | Field | Usage |
|---|---|---|
| 4-Chamber (4CH) | `file_4ch` | Primary — all measurements, segmentation, CNN |
| 2-Chamber (2CH) | `file_2ch` | Biplane volume calculation only |

Pixel spacing (mm/pixel) is read from the NIfTI header and used to convert pixel areas into physical units (cm², mL).

### Pipeline Flow

```
NIfTI Load  (nibabel — shape W×H×T → transposed to T×H×W)
    │
    ▼
Frame-wise Segmentation  [nnU-Net with Deep Supervision]
    │  Each frame: normalize → resize 384×384 → argmax of 4-class output
    │  Mask values: 0=Background  1=LV  2=Myocardium  3=LA
    │
    ▼
Volume Curve + ED/ES Detection
    │  Biplane Simpson per frame → volume curve over time
    │  ED = argmax(volumes)   ES = argmin(volumes)
    │
    ▼
Clinical Measurements
    │  EDV, ESV, EF, SV — from biplane volumes
    │  LV area, FAC     — from 4CH mask areas
    │  LA area, LA EF   — from 4CH mask areas
    │
    ▼
3D CNN EF Prediction  [R(2+1)D-18 + Spatial/Temporal Attention]
    │  48-frame clip centered on ES frame
    │  Input shape: (1, 3, 48, 112, 112)
    │  Output: EF% as a single float
    │
    ▼
Ensemble
    │  Final EF = (biplane EF + CNN EF) / 2
    │  Fallback: if sequence < 48 frames → Final EF = biplane EF only
    │
    ▼
Diagnosis Classification
    │  EF ≥ 55% → Normal
    │  40–54%  → Mild Dysfunction
    │  30–39%  → Moderate Dysfunction
    │  < 30%   → Severe Dysfunction
    │
    ▼
Visualization
    original.gif + overlay.gif  (full cardiac cycle animations)
    ED_original.png + ED_overlay.png
    ES_original.png + ES_overlay.png
```

### Models

| Model | Weight File | Task | Architecture |
|---|---|---|---|
| Segmentation | `weights/best_unet_camus.pt` | 4-class per-frame segmentation | nnU-Net + Deep Supervision |
| EF Regression | `weights/best_resnet_model.pt` | EF% from raw video | R(2+1)D-18 + Attention |

Both models are loaded **once at server startup** and stay in memory. First startup is 15–30 seconds on CPU.

### Segmentation Color Code

| Color | Structure |
|---|---|
| 🔵 Blue | Left Ventricle (LV) |
| 🟢 Green | Myocardium |
| 🔴 Red | Left Atrium (LA) |

---

## Frontend Pages

| Page | Route / View | Description |
|---|---|---|
| Landing | `/` | Public hero page with feature overview |
| Login | `/login` | Email + password sign-in, "Forgot password?" link |
| Register | `/register` | New doctor account creation |
| Forgot Password | `/forgot-password` | Email verification step |
| Reset Password | `/reset-password` | New password form with strength meter |
| Dashboard | `app` → `dashboard` | Overview: stat cards, EF trend chart, recent studies, alerts, activity feed |
| New Analysis | `app` → `new-analysis` | File upload + live pipeline progress |
| Study History | `app` → `history` | Searchable table of all past jobs |
| Analysis Report | `app` → `report` | Full report: diagnosis banner, metrics grid, visualizations, measurements table |
| Patients | `app` → `patients` | All patients grouped from job records |
| Patient Details | `app` → `patient-detail` | Per-patient study list + EF statistics |
| Profile | `app` → `profile` | Edit name/specialty, security info, quick actions |

All authenticated pages live inside the `/app` route and use view-based navigation (no URL changes after login).

---

## Clinical Outputs

| Field | Unit | Method | Description |
|---|---|---|---|
| `ef_biplane` | % | Biplane Simpson | EF from segmentation volumes |
| `ef_cnn` | % | 3D CNN | EF from raw video (may be null) |
| `ef_final` | % | Ensemble avg | Final clinical EF — always use this |
| `edv_ml` | mL | Biplane Simpson | End-Diastolic Volume |
| `esv_ml` | mL | Biplane Simpson | End-Systolic Volume |
| `sv_ml` | mL | EDV − ESV | Stroke Volume per beat |
| `lv_area_max_cm2` | cm² | Pixel sum × spacing | Max LV cross-sectional area |
| `fac_pct` | % | (Amax−Amin)/Amax | Fractional Area Change |
| `la_area_max_cm2` | cm² | Pixel sum × spacing | Max Left Atrial area |
| `la_ef_pct` | % | Area-based | Left Atrial Ejection Fraction |
| `ed_frame_index` | — | argmax(volumes) | Frame index of End-Diastole |
| `es_frame_index` | — | argmin(volumes) | Frame index of End-Systole |
| `diagnosis` | — | EF threshold | Normal / Mild / Moderate / Severe |

---

## For the Team

### Who owns what

| Area | Files | Owner |
|---|---|---|
| ML models & pipeline | `src/` | ML team — do not touch |
| ML ↔ API boundary | `app/ml_adapter/pipeline_wrapper.py` | ML team or backend lead |
| API routes, DB, auth | `app/api/`, `app/database/`, `app/core/` | Backend team |
| React UI | `frontend/src/` | Frontend team |
| API contracts | `app/schemas/` | Shared — change with both teams |

### Adding a new API endpoint

1. Add route in the appropriate file in `app/api/routes/`
2. Add Pydantic schema in `app/schemas/` if the response shape is new
3. Add the corresponding fetch function in `frontend/src/api/client.js`
4. Rebuild the frontend: `cd frontend && npm run build`

### Adding a new frontend page

1. Create `frontend/src/pages/YourPage.jsx`
2. Import and add to the view-switch block in `frontend/src/App.jsx`
3. Add a nav item in `frontend/src/components/layout/AppSidebar.jsx` if needed
4. Rebuild: `npm run build`

### Database

The SQLite database is at `cardiovision.db` in the repo root. It is **git-ignored** — every developer has their own local database.

**ORM models** (in `app/database/models.py`):

- `Doctor` — id, uuid, full_name, email, password_hash, license_number, specialty, created_at
- `JobRecord` — id, job_id, doctor_id (FK), status, data (JSON blob)

**To inspect the database directly:**
```bash
ENV\Scripts\python.exe -c "
import sqlite3
conn = sqlite3.connect('cardiovision.db')
for row in conn.execute('SELECT id, full_name, email FROM doctors'): print(row)
"
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./cardiovision.db` | Change to PostgreSQL for production |
| `JWT_SECRET` | hardcoded dev value | **Must change in production** |
| `DISABLE_DOCS` | `false` | Set `true` to hide `/docs` and `/redoc` |
| `PORT` | `8000` | Set automatically by Railway / cloud hosts |

### Running on a different port

```bash
python run.py --port 8080
```

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'nibabel'` (or any ML package)

You are running with the system Python instead of the project venv. `run.py` auto-detects this and relaunches — but if it fails:

```bash
# Always use the venv Python explicitly:
ENV\Scripts\python.exe run.py          # Windows
ENV/bin/python run.py                  # macOS / Linux
```

Or use **`start.bat`** on Windows — it always uses the correct Python.

---

### Port 8000 already in use

```
ERROR: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```

Kill the existing process and restart:

```powershell
# Windows — kill whatever holds port 8000
Get-NetTCPConnection -LocalPort 8000 |
  Select -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }

python run.py
```

Or use a different port:
```bash
python run.py --port 8080
```

---

### `ef_cnn` is null

Expected behaviour when the uploaded sequence has fewer than 48 frames (common with `half_sequence` test files). The system falls back to biplane EF only. `ef_final` is still valid and correct.

---

### Slow startup (15–30 seconds)

Both ML models load into RAM at startup. This is normal on CPU. After the first load, each analysis runs without reloading. Do not use `--reload` — it kills background inference threads mid-run.

---

### Model weights not found

```
FileNotFoundError: weights/best_unet_camus.pt
```

The weights are not stored in the repository. Place them in the `weights/` folder:

```
weights/
  best_unet_camus.pt
  best_resnet_model.pt
```

Contact the project owner for the download link.

---

### Wrong file format

```
400: 'myfile.mp4' is not a valid NIfTI file. Expected .nii or .nii.gz
```

The pipeline only accepts NIfTI format. To convert from DICOM:
```bash
pip install dcm2niix
dcm2niix -o ./output -z y ./dicom_folder
```

---

### Frontend shows blank page after `npm run build`

Check that `vite build` completed without errors. The output must go to `app/static/`:
```bash
cd frontend
npm run build
# should say "built in X.XXs" at the end
```

If `app/static/` is empty or missing `index.html`, the React app won't load.

---

### Login fails with `ECONNREFUSED`

The backend server is not running. Start it first:
```bash
python run.py
# or
start.bat
```

---

## System Pipeline Diagram

![System Pipeline](test_cases/pipline_of_cadiovision.png)

See `schema.drawio` for the full software architecture diagram (open with [diagrams.net](https://app.diagrams.net)).
