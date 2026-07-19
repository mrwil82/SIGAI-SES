import pytest
from decimal import Decimal
from app.crud import crud_business

@pytest.mark.asyncio
class TestClientes:
    async def test_create_cliente(self, test_db, sample_cliente_data):
        from app.schemas.business import ClienteCreate
        cliente_in = ClienteCreate(**sample_cliente_data)
        cliente = await crud_business.create_cliente(test_db, cliente=cliente_in, current_user_id=1)
        assert cliente.id_cliente is not None
        assert cliente.nombre == "Cliente Test"

    async def test_get_clientes(self, test_db, sample_cliente_data):
        from app.schemas.business import ClienteCreate
        cliente_in = ClienteCreate(**sample_cliente_data)
        await crud_business.create_cliente(test_db, cliente=cliente_in, current_user_id=1)
        clientes, total = await crud_business.get_clientes(test_db)
        assert total >= 1

    async def test_update_cliente(self, test_db, sample_cliente_data):
        from app.schemas.business import ClienteCreate, ClienteUpdate
        cliente_in = ClienteCreate(**sample_cliente_data)
        cliente = await crud_business.create_cliente(test_db, cliente=cliente_in, current_user_id=1)
        update_in = ClienteUpdate(nombre="Updated Cliente")
        updated = await crud_business.update_cliente(test_db, id_cliente=cliente.id_cliente, cliente_in=update_in, current_user_id=1)
        assert updated.nombre == "Updated Cliente"

    async def test_delete_cliente_soft(self, test_db, sample_cliente_data):
        from app.schemas.business import ClienteCreate
        cliente_in = ClienteCreate(**sample_cliente_data)
        cliente = await crud_business.create_cliente(test_db, cliente=cliente_in, current_user_id=1)
        deleted = await crud_business.delete_cliente(test_db, id_cliente=cliente.id_cliente, current_user_id=1)
        assert deleted is not None
        assert deleted.deleted_at is not None


@pytest.mark.asyncio
class TestProyectos:
    async def test_create_proyecto(self, test_db, sample_proyecto_data):
        from app.schemas.business import ProyectoCreate
        proy_in = ProyectoCreate(**sample_proyecto_data)
        proy = await crud_business.create_proyecto(test_db, proyecto=proy_in, current_user_id=1)
        assert proy.id_proyecto is not None
        assert proy.nombre_proyecto == "Proyecto Test"


@pytest.mark.asyncio
class TestMovimientos:
    async def test_create_movimiento(self, test_db, sample_item_data):
        from app.schemas.inventory import ItemCreate, MovimientoCreate
        from app.crud import crud_inventory
        item_in = ItemCreate(**sample_item_data)
        item = await crud_inventory.create_item(test_db, item=item_in, current_user_id=1)

        mov_in = MovimientoCreate(
            id_usuario=1,
            id_item=item.id_item,
            tipo_movimiento="ENTRADA_COMPRA",
            cantidad=Decimal("10.0"),
            origen="TEST",
            destino="BODEGA"
        )
        mov = await crud_business.create_movimiento(test_db, mov=mov_in, current_user_id=1)
        assert mov.id_movimiento is not None
        assert mov.tipo_movimiento == "ENTRADA_COMPRA"