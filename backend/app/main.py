from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router
from app.database import init_db

app = FastAPI(title=settings.app_name, debug=settings.debug)

# Initialize database
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to ChatHub API"}
