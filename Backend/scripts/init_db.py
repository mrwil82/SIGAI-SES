"""
Script de inicializacion de la base de datos.
Crea todas las tablas y el usuario administrador inicial.

Uso:
  python -m scripts.init_db

Se ejecuta automaticamente al iniciar la aplicacion por primera vez.
"""

import asyncio
import os
import sys
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, text
from app.models import Base
from app.models.user import Usuario, UserRole
from app.core.security import get_password_hash

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+aiomysql://sigai:sigai_password@localhost:3306/sigai_ses"
)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@securitas.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Administrador SIGAI")
ADMIN_CEDULA = os.getenv("ADMIN_CEDULA", "0000000000")
ADMIN_CODIGO = os.getenv("ADMIN_CODIGO", "ADM001")


async def wait_for_db(engine, max_retries=30, retry_interval=2):
    """Espera a que la base de datos este disponible."""
    for attempt in range(max_retries):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Base de datos conectada exitosamente.")
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(
                    f"Base de datos no disponible (intento {attempt + 1}/{max_retries}): {e}"
                )
                await asyncio.sleep(retry_interval)
            else:
                logger.error("No se pudo conectar a la base de datos despues de varios intentos.")
                return False
    return False


async def create_tables(engine):
    """Crea todas las tablas definidas en los modelos."""
    logger.info("Creando tablas en la base de datos...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Tablas creadas exitosamente.")


async def seed_admin(db_session):
    """Crea el usuario administrador inicial si no existe."""
    result = await db_session.execute(
        select(Usuario).filter(Usuario.email == ADMIN_EMAIL)
    )
    existing = result.scalars().first()

    if existing:
        logger.info(f"Usuario admin ya existe: {ADMIN_EMAIL}")
        return

    admin_user = Usuario(
        nombre=ADMIN_NAME,
        email=ADMIN_EMAIL,
        password_hash=get_password_hash(ADMIN_PASSWORD),
        rol=UserRole.ADMIN,
        cedula=ADMIN_CEDULA,
        codigo_empleado=ADMIN_CODIGO,
        regional="Nacional",
        is_active=True,
    )
    db_session.add(admin_user)
    await db_session.commit()
    await db_session.refresh(admin_user)

    logger.info(f"Usuario admin creado: {ADMIN_EMAIL} (ID: {admin_user.id_usuario})")


async def init_database():
    """Inicializacion completa de la base de datos."""
    logger.info("=" * 60)
    logger.info("SIGAI-SES - Inicializacion de Base de Datos")
    logger.info("=" * 60)

    engine = create_async_engine(DATABASE_URL, echo=False)

    try:
        if not await wait_for_db(engine):
            logger.error("No se pudo conectar a la base de datos. Abortando.")
            return False

        await create_tables(engine)

        async_session = async_sessionmaker(
            bind=engine, class_=AsyncSession, expire_on_commit=False
        )
        async with async_session() as db:
            await seed_admin(db)

        logger.info("=" * 60)
        logger.info("Inicializacion completada exitosamente.")
        logger.info("=" * 60)
        return True

    except Exception as e:
        logger.error(f"Error durante la inicializacion: {e}", exc_info=True)
        return False
    finally:
        await engine.dispose()


if __name__ == "__main__":
    success = asyncio.run(init_database())
    sys.exit(0 if success else 1)
