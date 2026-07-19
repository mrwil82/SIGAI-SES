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
