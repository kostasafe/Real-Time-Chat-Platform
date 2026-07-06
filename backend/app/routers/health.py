from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "ChatHub backend is running",
        "app_name": settings.app_name,
        "api_version": settings.api_version,
    }
