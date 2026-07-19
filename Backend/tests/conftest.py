import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db.session import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def test_db():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    await engine.dispose()

@pytest_asyncio.fixture
async def test_db_session(test_db):
    yield test_db

@pytest.fixture
def sample_user_data():
    return {
        "nombre": "Test User",
        "email": "test@example.com",
        "password": "TestPass123!",
        "rol": "ADMIN",
        "is_active": True
    }

@pytest.fixture
def sample_item_data():
    return {
        "nombre_equipo": "Camara Test",
        "categoria": "MONITOREO",
        "referencia": "CAM-001",
        "codigo_item_interno": "CAM-001-INT",
        "stock_minimo": 2,
        "compra_maxima": 10,
        "cantidad_inicial": 5,
        "ubicacion": "BODEGA"
    }

@pytest.fixture
def sample_cliente_data():
    return {
        "nombre": "Cliente Test",
        "nit": "123456789-0",
        "contacto": "Contacto Test",
        "telefono": "3001234567",
        "tipo_cliente": "CORPORATIVO"
    }

@pytest.fixture
def sample_proyecto_data():
    return {
        "nombre_proyecto": "Proyecto Test",
        "estado": "ACTIVO"
    }