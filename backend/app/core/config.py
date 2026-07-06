from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "ChatHub API"
    api_version: str = "v1"
    debug: bool = True


settings = Settings()
