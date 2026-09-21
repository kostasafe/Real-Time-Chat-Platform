import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "ChatHub API"
    api_version: str = "v1"
    debug: bool = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "on"}


settings = Settings()
