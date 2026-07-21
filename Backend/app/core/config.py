import sys
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


def _get_env_path() -> str:
    if getattr(sys, 'frozen', False):
        return str(Path(sys.executable).parent / '.env')
    return '.env'


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

    model_config = SettingsConfigDict(env_file=_get_env_path(), extra="ignore")


settings = Settings()
