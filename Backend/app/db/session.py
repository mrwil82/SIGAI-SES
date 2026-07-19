from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from typing import AsyncGenerator

# Crear motor asíncrono. Si la URL apunta a SQLite (por ejemplo en tests),
# evitamos pasar parámetros de pool que no son compatibles con ese dialecto.
db_url = settings.DATABASE_URL
if db_url and "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
    )
else:
    # Crear motor asíncrono para MySQL con pool de conexiones optimizado para concurrencia
    engine = create_async_engine(
        db_url,
        echo=False,          # Desactivado para evitar la sobrecarga de imprimir logs SQL en consola bajo carga
        pool_size=30,        # Número de conexiones estables que se mantendrán abiertas en el pool
        max_overflow=50,     # Conexiones adicionales que se pueden abrir si el pool se llena
        pool_timeout=60,     # Segundos máximos de espera por una conexión del pool antes de arrojar error
        pool_recycle=1800    # Recicla las conexiones cada 30 minutos para evitar conexiones caídas
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
    async with AsyncSessionLocal() as session:
        yield session
