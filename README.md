# Weapon Surveillance Dashboard

A full-stack weapon surveillance dashboard with:

- FastAPI backend
- React + Vite frontend
- SQLite database
- live camera management
- detection history and alerts
- support for both YOLO and SSD ResNet50 model checkpoints

## Tech Stack

- Frontend: React, Vite, MUI, Axios
- Backend: FastAPI, SQLAlchemy, Uvicorn
- Database: SQLite
- Vision/ML: OpenCV, Ultralytics, PyTorch, Torchvision

## Project Structure

```text
weapon-surveillance-dashboard/
├── backend/
│   ├── app/
│   ├── media/
│   ├── models/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

## Prerequisites

Install these first:

- Python 3.11+ recommended
- Node.js 18+ recommended
- npm
- Git

## Clone The Repository

```bash
git clone <your-repo-url>
cd weapon-surveillance-dashboard
```

## Backend Setup

Open a terminal in the project root, then move into the backend folder.

### 1. Create a virtual environment

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Create the backend environment file

Create a file named `.env` inside the `backend` folder.

Example:

```env
DATABASE_URL=sqlite:///./smart_dashboard.db
CONFIDENCE_THRESHOLD=0.3
SSD_CONFIDENCE_THRESHOLD=0.7
SSD_NMS_IOU_THRESHOLD=0.7
SKIP_FRAMES=5
DEFAULT_MODEL=yolov26_d1
DRAW_DETECTION_OVERLAY=true
OVERLAY_TTL_SECONDS=0.7
FILTER_TO_ALLOWED_CLASSES=true
```

### 4. Make sure model weights exist

Before starting the backend, verify that `backend/models/` contains the model files used by the app, for example:

- YOLO `.pt` files
- SSD ResNet50 `.pth` files

This project is set up so the actual weight files are not stored in Git.
Your friends should download them from your shared Google Drive and copy them into `backend/models/`.

There is a placeholder guide in:

- `backend/models/README.md`

If the weights are missing, the backend will still start, but switching to a missing model will fail.

### 5. Run the backend

From the `backend` folder:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Useful URLs:

- API root: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Detection media: `http://127.0.0.1:8000/media/...`

## Frontend Setup

Open a second terminal in the project root.

### 1. Go to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the frontend

```bash
npm run dev
```

Frontend will usually run at:

```text
http://localhost:5173
```

The frontend is already configured to call the backend at:

```text
http://127.0.0.1:8000
```

## Running The Full App

You need two terminals running at the same time:

### Terminal 1

```bash
cd backend
uvicorn app.main:app --reload
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

## First-Time Usage

When the backend starts:

- SQLite tables are created automatically
- the app reads the active model from backend config
- active cameras saved in the database are started automatically

To test locally:

- add a camera from the dashboard
- for a local webcam, try using `0` as the camera source
- for IP cameras or streams, use the stream URL

Note:

- camera sources saved as digit strings like `0` are converted to an integer camera index by the backend

## Switching Models

The app supports multiple detection models through the header dropdown.

Currently the backend is configured for:

- YOLO variants
- SSD ResNet50 variants

If a model file is present in `backend/models`, it can be loaded through the backend model manager.

## Troubleshooting

### Backend does not start

Check:

- your virtual environment is activated
- dependencies are installed with `pip install -r requirements.txt`
- `backend/.env` exists
- `DATABASE_URL` is valid

### Frontend cannot connect to backend

Check:

- backend is running on `http://127.0.0.1:8000`
- frontend is running on `http://localhost:5173`
- `frontend/src/api/axios.js` still points to `http://127.0.0.1:8000`

### Model loading fails

Check:

- model files exist in `backend/models`
- file names match what is configured in `backend/app/config.py`
- required ML dependencies were installed successfully

### Camera does not open

Check:

- the source is valid
- webcam index is correct, for example `0` or `1`
- no other app is blocking the camera
- OpenCV can access the device on your machine

## Notes For Contributors

- Backend config: `backend/app/config.py`
- Backend entry point: `backend/app/main.py`
- Frontend entry point: `frontend/src/main.jsx`
- Model integration notes: `_ssd_integration_report.md`

## License

Add your preferred license here if needed.
