import logging
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from typing import AsyncGenerator
from sqlalchemy.exc import SQLAlchemyError
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)


def _normalize_db_url(raw: str, driver: str = "asyncpg") -> str:
    """Limpia la URL de BD para evitar errores de parseo comunes:
    - espacios/comillas pegadas por error
    - 'postgres://' sin driver (agrega +asyncpg / +psycopg2)
    - query params estilo Neon (?sslmode=require&channel_binding=require),
      que asyncpg no soporta: el SSL se maneja via connect_args.
    """
    if not raw:
        return raw
    url = raw.strip().strip("'\"` \t")
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if "+" not in url.split("://", 1)[0]:
        scheme, rest = url.split("://", 1)
        url = f"{scheme}+{driver}://{rest}"
    return url.split("?", 1)[0]


db_url = _normalize_db_url(settings.DATABASE_URL)

connect_args = {}
if db_url and "postgresql" in db_url:
    connect_args["ssl"] = "require"

if db_url and "sqlite" in db_url:
    engine = create_async_engine(db_url, echo=False)
elif db_url and "mysql" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
        pool_size=5,
        max_overflow=5,
        pool_timeout=60,
        pool_recycle=1800,
    )
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        connect_args=connect_args,
        pool_size=5,
        max_overflow=5,
        pool_timeout=60,
        pool_recycle=1800,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    try:
        async with AsyncSessionLocal() as session:
            yield session
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {e}")
    except RequestValidationError:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en get_db: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")
