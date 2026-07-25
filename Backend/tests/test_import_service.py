import pytest
from app.db.session import Base
from app.services.import_service import import_service
from app.models.inventory import Item
from sqlalchemy.future import select

@pytest.mark.asyncio
async def test_upsert_item_and_stock(test_db):
    db = test_db
    # Probar creación de item
    item = await import_service._upsert_item_and_stock(
        db=db, nombre="Equipo Prueba", referencia="REF-001", codigo="COD-001",
        marca="MarcaX", categoria="MONITOREO", sub_categoria="Test",
        cantidad=10.0, stock_min=2, compra_max=10
    )
    assert item.id_item is not None
    assert item.nombre_equipo == "Equipo Prueba"
    
    # Probar upsert (actualización de stock)
    item2 = await import_service._upsert_item_and_stock(
        db=db, nombre="Equipo Prueba", referencia="REF-001", codigo="COD-001",
        marca="MarcaX", categoria="MONITOREO", sub_categoria="Test",
        cantidad=25.0, stock_min=2, compra_max=10
    )
    assert item2.id_item == item.id_item
    
    # Verificar stock
    from app.models.inventory import StockBulk
    res = await db.execute(select(StockBulk).where(StockBulk.id_item == item.id_item))
    stock = res.scalars().first()
    assert stock.cantidad_actual == 25.0
