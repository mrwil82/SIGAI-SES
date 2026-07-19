import pytest
from app.core.security import verify_password, create_access_token, create_refresh_token

class TestSecurity:
    def test_password_hashing(self):
        from app.core.security import get_password_hash
        password = "TestPass123!"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed) is True

    def test_wrong_password(self):
        from app.core.security import get_password_hash
        hashed = get_password_hash("correct")
        assert verify_password("wrong", hashed) is False

    def test_access_token_creation(self):
        token = create_access_token(data={"sub": "test@test.com", "rol": "ADMIN"})
        assert token is not None
        assert isinstance(token, str)

    def test_refresh_token_creation(self):
        token = create_refresh_token(data={"sub": "test@test.com"})
        assert token is not None
        assert isinstance(token, str)


@pytest.mark.asyncio
class TestUserCRUD:
    async def test_create_user(self, test_db, sample_user_data):
        from app.crud import crud_user
        from app.schemas.user import UsuarioCreate
        user_in = UsuarioCreate(**sample_user_data)
        user = await crud_user.create_user(test_db, user=user_in, current_user_id=0)
        assert user.id_usuario is not None
        assert user.nombre == "Test User"
        assert user.email == "test@example.com"
        assert user.is_active is True

    async def test_get_user_by_email(self, test_db, sample_user_data):
        from app.crud import crud_user
        from app.schemas.user import UsuarioCreate
        user_in = UsuarioCreate(**sample_user_data)
        await crud_user.create_user(test_db, user=user_in, current_user_id=0)

        found = await crud_user.get_user_by_email(test_db, email="test@example.com")
        assert found is not None
        assert found.email == "test@example.com"

    async def test_get_user_by_email_not_found(self, test_db):
        from app.crud import crud_user
        found = await crud_user.get_user_by_email(test_db, email="noexiste@test.com")
        assert found is None

    async def test_update_user(self, test_db, sample_user_data):
        from app.crud import crud_user
        from app.schemas.user import UsuarioCreate, UsuarioUpdate
        user_in = UsuarioCreate(**sample_user_data)
        user = await crud_user.create_user(test_db, user=user_in, current_user_id=0)

        update_in = UsuarioUpdate(nombre="Updated Name")
        updated = await crud_user.update_user(test_db, user_id=user.id_usuario, user_in=update_in, current_user_id=0)
        assert updated.nombre == "Updated Name"

    async def test_delete_user_soft(self, test_db, sample_user_data):
        from app.crud import crud_user
        from app.schemas.user import UsuarioCreate
        user_in = UsuarioCreate(**sample_user_data)
        user = await crud_user.create_user(test_db, user=user_in, current_user_id=0)

        deleted = await crud_user.delete_user(test_db, user_id=user.id_usuario, current_user_id=0)
        assert deleted is not None
        assert deleted.is_active is False