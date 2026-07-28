# Real-Time-Chat-Platform

A minimal real-time chat platform prototype with a FastAPI backend and a Vite + React (TypeScript) frontend.

**Status:** Work in progress — the project now includes authentication, room-based WebSocket chat, and a local SQLite-backed user store.

**Repository layout**
- **backend/**: FastAPI backend application
	- `requirements.txt` – Python dependencies
	- `app/` – FastAPI app package (entry: `app.main`)
		- `core/config.py` – small settings object
		- `database.py` – SQLite database setup and session creation
		- `models.py` – SQLAlchemy user model
		- `schemas.py` – Pydantic request/response schemas
		- `security.py` – password hashing and JWT token helpers
		- `routers/health.py` – health check router
		- `routers/auth.py` – signup/login endpoints with JWT authentication
		- `routers/chat.py` – chat router with HTTP echo and WebSocket support
- **frontend/**: Vite + React (TypeScript) frontend
	- `index.html`, `src/` – React app entrypoints
	- `package.json` – frontend scripts and deps
	- `src/App.tsx` – login/signup flow, token persistence, and room-based chat UI using WebSockets

**What works today**
- Backend: a FastAPI app exposing:
	- `GET /` — returns a welcome message
	- `GET /health` — returns a simple status object
	- `POST /auth/signup` — creates a new user account
	- `POST /auth/login` — authenticates a user and returns a JWT access token
	- `POST /chat/message` — accepts a chat payload and echoes it back
	- `WS /chat/ws/{room}` — accepts WebSocket connections and broadcasts messages to clients in the same room
	These are implemented in [backend/app/main.py](backend/app/main.py), [backend/app/routers/health.py](backend/app/routers/health.py), [backend/app/routers/auth.py](backend/app/routers/auth.py), and [backend/app/routers/chat.py](backend/app/routers/chat.py).
- Frontend: a Vite + React app with a login/signup experience in `src/App.tsx` that stores the access token locally, connects to the backend over WebSockets, and displays incoming messages live.
- Data layer: the backend uses SQLite via SQLAlchemy, and a local `chat.db` file is created automatically when the app starts.

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
- Signup: `curl -X POST http://127.0.0.1:8000/auth/signup -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"secret123\"}"`
- Login: `curl -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"password\":\"secret123\"}"`
- WebSocket: open a connection to `ws://127.0.0.1:8000/chat/ws/general` to test live chat behavior.
---
