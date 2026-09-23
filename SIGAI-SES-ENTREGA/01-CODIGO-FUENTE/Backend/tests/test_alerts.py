import pytest
from typing import cast
from app.crud import crud_alerts
from app.schemas.alerts import AlertUpdate, AlertPrioridad


@pytest.mark.asyncio
class TestAlerts:
    async def test_create_alert(self, test_db):
        alert_in = AlertUpdate(
            titulo="Test Alert", notas="Test description", prioridad=AlertPrioridad.ALTA
        )
        alert = await crud_alerts.create_alert(
            test_db, alerta_in=alert_in, current_user_id=1
        )
        assert alert.id is not None
        assert cast(str, alert.titulo) == "Test Alert"

    async def test_get_all_alerts(self, test_db):
        alert_in = AlertUpdate(
            titulo="Test Alert", notas="Test", prioridad=AlertPrioridad.MEDIA
        )
        await crud_alerts.create_alert(test_db, alerta_in=alert_in, current_user_id=1)

        alerts = await crud_alerts.get_all_alerts(test_db)
        assert len(alerts) >= 1

    async def test_update_alert_status(self, test_db):
        alert_in = AlertUpdate(
            titulo="Test Alert", notas="Test", prioridad=AlertPrioridad.ALTA
        )
        alert = await crud_alerts.create_alert(
            test_db, alerta_in=alert_in, current_user_id=1
        )

        updated = await crud_alerts.update_alert_status(
            test_db,
            alert_id=cast(int, alert.id),
            estado="resuelta",
            notas="Resuelta",
            current_user_id=1,
        )
        assert updated is not None
        assert cast(str, updated.estado) == "resuelta"

    async def test_delete_alert(self, test_db):
        alert_in = AlertUpdate(
            titulo="Test Alert", notas="Test", prioridad=AlertPrioridad.BAJA
        )
        alert = await crud_alerts.create_alert(
            test_db, alerta_in=alert_in, current_user_id=1
        )

        deleted = await crud_alerts.delete_alert(
            test_db, alert_id=cast(int, alert.id), current_user_id=1
        )
        assert deleted is not None
