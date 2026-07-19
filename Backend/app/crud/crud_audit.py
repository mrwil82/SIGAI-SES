from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog
import json
from datetime import datetime, date
from decimal import Decimal
from typing import Any, Optional, Dict
from app.core.logger import get_logger

logger = get_logger(__name__)

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

async def create_audit_log(
    db: AsyncSession, 
    id_usuario: int, 
    tabla: str, 
    accion: str, 
    id_reg: Optional[Any] = None, 
    anterior: Optional[Dict[str, Any]] = None, 
    nuevo: Optional[Dict[str, Any]] = None
):
    log = AuditLog(
        id_usuario=id_usuario,
        tabla_afectada=tabla,
        accion=accion,
        id_registro=id_reg,
        valor_anterior=json.dumps(anterior, cls=DateTimeEncoder) if anterior else None,
        valor_nuevo=json.dumps(nuevo, cls=DateTimeEncoder) if nuevo else None
    )
    db.add(log)
    await db.commit()

async def log_action(
    db: AsyncSession, 
    id_usuario: int, 
    tabla: str, 
    accion: str, 
    id_reg: Optional[Any] = None, 
    v_anterior: Optional[Dict[str, Any]] = None, 
    v_nuevo: Optional[Dict[str, Any]] = None
):
# Mantenido por compatibilidad 
    await create_audit_log(db, id_usuario, tabla, accion, id_reg, v_anterior, v_nuevo)
