import logging
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

# Crear motor asíncrono. Si la URL apunta a SQLite (por ejemplo en tests),
# evitamos pasar parámetros de pool que no son compatibles con ese dialecto.
db_url = settings.DATABASE_URL
if db_url and "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
    )
elif db_url and "mysql" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_timeout=60,
        pool_recycle=1800
    )
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        connect_args={"ssl": "require"},
        pool_size=10,
        max_overflow=20,
        pool_timeout=60,
        pool_recycle=1800
    )

# Generador de sesiones
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

Base = declarative_base()

# Dependencia para obtener la sesión de BD en los endpoints
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    try:
        async with AsyncSessionLocal() as session:
            yield session
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error de conexion a la base de datos: {e}"
        )
