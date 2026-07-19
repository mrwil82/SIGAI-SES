import pytest
from decimal import Decimal
from app.crud import crud_deliveries, crud_inventory, crud_user

@pytest.mark.asyncio
class TestActas:
    async def test_create_acta(self, test_db, sample_user_data, sample_item_data):
        from app.schemas.user import UsuarioCreate
        from app.schemas.inventory import ItemCreate
        from app.schemas.deliveries import ActaEntregaCreate, DetalleActaCreate

        user_in = UsuarioCreate(**sample_user_data)
        user = await crud_user.create_user(test_db, user=user_in, current_user_id=0)

        item_in = ItemCreate(**sample_item_data)
        item = await crud_inventory.create_item(test_db, item=item_in, current_user_id=user.id_usuario)

        detalle = DetalleActaCreate(id_item=item.id_item, cantidad=Decimal("2.0"))
        acta_in = ActaEntregaCreate(
            id_usuario_tecnico=user.id_usuario,
            id_usuario_representante=user.id_usuario,
            tipo_acta="ENTREGA_HERRAMIENTA",
            estado_acta="BORRADOR",
            detalles=[detalle]
        )
        acta = await crud_deliveries.create_acta(test_db, acta_in=acta_in, current_user_id=user.id_usuario)
        assert acta.id_acta is not None
        assert acta.numero_acta is not None
        assert len(acta.detalles) >= 1

    async def test_get_actas(self, test_db, sample_user_data, sample_item_data):
        from app.schemas.user import UsuarioCreate
        from app.schemas.inventory import ItemCreate
        from app.schemas.deliveries import ActaEntregaCreate, DetalleActaCreate

        user_in = UsuarioCreate(**sample_user_data)
        user = await crud_user.create_user(test_db, user=user_in, current_user_id=0)

        item_in = ItemCreate(**sample_item_data)
        item = await crud_inventory.create_item(test_db, item=item_in, current_user_id=user.id_usuario)

        detalle = DetalleActaCreate(id_item=item.id_item, cantidad=Decimal("1.0"))
        acta_in = ActaEntregaCreate(
            id_usuario_tecnico=user.id_usuario,
            id_usuario_representante=user.id_usuario,
            tipo_acta="DEVOLUCION",
            detalles=[detalle]
        )
        await crud_deliveries.create_acta(test_db, acta_in=acta_in, current_user_id=user.id_usuario)

        actas = await crud_deliveries.get_actas(test_db)
        assert len(actas) >= 1