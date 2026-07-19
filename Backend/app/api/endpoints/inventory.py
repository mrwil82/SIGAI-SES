from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.session import get_db
from app.crud import crud_inventory
from app.schemas.inventory import (
    Item, ItemCreate, ItemUpdate,
    Activo, ActivoCreate, ActivoUpdate,
    EPPAssignacion, EPPAssignacionCreate, HistorialUbicacion,
    DesmonteBulkCreate
)
from app.schemas.common import PaginatedResponse
from app.core.pagination import paginate
from app.api.deps import get_current_user, require_roles

router = APIRouter()

#  EPP 
@router.post("/epp", response_model=EPPAssignacion)
async def assign_epp(
    epp_in: EPPAssignacionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN","TECNICO","TECNICO_LABORATORIO"))
):
    return await crud_inventory.create_epp_assignment(db, epp_in=epp_in)

@router.get("/epp", response_model=List[EPPAssignacion])
async def list_epp(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_inventory.get_epp_assignments(db)

# HISTORIAL UBICACIONES 

@router.get("/activos/{id_activo}/historial", response_model=List[HistorialUbicacion])
async def get_activo_historial(
    id_activo: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await crud_inventory.get_activo_historial(db, id_activo=id_activo)

# ITEMS

@router.get("/items", response_model=PaginatedResponse[Item])
async def read_items(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    all_results: bool = False,
    include_deleted: bool = False,
):
    items, total = await crud_inventory.get_items(
        db,
        skip=0 if all_results else (page - 1) * page_size,
        limit=1000 if all_results else page_size,
        search=search,
        include_deleted=include_deleted,
    )
    effective_page_size = max(1, page_size if not all_results else total)
    return PaginatedResponse.create(items, total, page, effective_page_size)

@router.post("/items/desmonte-bulk")
async def register_desmonte_bulk(
    desmonte_in: DesmonteBulkCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN","TECNICO","TECNICO_LABORATORIO"))
):
    try:
        items_data = [item.model_dump() for item in desmonte_in.items]
        return await crud_inventory.crear_desmonte_bulk(
            db, 
            items_data=items_data,
            proyecto_id=desmonte_in.id_proyecto, 
            cliente_id=desmonte_in.id_cliente,
            current_user_id=current_user.id_usuario
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{id_item}", response_model=Item)
async def read_item(id_item: int, db: AsyncSession = Depends(get_db)):
    item = await crud_inventory.get_item_by_id(db, item_id=id_item)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item

@router.post("/items", response_model=Item)
async def create_item(
    item_in: ItemCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN","TECNICO","TECNICO_LABORATORIO"))
):
    try:
        return await crud_inventory.create_item(db, item=item_in, current_user_id=current_user.id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/items/{id_item}", response_model=Item)
async def update_item(
    id_item: int, 
    item_in: ItemUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    try:
        item = await crud_inventory.update_item(db, item_id=id_item, item_in=item_in, current_user_id=current_user.id_usuario)
        if not item:
            raise HTTPException(status_code=404, detail="Item no encontrado")
        return item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ACTIVOS

@router.get("/ubicaciones")
async def list_ubicaciones():
    return [
        {"id": "BODEGA_PRINCIPAL", "nombre": "Bodega Principal"},
        {"id": "BODEGA_SECUNDARIA", "nombre": "Bodega Secundaria"},
        {"id": "LABORATORIO", "nombre": "Laboratorio"},
        {"id": "ESTANTE_A1", "nombre": "Estante A1"},
        {"id": "ESTANTE_A2", "nombre": "Estante A2"},
        {"id": "ESTANTE_B1", "nombre": "Estante B1"},
        {"id": "ESTANTE_B2", "nombre": "Estante B2"},
        {"id": "ESTANTE_C1", "nombre": "Estante C1"},
        {"id": "ESTANTE_C2", "nombre": "Estante C2"},
        {"id": "CUARTO_SEGURO", "nombre": "Cuarto Seguro"},
        {"id": "VEHICULO_TECNICO", "nombre": "Vehículo Técnico"},
        {"id": "SITIO_CLIENTE", "nombre": "Sitio Cliente"},
        {"id": "PROVEEDOR", "nombre": "Proveedor (Garantía)"},
    ]

@router.get("/activos", response_model=PaginatedResponse[Activo])
async def read_activos(
    estado: str | None = None,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(500, ge=1, le=10000),
):
    if estado:
        activos, total = await crud_inventory.get_activos_by_estado(db, estado=estado, skip=(page - 1) * page_size, limit=page_size)
    else:
        activos, total = await crud_inventory.get_activos(db, skip=(page - 1) * page_size, limit=page_size)
    return PaginatedResponse.create(activos, total, page, page_size)

@router.patch("/activos/{id_activo}/triaje", response_model=Activo)
async def update_activo_triaje(
    id_activo: int,
    triaje_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN","TECNICO","TECNICO_LABORATORIO"))
):
    try:
        activo = await crud_inventory.update_activo_triaje(db, id_activo=id_activo, triaje_data=triaje_in, current_user_id=current_user.id_usuario)
        if not activo:
            raise HTTPException(status_code=404, detail="Activo no encontrado")
        return activo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/activos/{serial}", response_model=Activo)
async def read_activo_by_serial(serial: str, db: AsyncSession = Depends(get_db)):
    activo = await crud_inventory.get_activo_by_serial(db, serial=serial)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return activo

@router.post("/activos", response_model=Activo)
async def create_activo(
    activo_in: ActivoCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN","TECNICO","TECNICO_LABORATORIO"))
):
    try:
        return await crud_inventory.create_activo(db, activo=activo_in, current_user_id=current_user.id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/activos/{id_activo}", response_model=Activo)
async def update_activo(
    id_activo: int, 
    activo_in: ActivoUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    try:
        activo = await crud_inventory.update_activo(db, activo_id=id_activo, activo_in=activo_in, current_user_id=current_user.id_usuario)
        if not activo:
            raise HTTPException(status_code=404, detail="Activo no encontrado")
        return activo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/items/{id_item}")
async def delete_item(
    id_item: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    item = await crud_inventory.delete_item(db, item_id=id_item, current_user_id=current_user.id_usuario)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"message": "Item eliminado correctamente"}


# Eliminar activo (solo si no tiene garantías asociadas)

@router.delete("/activos/{id_activo}")
async def delete_activo(
    id_activo: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    activo = await crud_inventory.delete_activo(db, activo_id=id_activo, current_user_id=current_user.id_usuario)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return {"message": "Activo eliminado correctamente"}
