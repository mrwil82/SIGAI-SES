import logging
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def evaluate_alerts_job():
    from app.crud.crud_alerts import evaluar_alertas
    db_url = settings.DATABASE_URL
    engine = create_async_engine(db_url, echo=False)
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    try:
        async with async_session() as db:
            await evaluar_alertas(db)
            logger.info("Alertas evaluadas automaticamente por scheduler")
    except Exception as e:
        logger.error(f"Error en scheduler de alertas: {e}", exc_info=True)
    finally:
        await engine.dispose()


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            evaluate_alerts_job,
            trigger=IntervalTrigger(minutes=30),
            id="evaluate_alerts",
            name="Evaluar alertas de stock y garantias",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("APScheduler iniciado correctamente")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler detenido")
