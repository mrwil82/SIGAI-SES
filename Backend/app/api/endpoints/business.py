from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.crud import crud_business, crud_deliveries
from app.utils.reports import generate_pdf_acta
from app.schemas import (
    Cliente, ClienteCreate, ClienteUpdate,
    Proyecto, ProyectoCreate, ProyectoUpdate,
    Proveedor, ProveedorCreate, ProveedorUpdate,
    Movimiento, MovimientoCreate,
    Garantia, GarantiaCreate, GarantiaUpdate,
    ActaEntrega, ActaEntregaCreate
)
from app.schemas.common import PaginatedResponse
from app.core.pagination import paginate
from app.api.deps import get_current_user

router = APIRouter()

# ACTAS

@router.post("/actas", response_model=ActaEntrega)
async def save_acta(
    acta_in: ActaEntregaCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_deliveries.create_acta(db, acta_in=acta_in, current_user_id=current_user.id_usuario)

@router.get("/actas", response_model=PaginatedResponse[ActaEntrega])
async def list_actas(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    current_user = Depends(get_current_user)
):
    from app.models.deliveries import ActaEntrega as ActaModel
    query = select(ActaModel).options(selectinload(ActaModel.detalles)).order_by(ActaModel.id_acta.desc())
    items, total = await paginate(db, query, page=page, page_size=page_size)
    return PaginatedResponse.create(items, total, page, page_size)

@router.delete("/actas/{id_acta}")
async def delete_acta(
    id_acta: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    acta = await crud_deliveries.delete_acta(db, acta_id=id_acta, current_user_id=current_user.id_usuario)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    return {"message": "Acta eliminada correctamente"}

# CLIENTES

@router.post("/clientes", response_model=Cliente)
async def create_cliente(
    cliente_in: ClienteCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_business.create_cliente(db, cliente=cliente_in, current_user_id=current_user.id_usuario)

@router.get("/clientes", response_model=PaginatedResponse[Cliente])
async def read_clientes(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    clientes, total = await crud_business.get_clientes(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(clientes, total, page, page_size)

@router.get("/clientes/{id_cliente}", response_model=Cliente)
async def read_cliente(
    id_cliente: int,
    db: AsyncSession = Depends(get_db),
):
    cliente = await crud_business.get_cliente_by_id(db, id_cliente=id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.put("/clientes/{id_cliente}", response_model=Cliente)
async def update_cliente(
    id_cliente: int, 
    cliente_in: ClienteUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cliente = await crud_business.update_cliente(db, id_cliente=id_cliente, cliente_in=cliente_in, current_user_id=current_user.id_usuario)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.delete("/clientes/{id_cliente}")
async def delete_cliente(
    id_cliente: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cliente = await crud_business.delete_cliente(db, id_cliente=id_cliente, current_user_id=current_user.id_usuario)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado"}

# PROYECTOS

@router.post("/proyectos", response_model=Proyecto)
async def create_proyecto(
    proyecto_in: ProyectoCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_business.create_proyecto(db, proyecto=proyecto_in, current_user_id=current_user.id_usuario)

@router.get("/proyectos", response_model=PaginatedResponse[Proyecto])
async def read_proyectos(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    proyectos, total = await crud_business.get_proyectos(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(proyectos, total, page, page_size)

@router.get("/proyectos/{id_proyecto}", response_model=Proyecto)
async def read_proyecto(
    id_proyecto: int,
    db: AsyncSession = Depends(get_db),
):
    proyecto = await crud_business.get_proyecto_by_id(db, id_proyecto=id_proyecto)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto

@router.put("/proyectos/{id_proyecto}", response_model=Proyecto)
async def update_proyecto(
    id_proyecto: int, 
    proyecto_in: ProyectoUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    proyecto = await crud_business.update_proyecto(db, id_proyecto=id_proyecto, proyecto_in=proyecto_in, current_user_id=current_user.id_usuario)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto

@router.delete("/proyectos/{id_proyecto}")
async def delete_proyecto(
    id_proyecto: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    proyecto = await crud_business.delete_proyecto(db, id_proyecto=id_proyecto, current_user_id=current_user.id_usuario)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return {"message": "Proyecto eliminado"}

# PROVEEDORES

@router.post("/proveedores", response_model=Proveedor)
async def create_proveedor(
    prov_in: ProveedorCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_business.create_proveedor(db, proveedor=prov_in, current_user_id=current_user.id_usuario)

@router.get("/proveedores", response_model=PaginatedResponse[Proveedor])
async def read_proveedores(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    proveedores, total = await crud_business.get_proveedores(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(proveedores, total, page, page_size)

@router.put("/proveedores/{id_proveedor}", response_model=Proveedor)
async def update_proveedor(
    id_proveedor: int, 
    prov_in: ProveedorUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    proveedor = await crud_business.update_proveedor(db, id_proveedor=id_proveedor, proveedor_in=prov_in, current_user_id=current_user.id_usuario)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor

@router.delete("/proveedores/{id_proveedor}")
async def delete_proveedor(
    id_proveedor: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    proveedor = await crud_business.delete_proveedor(db, id_proveedor=id_proveedor, current_user_id=current_user.id_usuario)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return {"message": "Proveedor eliminado"}


#  MOVIMIENTOS

@router.post("/movimientos", response_model=Movimiento)
async def create_movimiento(
    mov_in: MovimientoCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_business.create_movimiento(db, mov=mov_in, current_user_id=current_user.id_usuario)

@router.get("/movimientos", response_model=PaginatedResponse[Movimiento])
async def read_movimientos(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    movimientos, total = await crud_business.get_movimientos(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(movimientos, total, page, page_size)

#  GARANTÍAS 

@router.post("/garantias", response_model=Garantia)
async def create_garantia(
    gar_in: GarantiaCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_business.create_garantia(db, garantia=gar_in, current_user_id=current_user.id_usuario)

@router.get("/garantias", response_model=PaginatedResponse[Garantia])
async def read_garantias(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    garantias, total = await crud_business.get_garantias(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(garantias, total, page, page_size)

@router.get("/garantias/{id_garantia}", response_model=Garantia)
async def read_garantia(
    id_garantia: int,
    db: AsyncSession = Depends(get_db),
):
    garantia = await crud_business.get_garantia_by_id(db, id_garantia=id_garantia)
    if not garantia:
        raise HTTPException(status_code=404, detail="Garantía no encontrada")
    return garantia

@router.put("/garantias/{id_garantia}", response_model=Garantia)
async def update_garantia(
    id_garantia: int, 
    gar_in: GarantiaUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    garantia = await crud_business.update_garantia(db, id_garantia=id_garantia, obj_in=gar_in, current_user_id=current_user.id_usuario)
    if not garantia:
        raise HTTPException(status_code=404, detail="Garantía no encontrada")
    return garantia

@router.delete("/garantias/{id_garantia}")
async def delete_garantia(
    id_garantia: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    garantia = await crud_business.delete_garantia(db, id_garantia=id_garantia, current_user_id=current_user.id_usuario)
    if not garantia:
        raise HTTPException(status_code=404, detail="Garantía no encontrada")
    return {"message": "Garantía eliminada"}

# ACTAS Y REPORTES 

@router.post("/actas/generate")
async def generate_acta(data: dict, current_user = Depends(get_current_user)):
    if not data.get('nombre_representante'):
        data['nombre_representante'] = current_user.nombre
    if not data.get('cedula_representante') and getattr(current_user, 'cedula', None):
        data['cedula_representante'] = current_user.cedula
    if not data.get('codigo_representante') and getattr(current_user, 'codigo_empleado', None):
        data['codigo_representante'] = current_user.codigo_empleado

    pdf_buffer = generate_pdf_acta(data)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=acta_entrega.pdf"}
    )


@router.post("/actas/{id_acta}/generate")
async def generate_acta_by_id(
    id_acta: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    acta = await crud_deliveries.get_acta_by_id(db, acta_id=id_acta)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")

    # Construir los datos del pdf a partir del acta
    
    tecnico = getattr(acta, 'tecnico', None)
    proyecto = getattr(acta, 'proyecto', None)

    items = []
    for d in getattr(acta, 'detalles', []) or []:
        item = getattr(d, 'item', None)
        activo = getattr(d, 'activo', None)
        items.append({
            'descripcion': getattr(item, 'nombre_equipo', '') or '',
            'marca': getattr(item, 'marca', '') or '',
            'referencia': getattr(activo, 'referencia', None) or getattr(item, 'referencia', '') or '',
            'serie': getattr(activo, 'serial', None) or '',
            'cantidad': float(getattr(d, 'cantidad', 1) or 1),
            'observaciones': getattr(d, 'notas_estado', '') or '',
        })

    data = {
        'id_acta': acta.id_acta,
        'numero_acta': acta.numero_acta,
        'tipo_acta': acta.tipo_acta,
        'estado_acta': acta.estado_acta,
        'observaciones': acta.observaciones,
        'nombre_tecnico': getattr(tecnico, 'nombre', '') or '',
        'cedula': getattr(tecnico, 'cedula', '') or '',
        'codigo': getattr(tecnico, 'codigo_empleado', '') or '',
        'fecha': getattr(acta, 'fecha_entrega', None).strftime("%d/%m/%Y") if getattr(acta, 'fecha_entrega', None) else datetime.now().strftime("%d/%m/%Y"),
        'regional': getattr(tecnico, 'regional', 'BOGOTÁ').upper(),
        'items': items,
        'observaciones_generales': getattr(acta, 'observaciones', '') or '',
    }

    # Completar los datos de representante
    rep = getattr(acta, 'representante', None)
    if rep:
        data['nombre_representante'] = rep.nombre
        data['cedula_representante'] = getattr(rep, 'cedula', '') or ''
        data['codigo_representante'] = getattr(rep, 'codigo_empleado', '') or acta.numero_acta
    else:
        data['nombre_representante'] = getattr(current_user, 'nombre', '')
        if getattr(current_user, 'cedula', None):
            data['cedula_representante'] = current_user.cedula
        if getattr(current_user, 'codigo_empleado', None):
            data['codigo_representante'] = current_user.codigo_empleado

    pdf_buffer = generate_pdf_acta(data)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=acta_{acta.id_acta}.pdf"}
    )


@router.post("/actas/{id_acta}/downloaded")
async def acta_mark_downloaded(
    id_acta: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    acta = await crud_deliveries.mark_acta_downloaded(db, acta_id=id_acta, current_user_id=current_user.id_usuario)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    return {"message": "Registro de descarga creado"}


@router.get("/actas/{id_acta}", response_model=ActaEntrega)
async def get_acta(
    id_acta: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    acta = await crud_deliveries.get_acta_by_id(db, acta_id=id_acta)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    return acta


@router.put("/actas/{id_acta}", response_model=ActaEntrega)
async def update_acta_endpoint(
    id_acta: int,
    acta_in: ActaEntregaCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    acta = await crud_deliveries.update_acta(db, acta_id=id_acta, acta_in=acta_in, current_user_id=current_user.id_usuario)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    return acta
