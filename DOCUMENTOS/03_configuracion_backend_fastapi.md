# DOCUMENTO 3 – Informe de configuración del entorno backend (FastAPI + MySQL)

## 1. Objetivo y alcance
Este documento describe el proceso técnico para poner en marcha el servidor de datos del sistema SES, asegurando la conectividad con MySQL y la integridad de los modelos.

## 2. Requisitos previos
- Python 3.12+
- MySQL Server 8.0
- Virtualenv (Módulo de entorno virtual)

## 3. Instalación y configuración
1. Creación del entorno virtual:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Instalación de dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## 4. Dependencias principales (requirements.txt)
```text
fastapi==0.110.0
uvicorn==0.27.1
sqlalchemy==2.0.27
aiomysql==0.2.0
pydantic==2.6.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1
```

## 5. Configuración de entorno (.env)
```env
DATABASE_URL=mysql+aiomysql://user:password@localhost:3306/ses_db
SECRET_KEY=mi_llave_secreta_para_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

## 6. Definición de modelos (Ejemplo real: Ítem)
```python
# SQLAlchemy Model (Base de Datos)
class Item(Base):
    __tablename__ = "items"
    id_item = Column(Integer, primary_key=True, index=True)
    nombre_equipo = Column(String(255), nullable=False)
    referencia = Column(String(100), unique=True)
    stock_minimo = Column(Integer, default=5)
    stock_bulk = relationship("StockBulk", back_populates="item", uselist=False)

# Pydantic Schema (Validación API)
class ItemRead(BaseModel):
    id_item: int
    nombre_equipo: str
    referencia: str
    class Config:
        from_attributes = True
```

## 7. Verificación de conexión
Se validó la conexión mediante el script `verify_db.py`, confirmando que FastAPI puede realizar operaciones asíncronas sobre MySQL y que la relación de `stock_bulk` devuelve datos correctamente.

## 8. Conclusiones
El entorno backend ha sido configurado bajo estándares de seguridad y eficiencia, permitiendo una gestión de datos robusta para el inventario de las subestaciones de Cundinamarca.
