import pytest
from decimal import Decimal
from app.crud import crud_inventory

@pytest.mark.asyncio
class TestItemCRUD:
    async def test_create_item(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        item_in = ItemCreate(**sample_item_data)
        item = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)
        assert item.id_item is not None
        assert item.nombre_equipo == "Camara Test"
        assert item.stock_bulk is not None

    async def test_get_items(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        item_in = ItemCreate(**sample_item_data)
        await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        items, total = await crud_inventory.get_items(test_db)
        assert total >= 1
        assert len(items) >= 1

    async def test_get_item_by_id(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        item_in = ItemCreate(**sample_item_data)
        created = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        found = await crud_inventory.get_item_by_id(test_db, item_id=created.id_item)
        assert found is not None
        assert found.id_item == created.id_item

    async def test_update_item(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate, ItemUpdate
        item_in = ItemCreate(**sample_item_data)
        created = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        update_in = ItemUpdate(nombre_equipo="Camara Updated", stock_minimo=5)
        updated = await crud_inventory.update_item(test_db, item_id=created.id_item, item_in=update_in, current_user_id=1)
        assert updated.nombre_equipo == "Camara Updated"

    async def test_delete_item_soft(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        item_in = ItemCreate(**sample_item_data)
        created = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        deleted = await crud_inventory.delete_item(test_db, item_id=created.id_item, current_user_id=1)
        assert deleted is not None
        assert deleted.deleted_at is not None

    async def test_search_items(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate
        item_in = ItemCreate(**sample_item_data)
        await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        items, total = await crud_inventory.get_items(test_db, search="Camara")
        assert total >= 1

    async def test_create_activo(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate, ActivoCreate
        item_in = ItemCreate(**sample_item_data)
        item = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        activo_in = ActivoCreate(id_item=item.id_item, serial="SN-TEST-001")
        activo = await crud_inventory.create_activo(test_db, activo=activo_in, current_user_id=1)
        assert activo.id_activo is not None
        assert activo.serial == "SN-TEST-001"
        assert activo.estado_actual == "DISPONIBLE"