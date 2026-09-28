# Real-Time Chat Platform

[![CI](https://github.com/kostasafe/Real-Time-Chat-Platform/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kostasafe/Real-Time-Chat-Platform/actions/workflows/ci.yml)

A small real-time chat application with a FastAPI backend and a Vite + React frontend.

## Overview

This project currently includes:

- JWT-based user signup/login
- SQLite persistence with SQLAlchemy
- WebSocket room chat with broadcast messaging
- A simple React interface for auth and live messaging
- Backend and frontend test setup

## Tech stack

- Backend: FastAPI, SQLAlchemy, Pydantic, JWT
- Database: SQLite
- Frontend: React + TypeScript + Vite
- Testing: pytest for backend, Vitest for frontend

## Project structure

- `backend/` — FastAPI app
  - `requirements.txt` — Python dependencies
  - `pytest.ini` — pytest configuration
  - `app/` — application package
    - `main.py` — app entry point and router registration
    - `database.py` — SQLite engine and session setup
    - `models.py` — SQLAlchemy models
    - `schemas.py` — request/response validation models
    - `security.py` — password hashing and JWT helpers
    - `core/config.py` — settings object
    - `routers/health.py` — health route
    - `routers/auth.py` — signup, login, logout endpoints
    - `routers/chat.py` — message API and WebSocket endpoint
- `frontend/` — Vite + React app
  - `package.json` — frontend scripts and dependencies
  - `src/App.tsx` — auth flow and chat UI
  - `src/App.test.tsx` — app-level frontend test
- `.github/workflows/ci.yml` — CI pipeline
- `LICENSE` — MIT license

## Current behavior

### Backend API

The backend exposes the following routes:

- `GET /` → returns a welcome message
- `GET /health` → returns a simple health payload
- `POST /auth/signup` → creates a new user
- `POST /auth/login` → verifies credentials and returns a JWT access token
- `POST /auth/logout` → clears the auth cookie
- `POST /chat/message` → echoes a validated chat payload
- `WS /chat/ws/{room}` → accepts a WebSocket and broadcasts messages to users in the same room

The app validates room messages with a bounded-message schema and rejects invalid payloads.

### Frontend

The React app provides:

- Login / signup screen
- Username persistence in localStorage
- WebSocket room connection for live chat
- Message list for the current room
- Logout flow

The frontend connects to the backend at `http://localhost:8000` and uses `ws://localhost:8000` for the socket connection.

## Local development

### 1) Backend (Windows PowerShell)

Create and activate a virtual environment if needed:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install --upgrade pip
pip install -r backend/requirements.txt
```

Start the API server:

```powershell
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend enables CORS for `http://localhost:5173`, which is the default Vite frontend origin.

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend dev server usually runs at:

```text
http://localhost:5173
```

## Database configuration

The backend uses SQLite via SQLAlchemy. By default, it creates a local database file named `chat.db` in the backend directory when the app starts.

You can override this with the `DATABASE_URL` environment variable:

```powershell
$env:DATABASE_URL = "sqlite:///./chat.db"
```

## Authentication notes

The backend issues an access token and also sets it as a cookie during login. The frontend uses the cookie-based flow for the browser experience.

For direct socket testing, the WebSocket endpoint also accepts a token in the query string:

```text
ws://127.0.0.1:8000/chat/ws/general?token=<access_token>
```

## Running tests

### Backend

```powershell
cd backend
pytest
```

### Frontend

```powershell
cd frontend
npm test
```

## Quick API checks

```powershell
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/health
```

Signup example:

```powershell
curl -X POST http://127.0.0.1:8000/auth/signup -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"secret123\"}"
```

Login example:

```powershell
curl -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"password\":\"secret123\"}"
```

## Notes

This project is a lightweight prototype and is intended as a learning / junior-development project rather than as a production-ready chat system.

