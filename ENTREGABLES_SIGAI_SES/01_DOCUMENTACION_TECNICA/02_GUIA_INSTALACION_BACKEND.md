---
title: "GUÍA DE INSTALACIÓN DEL BACKEND — FastAPI + MySQL"
---

# GUÍA DE INSTALACIÓN DEL BACKEND — FastAPI + MySQL

<p align="center">
  <img src="https://img.shields.io/badge/Componente-Backend-009688?style=for-the-badge&logo=fastapi" alt="Backend">
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.136.1-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Estado-Probado-2ea44f?style=for-the-badge&logo=checkmarx" alt="Estado">
</p>

---

## 1. Objetivo

> [!NOTE]
> Este documento describe el proceso técnico para **configurar e iniciar** el servidor de datos del sistema **SIGAI-SES**.

---

## 2. Requisitos Previos

> [!WARNING]
> Asegúrate de tener instalados los siguientes componentes antes de comenzar:

| Componente | Versión Mínima | Verificación |
|---|---|---|
| **Python** | `3.12+` | `python --version` |
| **MySQL / MariaDB** | `8.0+` / `10.5+` | `mysql --version` |
| **pip** | (incluido) | `pip --version` |

---

## 3. Instalación Paso a Paso

### 3.1 Crear entorno virtual

```bash
cd Backend
python -m venv .venv
```

**Activar el entorno:**

| Sistema | Comando |
|---|---|
| **Windows** | `.venv\Scripts\activate` |
| **Linux / Mac** | `source .venv/bin/activate` |

> [!TIP]
> Verás `(.venv)` al inicio del prompt si se activó correctamente.

### 3.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

<details>
<summary><b>Click para ver las dependencias principales</b></summary>

<br>

| Paquete | Versión | Propósito |
|---|---|---|
| **fastapi** | `0.136.1` | Framework web async |
| **uvicorn** | `0.47.0` | Servidor ASGI |
| **sqlalchemy** | `2.0.49` | ORM async |
| **aiomysql** | `0.3.2` | Driver MySQL async |
| **pydantic** | `2.13.4` | Validación de datos |
| **python-jose** | `3.5.0` | Tokens JWT |
| **passlib** | `1.7.4` | Encriptación bcrypt |
| **slowapi** | `0.1.9` | Rate limiting |

</details>

### 3.3 Configurar variables de entorno

Cree un archivo `.env` en la carpeta `Backend/` con las siguientes variables:

```env
# ───> Base de Datos ─────────────────────────────────────
DATABASE_URL=mysql+aiomysql://USUARIO:PASSWORD@HOST:3306/NOMBRE_BD

# ───> Seguridad JWT ──────────────────────────────────────
SECRET_KEY=su_clave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# ───> CORS (dominios permitidos) ─────────────────────────
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost

# ───> Usuario Admin (se crea automáticamente) ───────────
ADMIN_EMAIL=admin@securitas.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administrador SIGAI
```

#### Ejemplos de `DATABASE_URL` según proveedor

| Proveedor | | URL de conexión |
|---|---|---|
| **Local** | | `mysql+aiomysql://sigai:password@localhost:3306/sigai_ses` |
| **AWS RDS** | | `mysql+aiomysql://admin:password@mi-db.xxxxx.us-east-1.rds.amazonaws.com:3306/sigai_ses` |
| **Azure** | | `mysql+aiomysql://admin@mibase.mysql.database.azure.com:3306/sigai_ses` |
| **DigitalOcean** | | `mysql+aiomysql://doadmin:password@db-mibase.db.ondigitalocean.com:3306/sigai_ses` |

### 3.4 Iniciar el servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Parámetro | | Descripción |
|---|---|---|
| `--reload` | | Recarga automática al detectar cambios (solo desarrollo) |
| `--host 0.0.0.0` | | Escucha en todas las interfaces de red |
| `--port 8000` | | Puerto de escucha |

---

## 4. Verificación

> [!IMPORTANT]
> Al iniciar **por primera vez**, el sistema creará automáticamente las tablas y el usuario administrador.

| Recurso | URL | Propósito |
|---|---|---|
| **API Base** | http://localhost:8000 | Endpoint raíz |
| **Swagger UI** | http://localhost:8000/docs | Documentación interactiva |
| **Health Check** | http://localhost:8000/health | Estado del servidor |

### Pasos de verificación

- [x] La API responde con códigos **HTTP 200**
- [x] Swagger carga todas las **60+ rutas**
- [x] Health Check devuelve `{"status": "healthy"}`
- [x] El admin puede iniciar sesión

---

## 5. Dependencias Principales

| Paquete | Versión | Propósito | Prioridad |
|---|---|---|---|
| **fastapi** | `0.136.1` | Framework web async | Esencial |
| **uvicorn** | `0.47.0` | Servidor ASGI | Esencial |
| **sqlalchemy** | `2.0.49` | ORM async | Esencial |
| **aiomysql** | `0.3.2` | Driver MySQL async | Esencial |
| **pydantic** | `2.13.4` | Validación de datos | Esencial |
| **python-jose** | `3.5.0` | Tokens JWT | Importante |
| **passlib** | `1.7.4` | Encriptación bcrypt | Importante |
| **slowapi** | `0.1.9` | Rate limiting | Opcional |

---

<details>
<summary><b>Click para ver los comandos de diagnóstico rápido</b></summary>

<br>

```bash
# Verificar versión de Python
python --version

# Verificar dependencias instaladas
pip list

# Verificar conectividad MySQL
python -c "import aiomysql; print(' aiomysql OK')"

# Probar inicio de FastAPI
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

</details>

---

<p align="center">
  <b>SIGAI-SES</b> — <i>Sistema Integral de Gestión de Activos e Inventario</i><br><br>
  <img src="https://img.shields.io/badge/Última%20actualización-Julio%202026-FF6F00?style=for-the-badge&logo=calendar" alt="Actualización"><br>
   v1.0.0
</p>




