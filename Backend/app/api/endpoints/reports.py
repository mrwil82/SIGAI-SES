from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload, contains_eager
from typing import List, Dict, Any, AsyncGenerator, Iterable
from datetime import datetime
from io import BytesIO

from app.db.session import get_db
from app.api.deps import get_current_user
from app.utils.reports import export_to_excel, export_to_pdf, stream_excel_large

router = APIRouter()

# Mapeo de columnas para reportes profesionales
COLUMN_MAPS = {
    "inventory": {
        "codigo_item_interno": "Código", "nombre_equipo": "Equipo", "marca": "Marca", "categoria": "Categoría", "referencia": "Referencia", "stock": "Stock", "unidad_medida": "U.Medida", "stock_minimo": "Stock Mín.", "costo_unitario": "Costo Unit.", "moneda": "Moneda"
    },
    "alerts": {
        "id": "ID", "titulo": "Título", "tipo": "Tipo", "prioridad": "Prioridad", "estado": "Estado", "created_at": "Fecha Detección"
    },
    "clientes": {
        "id_cliente": "ID", "nombre": "Nombre", "nit": "NIT", "ciudad": "Ciudad"
    },
    "users": {
        "id_usuario": "ID", "nombre": "Nombre", "email": "Email", "rol": "Rol"
    },
    "guarantees": {
        "id_garantia": "ID", "numero_caso_interno": "Caso", "estado_proceso": "Estado", "fecha_ingreso": "Fecha Ingreso", "dias_en_proceso": "Días"
    },
    "projects": {
        "id_proyecto": "ID", "nombre_proyecto": "Proyecto", "cliente": "Cliente", "ubicacion": "Ubicación", "centro_costos": "C.Costo", "estado": "Estado", "fecha_inicio": "Inicio", "fecha_fin_estimada": "Fin Est."
    },
    "desmontes": {
        "id_activo": "ID", "serial": "Serial", "nombre_equipo": "Equipo", "marca": "Marca", "referencia": "Referencia", "calificacion_tecnica": "Calificación", "fecha_triaje": "Fecha Triaje", "observaciones": "Observaciones"
    },
    "audit": {
        "id_log": "ID", "usuario": "Usuario", "tabla_afectada": "Tabla", "accion": "Acción", "id_registro": "ID Registro", "fecha_accion": "Fecha"
    },
    "actas": {
        "id_acta": "ID", "numero_acta": "N° Acta", "tipo_acta": "Tipo", "estado_acta": "Estado", "fecha_entrega": "Fecha", "tecnico": "Técnico", "representante": "Representante", "proyecto": "Proyecto"
    }
}

