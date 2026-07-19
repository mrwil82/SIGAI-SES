from typing import List, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.sql import Select

async def paginate(
    db: AsyncSession,
    query: Select,
    page: int = 1,
    page_size: int = 50,
    max_page_size: int = 500,
) -> Tuple[List[Any], int]:
    page = max(1, page)
    page_size = min(max(1, page_size), max_page_size)
    offset = (page - 1) * page_size

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(offset).limit(page_size))
    return result.scalars().all(), total