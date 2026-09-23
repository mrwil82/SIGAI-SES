#!/usr/bin/env python
"""
Genera SQL limpio completo (CREATE TABLE) desde los modelos SQLAlchemy
+ INSERT del usuario admin inicial
"""
import os
import sys

# Configurar DATABASE_URL dummy para que no falle
os.environ['DATABASE_URL'] = 'mysql+aiomysql://user:pass@localhost:3306/sigai_ses'
os.environ['SECRET_KEY'] = 'dummy-key-for-schema-generation'
os.environ['ADMIN_EMAIL'] = 'admin@securitas.com'
os.environ['ADMIN_PASSWORD'] = 'Admin123!'
os.environ['ADMIN_NAME'] = 'Administrador SIGAI'
os.environ['ADMIN_CEDULA'] = '0000000000'
os.environ['ADMIN_CODIGO'] = 'ADM001'

# Agregar path del backend
sys.path.insert(0, r'C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\01-CODIGO-FUENTE\Backend')

from sqlalchemy import create_engine, MetaData
from sqlalchemy.schema import CreateTable
from app.models import Base
from app.core.security import get_password_hash
from app.models.user import Usuario, UserRole, Regional

def generate_clean_sql():
    """Genera SQL completo desde los modelos"""

    # Crear engine dummy (solo para compilar DDL)
    engine = create_engine('mysql+aiomysql://user:pass@localhost:3306/sigai_ses', strategy='mock', executor=lambda *args, **kwargs: None)

    output = []
    output.append("-- =============================================================================")
    output.append("-- SIGAI-SES - Base de Datos Limpia (Solo Esquema + Admin Inicial)")
    output.append("-- Generado automáticamente desde modelos SQLAlchemy")
    output.append("-- =============================================================================")
    output.append("")
    output.append("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";")
    output.append("START TRANSACTION;")
    output.append("SET time_zone = \"+00:00\";")
    output.append("")
    output.append("/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;")
    output.append("/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;")
    output.append("/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;")
    output.append("/*!40101 SET NAMES utf8mb4 */;")
    output.append("")

    # Generar CREATE TABLE para cada tabla
    for table in Base.metadata.sorted_tables:
        # Compilar CREATE TABLE
        create_sql = str(CreateTable(table).compile(engine, compile_kwargs={"literal_binds": True}))
        # Fix MySQL: now() -> CURRENT_TIMESTAMP
        create_sql = create_sql.replace("DEFAULT now()", "DEFAULT CURRENT_TIMESTAMP")
        create_sql = create_sql.replace("DEFAULT now(", "DEFAULT CURRENT_TIMESTAMP")
        output.append(f"-- Tabla: {table.name}")
        output.append(create_sql + ";")
        output.append("")

    # Insertar usuario admin inicial
    output.append("-- =============================================================================")
    output.append("-- DATOS INICIALES: Usuario Administrador")
    output.append("-- =============================================================================")
    output.append("")

    # Hash de la contraseña por defecto
    password_hash = get_password_hash("Admin123!")

    admin_insert = f"""INSERT INTO `usuarios` (
    `email`, `password_hash`, `nombre`, `rol`, `is_active`,
    `cedula`, `codigo_empleado`, `created_at`, `config`
) VALUES (
    'admin@securitas.com',
    '{password_hash}',
    'Administrador SIGAI',
    'ADMIN',
    1,
    '0000000000',
    'ADM001',
    CURRENT_TIMESTAMP,
    '{{}}'
);"""
    output.append(admin_insert)
    output.append("")

    # Insertar regionales base (opcional - vacías para que el cliente cree las suyas)
    output.append("-- Regionales: El cliente debe crear las suyas según su organización")
    output.append("-- INSERT INTO `regionales` (`nombre`, `ciudad`) VALUES ('Regional Bogotá', 'Bogotá');")
    output.append("")

    output.append("COMMIT;")
    output.append("")
    output.append("/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;")
    output.append("/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;")
    output.append("/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;")

    return "\n".join(output)

if __name__ == "__main__":
    sql_content = generate_clean_sql()
    output_path = r'C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\04-BASE-DATOS\sigai_ses_clean.sql'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    print(f"SQL limpio generado: {output_path}")
    print(f"Tamaño: {len(sql_content)} caracteres")
