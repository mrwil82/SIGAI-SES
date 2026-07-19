import pytest
from sqlalchemy import select
from app.core.pagination import paginate
from app.models import Item

@pytest.mark.asyncio
class TestPagination:
    async def test_paginate_empty(self, test_db):
        query = select(Item)
        items, total = await paginate(test_db, query, page=1, page_size=10)
        assert total == 0
        assert len(items) == 0

    async def test_paginate_basic(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        from app.crud import crud_inventory

        item_in = ItemCreate(**sample_item_data)
        await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        query = select(Item)
        items, total = await paginate(test_db, query, page=1, page_size=10)
        assert total >= 1
        assert len(items) >= 1

    async def test_paginate_page_size(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        from app.crud import crud_inventory

        for i in range(5):
            data = sample_item_data.copy()
            data["referencia"] = f"REF-{i:03d}"
            data["codigo_item_interno"] = f"COD-{i:03d}"
            data["nombre_equipo"] = f"Item {i}"
            item_in = ItemCreate(**data)
            await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        query = select(Item).order_by(Item.id_item)
        items, total = await paginate(test_db, query, page=1, page_size=2)
        assert total == 5
        assert len(items) == 2