async def get_data_generator(module: str, db: AsyncSession, mapping: Dict[str, str]) -> AsyncGenerator[Dict[str, Any], None]:
    """Generador asíncrono para obtener datos de la DB por lotes (Chunks)."""
    CHUNK_SIZE = 1000
    
    if module == "inventory":
        from app.models.inventory import Item, StockBulk
        stmt = (
            select(Item)
            .outerjoin(StockBulk)
            .options(contains_eager(Item.stock_bulk))
            .execution_options(yield_per=CHUNK_SIZE)
        )
        result = await db.stream(stmt)
        async for row in result:
            item = row[0]
            stock = float(item.stock_bulk.cantidad_actual) if item.stock_bulk else 0
            d = {
                "codigo_item_interno": item.codigo_item_interno or "",
                "nombre_equipo": item.nombre_equipo,
                "marca": item.marca or "",
                "categoria": str(item.categoria) if item.categoria else "",
                "referencia": item.referencia or "",
                "stock": stock,
                "unidad_medida": item.unidad_medida or "UND",
                "stock_minimo": item.stock_minimo or 0,
                "costo_unitario": float(item.costo_unitario) if item.costo_unitario else 0,
                "moneda": str(item.moneda) if item.moneda else "COP",
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "alerts":
        from app.models.alerts import Alert
        stmt = select(Alert).order_by(Alert.created_at.desc()).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            al = row[0]
            d = {
                "id": al.id,
                "titulo": al.titulo,
                "tipo": al.tipo,
                "prioridad": al.prioridad,
                "estado": al.estado,
                "created_at": al.created_at.strftime("%Y-%m-%d %H:%M") if al.created_at else ""
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}
            
    elif module == "guarantees":
        from app.models.guarantees import Garantia
        stmt = select(Garantia).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            g = row[0]
            d = {
                "id_garantia": g.id_garantia,
                "numero_caso_interno": g.numero_caso_interno,
                "estado_proceso": g.estado_proceso,
                "fecha_ingreso": g.fecha_ingreso.strftime("%Y-%m-%d") if g.fecha_ingreso else "",
                "dias_en_proceso": (datetime.now().date() - g.fecha_ingreso).days if g.fecha_ingreso else 0
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "projects":
        from app.models.business import Proyecto
        stmt = select(Proyecto).options(joinedload(Proyecto.cliente)).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            p = row[0]
            d = {
                "id_proyecto": p.id_proyecto,
                "nombre_proyecto": p.nombre_proyecto,
                "cliente": p.cliente.nombre if p.cliente else "N/A",
                "ubicacion": p.ubicacion or "",
                "centro_costos": p.centro_costos or "",
                "estado": p.estado,
                "fecha_inicio": p.fecha_inicio.strftime("%Y-%m-%d") if p.fecha_inicio else "",
                "fecha_fin_estimada": p.fecha_fin_estimada.strftime("%Y-%m-%d") if p.fecha_fin_estimada else ""
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "desmontes":
        from app.models.inventory import Activo
        stmt = select(Activo).options(joinedload(Activo.item)).where(Activo.estado_actual == "LABORATORIO").execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            a = row[0]
            d = {
                "id_activo": a.id_activo,
                "serial": a.serial,
                "nombre_equipo": a.item.nombre_equipo if a.item else "N/A",
                "marca": a.item.marca if a.item else "N/A",
                "referencia": a.item.referencia if a.item else "N/A",
                "calificacion_tecnica": a.calificacion_tecnica or "",
                "fecha_triaje": a.fecha_triaje.strftime("%Y-%m-%d") if a.fecha_triaje else "",
                "observaciones": a.observaciones or ""
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "audit":
        from app.models.audit import AuditLog
        stmt = select(AuditLog).options(joinedload(AuditLog.usuario)).order_by(AuditLog.fecha_accion.desc()).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            al = row[0]
            d = {
                "id_log": al.id_log,
                "usuario": al.usuario.nombre if al.usuario else "SISTEMA",
                "tabla_afectada": al.tabla_afectada,
                "accion": al.accion,
                "id_registro": al.id_registro,
                "fecha_accion": al.fecha_accion.strftime("%Y-%m-%d %H:%M") if al.fecha_accion else ""
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "clientes":
        from app.models.business import Cliente
        stmt = select(Cliente).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            c = row[0]
            d = {
                "id_cliente": c.id_cliente,
                "nombre": c.nombre,
                "nit": c.nit or "",
                "ciudad": c.ciudad or "",
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "users":
        from app.models.user import Usuario
        stmt = select(Usuario).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            u = row[0]
            d = {
                "id_usuario": u.id_usuario,
                "nombre": u.nombre,
                "email": u.email,
                "rol": u.rol.value if u.rol else "",
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

    elif module == "actas":
        from app.models.deliveries import ActaEntrega
        stmt = select(ActaEntrega).options(
            joinedload(ActaEntrega.tecnico),
            joinedload(ActaEntrega.representante),
            joinedload(ActaEntrega.proyecto)
        ).order_by(ActaEntrega.fecha_entrega.desc()).execution_options(yield_per=CHUNK_SIZE)
        result = await db.stream(stmt)
        async for row in result:
            ae = row[0]
            d = {
                "id_acta": ae.id_acta,
                "numero_acta": ae.numero_acta or "",
                "tipo_acta": ae.tipo_acta,
                "estado_acta": ae.estado_acta,
                "fecha_entrega": ae.fecha_entrega.strftime("%Y-%m-%d %H:%M") if ae.fecha_entrega else "",
                "tecnico": ae.tecnico.nombre if ae.tecnico else "",
                "representante": ae.representante.nombre if ae.representante else "",
                "proyecto": ae.proyecto.nombre_proyecto if ae.proyecto else ""
            }
            yield {mapping.get(k, k): v for k, v in d.items() if k in mapping}

@router.get("/export/{module}")
async def export_module_data(
    module: str,
    format: str = Query("excel", pattern="^(pdf|excel)$"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    filename = f"{module}_reporte_{datetime.now().strftime('%Y%m%d')}"
    mapping = COLUMN_MAPS.get(module, {})
    columns = list(mapping.values()) if mapping else []

    meta = {
        "fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "generado_por": getattr(current_user, "nombre", "SISTEMA"),
        "cargo": getattr(current_user, 'cargo', 'Usuario')
    }

    try:
        data_to_export = []
        async for item in get_data_generator(module, db, mapping):
            data_to_export.append(item)

        if not columns and data_to_export:
            columns = list(data_to_export[0].keys())

        if format == "excel":
            output_content = stream_excel_large(data_to_export, module, meta, columns)
            return StreamingResponse(
                BytesIO(output_content),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"}
            )
        else:
            output = export_to_pdf(data_to_export, module, meta=meta)
            return StreamingResponse(
                output,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}.pdf"}
            )
    except Exception as e:
        detail = f"Error generando {format.upper()}: {str(e)}"
        raise HTTPException(status_code=500, detail=detail)

    raise HTTPException(status_code=400, detail="Formato no soportado")
