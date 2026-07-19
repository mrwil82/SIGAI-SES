from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
from sqlalchemy.future import select
from app.db.session import get_db
from app.crud import crud_alerts
from app.schemas.alerts import AlertRead, AlertUpdate, AlertEstado
from app.schemas.common import PaginatedResponse
from app.core.pagination import paginate
from app.models import Alert
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[AlertRead])
@router.get("/alerts", response_model=PaginatedResponse[AlertRead])
async def listar_alertas(
    estado: Optional[AlertEstado] = None,
    prioridad: Optional[str] = None,
    tipo: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    current_user = Depends(get_current_user)
):
    query = select(Alert)
    if estado: query = query.where(Alert.estado == estado)
    if prioridad: query = query.where(Alert.prioridad == prioridad)
    if tipo: query = query.where(Alert.tipo == tipo)
    query = query.order_by(Alert.created_at.desc())

    items, total = await paginate(db, query, page=page, page_size=page_size)
    return PaginatedResponse.create(items, total, page, page_size)

@router.get("/summary")
async def get_alerts_summary(db: AsyncSession = Depends(get_db)):
    """Endpoint para el resumen de alertas en el Dashboard."""
    alerts = await crud_alerts.get_all_alerts(db, estado="activa")
    
    stock_alerts = [
        {"id": getattr(a, "id"), "title": getattr(a, "titulo"), "count": getattr(a, "valor_actual")} 
        for a in alerts if getattr(a, "tipo") == "stock_bajo"
    ]
    
    garantia_alerts = [
        {"id": getattr(a, "id"), "title": getattr(a, "titulo")} 
        for a in alerts if getattr(a, "tipo") == "garantia_vencida"
    ]
    
    return {
        "total": len(alerts),
        "stock": stock_alerts,
        "garantias": garantia_alerts
    }

@router.patch("/{id}/estado", response_model=AlertRead)
async def actualizar_estado(
    id: int, 
    body: AlertUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Actualiza el estado de una alerta y registra en auditoría."""
    estado_str = str(body.estado.value) if body.estado else "activa"
    alerta = await crud_alerts.update_alert_status(
        db, 
        alert_id=id, 
        estado=estado_str, 
        notas=body.notas or "", 
        current_user_id=getattr(current_user, "id_usuario", 0),
        valor_actual=body.valor_actual,
        solucion=body.solucion,
        asignado_a=body.asignado_a
    )
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta

@router.delete("/{id}")
async def eliminar_alerta(
    id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Elimina una alerta manualmente."""
    alerta = await crud_alerts.delete_alert(db, alert_id=id, current_user_id=getattr(current_user, "id_usuario", 0))
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return {"message": "Alerta eliminada correctamente"}

@router.post("/", response_model=AlertRead)
async def crear_alerta(
    alerta_in: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Crea una alerta manualmente."""
    return await crud_alerts.create_alert(db, alerta_in=alerta_in, current_user_id=getattr(current_user, "id_usuario", 0))
