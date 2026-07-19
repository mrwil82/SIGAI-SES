"""
Script para crear el usuario administrador inicial.
Uso: python -m scripts.seed_admin
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.models.user import Usuario, UserRole
from app.core.security import get_password_hash

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+aiomysql://sigai:sigai_password@localhost:3306/sigai_ses"
)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@securitas.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Administrador SIGAI")
ADMIN_CEDULA = os.getenv("ADMIN_CEDULA", "0000000000")
ADMIN_CODIGO = os.getenv("ADMIN_CODIGO", "ADM001")


async def create_admin():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        result = await db.execute(
            select(Usuario).filter(Usuario.email == ADMIN_EMAIL)
        )
        existing = result.scalars().first()

        if existing:
            print(f"[INFO] El usuario admin ya existe: {ADMIN_EMAIL}")
            await engine.dispose()
            return

        admin_user = Usuario(
            nombre=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password_hash=get_password_hash(ADMIN_PASSWORD),
            rol=UserRole.ADMIN,
            cedula=ADMIN_CEDULA,
            codigo_empleado=ADMIN_CODIGO,
            regional="Nacional",
            is_active=True,
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)

        print(f"[OK] Usuario admin creado exitosamente:")
        print(f"     Email:    {ADMIN_EMAIL}")
        print(f"     Password: {ADMIN_PASSWORD}")
        print(f"     ID:       {admin_user.id_usuario}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_admin())
