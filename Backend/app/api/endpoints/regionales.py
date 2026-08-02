from typing import cast, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.crud import crud_user
from app.schemas.inventory import Regional, RegionalCreate
from app.api.deps import get_current_user
from app.schemas.user import Usuario

router = APIRouter()

@router.get("/", response_model=list[Regional])
async def read_regionales(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener lista de todas las regionales."""
    return await crud_user.get_regionales(db)

@router.post("/", response_model=Regional, status_code=status.HTTP_201_CREATED)
async def create_regional(
    regional_in: RegionalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear una nueva regional."""
    if not regional_in.nombre or not regional_in.nombre.strip():
        raise HTTPException(status_code=422, detail="El nombre de la regional es obligatorio")
    return await crud_user.create_regional(
        db,
        nombre=regional_in.nombre.strip(),
        ciudad=regional_in.ciudad,
    )

@router.put("/{id_regional}", response_model=Regional)
async def update_regional(
    id_regional: int,
    regional_in: RegionalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar una regional existente."""
    if not regional_in.nombre or not regional_in.nombre.strip():
        raise HTTPException(status_code=422, detail="El nombre de la regional es obligatorio")
    regional = await crud_user.update_regional(
        db,
        id_regional=id_regional,
        nombre=regional_in.nombre.strip(),
        ciudad=regional_in.ciudad,
    )
    if not regional:
        raise HTTPException(status_code=404, detail="Regional no encontrada")
    return regional

@router.delete("/{id_regional}")
async def delete_regional(
    id_regional: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar una regional."""
    regional = await crud_user.delete_regional(db, id_regional=id_regional)
    if not regional:
        raise HTTPException(status_code=404, detail="Regional no encontrada")
    return {"message": "Regional eliminada"}
