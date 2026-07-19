from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "SIGAI-SES"

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # CORS: lista de orígenes permitidos, separado por comas (ej: http://localhost:5173,http://mi.frontend.com)
    CORS_ALLOWED_ORIGINS: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
