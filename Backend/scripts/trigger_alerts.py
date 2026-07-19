import asyncio
import os
import sys

# Añadir el directorio actual al path para importar app
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.crud.crud_alerts import evaluar_alertas

async def main():
    async with AsyncSessionLocal() as db:
        print("Evaluando alertas de stock bajo...")
        await evaluar_alertas(db)
        print("Evaluación completada.")

if __name__ == "__main__":
    asyncio.run(main())
