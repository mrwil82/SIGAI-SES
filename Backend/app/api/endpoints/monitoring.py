"""
Endpoints de monitoreo y salud del sistema.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db
import psutil
import os
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Verificacion basica de salud del servicio."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/health/db")
async def health_check_db(db: AsyncSession = Depends(get_db)):
    """Verificacion de conectividad con la base de datos."""
    try:
        result = await db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }


@router.get("/metrics")
async def get_metrics():
    """Metricas basicas del sistema."""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    cpu_percent = process.cpu_percent(interval=0.1)

    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "system": {
            "cpu_percent": cpu_percent,
            "memory_rss_mb": round(memory_info.rss / 1024 / 1024, 2),
            "memory_vms_mb": round(memory_info.vms / 1024 / 1024, 2),
            "pid": os.getpid(),
        },
        "process": {
            "num_threads": process.num_threads(),
            "create_time": datetime.fromtimestamp(process.create_time()).isoformat(),
        },
    }
