import pytest
from app.crud import crud_alerts

@pytest.mark.asyncio
class TestAlerts:
    async def test_create_alert(self, test_db):
        from app.schemas.alerts import AlertUpdate
        alert_in = AlertUpdate(titulo="Test Alert", notas="Test description", prioridad="alta")
        alert = await crud_alerts.create_alert(test_db, alerta_in=alert_in, current_user_id=1)
        assert alert.id is not None
        assert alert.titulo == "Test Alert"

    async def test_get_all_alerts(self, test_db):
        from app.schemas.alerts import AlertUpdate
        alert_in = AlertUpdate(titulo="Test Alert", notas="Test", prioridad="media")
        await crud_alerts.create_alert(test_db, alerta_in=alert_in, current_user_id=1)

        alerts = await crud_alerts.get_all_alerts(test_db)
        assert len(alerts) >= 1

    async def test_update_alert_status(self, test_db):
        from app.schemas.alerts import AlertUpdate
        alert_in = AlertUpdate(titulo="Test Alert", notas="Test", prioridad="alta")
        alert = await crud_alerts.create_alert(test_db, alerta_in=alert_in, current_user_id=1)

        updated = await crud_alerts.update_alert_status(
            test_db, alert_id=alert.id, estado="resuelta", notas="Resuelta",
            current_user_id=1
        )
        assert updated.estado == "resuelta"

    async def test_delete_alert(self, test_db):
        from app.schemas.alerts import AlertUpdate
        alert_in = AlertUpdate(titulo="Test Alert", notas="Test", prioridad="baja")
        alert = await crud_alerts.create_alert(test_db, alerta_in=alert_in, current_user_id=1)

        deleted = await crud_alerts.delete_alert(test_db, alert_id=alert.id, current_user_id=1)
        assert deleted is not None