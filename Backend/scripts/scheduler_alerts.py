"""
Script para evaluar alertas programadas.
Se puede ejecutar como cron job o tarea programada.

Uso:
  python -m scripts.scheduler_alerts

Cron (Linux/Mac):
  */30 * * * * cd /app && python -m scripts.scheduler_alerts >> /var/log/sigai-alerts.log 2>&1

Windows Task Scheduler:
  schtasks /create /tn "SIGAI-Alerts" /tr "python -m scripts.scheduler_alerts" /sc minute /mo 30
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cargar .env desde Backend/
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.crud.crud_alerts import evaluar_alertas

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/alerts.log", mode="a"),
    ],
)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/postgres"
)


async def run_alerts():
    os.makedirs("logs", exist_ok=True)
    logger.info(f"Inicio de evaluacion de alertas: {datetime.now().isoformat()}")

    engine = create_async_engine(DATABASE_URL, echo=False, connect_args={"ssl": "require"})
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with async_session() as db:
            await evaluar_alertas(db)
            logger.info("Evaluacion de alertas completada exitosamente.")
    except Exception as e:
        logger.error(f"Error durante la evaluacion de alertas: {e}", exc_info=True)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_alerts())
