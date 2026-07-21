from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.crud import crud_analytics

router = APIRouter()

# Endpoint para obtener estadísticas del dashboard

@router.get("/summary")
async def get_summary(
    time_range: str = Query("hoy", regex="^(hoy|semana|mes)$"),
    db: AsyncSession = Depends(get_db)
):
    return await crud_analytics.get_dashboard_stats(db, time_range=time_range)

@router.get("/search")
async def quick_search(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db)
):
    """Realiza una búsqueda global rápida en el sistema."""
    return await crud_analytics.global_search(db, query=q)
