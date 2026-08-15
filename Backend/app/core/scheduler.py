import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def evaluate_alerts_job():
    from app.crud.crud_alerts import evaluar_alertas

    try:
        async with AsyncSessionLocal() as db:
            await evaluar_alertas(db)
            logger.info("Alertas evaluadas automaticamente por scheduler")
    except Exception as e:
        logger.error(f"Error en scheduler de alertas: {e}", exc_info=True)


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
        # Ejecutar evaluación inmediatamente al arrancar
        scheduler.add_job(
            evaluate_alerts_job,
            trigger="date",
            id="evaluate_alerts_startup",
            name="Evaluar alertas al inicio",
            replace_existing=True,
        )


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler detenido")
