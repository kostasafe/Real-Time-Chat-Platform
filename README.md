# Real-Time-Chat-Platform

A minimal real-time chat platform prototype with a FastAPI backend and a Vite + React (TypeScript) frontend. This README summarizes the project structure, how to run the services locally, and the important endpoints available today.

**Status:** Work in progress — basic backend health routes and frontend shell are present.

**Repository layout**
- **backend/**: FastAPI backend application
	- `requirements.txt` – Python dependencies
	- `app/` – FastAPI app package (entry: `app.main`)
		- `core/config.py` – small settings object
		- `routers/health.py` – health check router
- **frontend/**: Vite + React (TypeScript) frontend
	- `index.html`, `src/` – React app entrypoints
	- `package.json` – frontend scripts and deps

**What works today**
- Backend: a FastAPI app exposing:
	- `GET /` — returns a welcome message
	- `GET /health` — returns a simple status object
	- `POST /chat/message` — accepts a chat payload and echoes it back
	These are implemented in [backend/app/main.py](backend/app/main.py), [backend/app/routers/health.py](backend/app/routers/health.py), and [backend/app/routers/chat.py](backend/app/routers/chat.py).
- Frontend: Vite + React scaffold with `src/main.tsx` and `index.html` plus a basic chat input in `src/App.tsx` that sends messages to the backend.

**Local development — Backend (Windows PowerShell)**
1. Create and activate a virtual environment (optional but recommended):

```
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```
pip install -r backend/requirements.txt
```

3. Start the API server (development, auto-reload):

```
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

By default the backend sets CORS to allow `http://localhost:5173` so the frontend dev server can call the API.

**Local development — Frontend**
1. Install dependencies and start the Vite dev server:

```
cd frontend
npm install
npm run dev
```

The frontend dev server typically runs at `http://localhost:5173` and will proxy calls to the backend when you call the backend endpoints from browser code.

**Quick API checks**
- Root: `curl http://127.0.0.1:8000/`
- Health: `curl http://127.0.0.1:8000/health`
---
