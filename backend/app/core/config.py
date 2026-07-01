from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "ChatHub API"
    debug: bool = True


settings = Settings()
