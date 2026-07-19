---
title: "FAQ Técnica — SIGAI-SES"
---

# FAQ Técnica — SIGAI-SES

<div align="center">

![Version](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge&logo=github)
![Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge&logo=checkmarx)
![Last Update](https://img.shields.io/badge/Last%20Update-Julio%202026-orange?style=for-the-badge&logo=calendar)
![Pages](https://img.shields.io/badge/Sections-7-informational?style=for-the-badge&logo=bookstack)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20MySQL-ff69b4?style=for-the-badge&logo=codeigniter)

</div>

---

> [!TIP]
> **¿Busqueda rapida?** Usa `Ctrl+F` con palabras clave como *migracion*, *JWT*, *CORS*, *pool* o *deploy* para encontrar tu respuesta al instante.

---

## 1. Instalacion y Configuracion

<details open>
<summary><b>Preguntas frecuentes sobre setup inicial</b></summary>

### ¿Que versiones de Python y Node.js se requieren?

| Requisito | Version Minima | Recomendada |
|:---|---:|:---:|
| ![Python](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python) | `Python 3.12` | `3.12.4+` |
| ![Node](https://img.shields.io/badge/Node.js-18%2B-green?logo=nodedotjs) | `Node.js 18` | `20 LTS` |
| ![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange?logo=mysql) | `MySQL 8.0` | `8.0.36+` |
| ![MariaDB](https://img.shields.io/badge/MariaDB-10.5%2B-1f77b4?logo=mariadb) | `MariaDB 10.5` | `11.0+` |

### ¿Como configuro la conexion a la base de datos?

Cree un archivo `.env` en `Backend/` con el siguiente contenido:

```env
DATABASE_URL=mysql+aiomysql://usuario:password@localhost:3306/sigai_ses_db
SECRET_KEY=su_clave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### ¿Como ejecuto las migraciones de la base de datos?

```bash
# Posicionarse en Backend/
cd Backend

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

# Aplicar migraciones
alembic upgrade head
```

### ¿El frontend necesita un archivo .env?

Si, en `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### ¿Que hago si cambia la URL del API en produccion?

Actualice `VITE_API_BASE_URL` en las variables de entorno de **Vercel** (para despliegue cloud) o en el `.env` del build (para on-premise).

> [!WARNING]
> Recuerde recompilar el frontend despues de cambiar variables de entorno: `npm run build`

### ¿Puedo usar Docker para desarrollo local?

**Si.** El proyecto incluye `Dockerfile` para backend y frontend. Puede usar **Docker Compose** para orquestacion.

| Componente | Dockerfile Base |
|:---|---:|
| Backend | `python:3.12-slim` |
| Frontend | `node:20-alpine` → `nginx:alpine` (multi-stage) |

### ¿Como configuro el CORS para un nuevo dominio?

Agregue el dominio a la variable `CORS_ALLOWED_ORIGINS` en el `.env` del backend (separado por comas):

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://midominio.com
```

</details>

---

### 2. Autenticacion y Seguridad

<details open>
<summary><b>Todo sobre el flujo de auth, tokens y proteccion</b></summary>

### ¿Como funciona el flujo de autenticacion?

El sistema usa **OAuth2 Password Flow** con **JWT**. El flujo completo:

```mermaid
sequenceDiagram
    Cliente->>+Servidor: POST /api/v1/auth/login (email+password)
    Servidor-->>-Cliente: {access_token, refresh_token, user}
    Note over Cliente: Almacena tokens en localStorage
    Cliente->>+Servidor: GET /api/v1/auth/me (Bearer access_token)
    Servidor-->>-Cliente: {user data}
    Note over Cliente: Axios interceptor adjunta token automaticamente
```

### ¿Que algoritmos de encriptacion se usan?

| Componente | Tecnologia | Version |
|:---|---:|---:|
| Contrasenas | `bcrypt` (passlib) | 1.7.4 |
| Tokens JWT | `HS256` (python-jose) | 3.5.0 |

### ¿Como se maneja la renovacion de tokens?

Cuando el `access_token` expira (**HTTP 401**), el frontend intenta renovarlo usando el `refresh_token` mediante `POST /api/v1/auth/refresh`. Si falla, redirige al login.

> [!TIP]
> El refresh_token es valido por **7 dias**. Si no usa la aplicacion por mas de una semana, debera iniciar sesion nuevamente.

### ¿Los tokens son seguros?

Los tokens se almacenan en **localStorage** (riesgo asumido, mitigado por validacion en cada peticion). Los tokens JWT estan firmados con **HS256** y contienen:

| Claim | Contenido |
|:---|---:|
| `user_id` | ID del usuario |
| `rol` | Perfil de acceso |
| `regional` | Regional asignada |
| `exp` | Fecha de expiracion |
| `iat` | Fecha de emision |

> [!WARNING]
> Las sesiones son **revocables** via tabla `sesiones_usuario`. Si detecta actividad sospechosa, revoque inmediatamente.

### ¿Que pasa si alguien roba el token?

El token expira en **8 horas**. Si sospecha que un token fue comprometido, puede:

1. Acceder a la base de datos
2. Ejecutar: `DELETE FROM sesiones_usuario WHERE id_usuario = <ID>;`
3. El usuario debera iniciar sesion nuevamente

### ¿Hay rate limiting?

| Recurso | Limite | Implementacion |
|:---|---:|---:|
| Login | **10 req/min** | SlowAPI |
| General (v1.1.0) | Planificado | — |

</details>

---

### 3. Base de Datos

<details open>
<summary><b>Configuracion, concurrencia y optimizacion</b></summary>

### ¿Que motor de base de datos se recomienda?

| Entorno | Motor | Version |
|:---|---:|---:|
| Produccion | MySQL o MariaDB | 8.0+ / 10.5+ |
| Desarrollo | SQLite | — |

### ¿Como se maneja la concurrencia?

**SQLAlchemy async** con pool de conexiones configurado:

| Parametro | Valor | Descripcion |
|:---|---:|:---|
| `pool_size` | `30` | Conexiones activas maximas |
| `max_overflow` | `50` | Conexiones extra temporales |
| `pool_timeout` | `60s` | Tiempo de espera maximo |
| `pool_recycle` | `1800s` | Reciclaje de conexiones |

### ¿Hay soft delete implementado?

**Si.** Las tablas `items`, `clientes` y `proveedores` tienen un campo `deleted_at` (timestamp nullable). Las consultas excluyen automaticamente registros eliminados mediante `filter(deleted_at.is_(None))`.

```python
# Ejemplo de consulta
stmt = select(Item).where(Item.deleted_at.is_(None))
```

### ¿Que pasa si se pierde la conexion a BD?

1. El pool de conexiones intenta **reconectar automaticamente**
2. Si falla, el endpoint `/health/db` devuelve **HTTP 503**
3. El frontend mostrara un mensaje de error apropiado

> [!NOTE]
> El sistema esta disenado para ser **resiliente** a caidas de conexion temporales.

### ¿Como optimizar consultas lentas?

| # | Accion | Herramienta |
|:---|---:|---:|
| 1 | Verificar indices en columnas `WHERE` y `JOIN` | `SHOW INDEX` |
| 2 | Ejecutar plan de ejecucion | `EXPLAIN` |
| 3 | Usar `selectinload` para relaciones async | SQLAlchemy |
| 4 | Configurar slow query log (>2s) | MySQL |

</details>

---

### 4. API y Endpoints

<details open>
<summary><b>Guia de referencia de la API REST</b></summary>

### ¿Cual es la base URL de la API?

| Entorno | URL |
|:---|---:|
| Desarrollo | `http://localhost:8000/api/v1` |
| Produccion | `https://dominio.com/api/v1` |

### ¿Como se documenta la API?

FastAPI genera documentacion interactiva automaticamente:

| Recurso | URL |
|:---|---:|
| Swagger UI | `/docs` |
| Redoc | `/redoc` |
| OpenAPI JSON | `/openapi.json` |

### ¿Cuales son los modulos disponibles en la API?

| # | Modulo | Endpoints | Proposito |
|:---:|:---|---:|:---|
| 1 | `auth` | 5 | Autenticacion |
| 2 | `users` | 10 | Usuarios |
| 3 | `inventory` | 16 | Inventario |
| 4 | `business` | 20+ | Negocio |
| 5 | `analytics` | 2 | Analiticas |
| 6 | `reports` | 1 | Reportes |
| 7 | `alerts` | 5 | Alertas |
| 8 | `regionales` | 1 | Regionales |
| 9 | `import` | 2 | Importacion |
| 10 | `monitoring` | 3 | Monitoreo |

### ¿Que formato acepta el endpoint de importacion Excel?

`POST /api/v1/import/excel` acepta `multipart/form-data` con un campo `file`. Auto-detecta el tipo de archivo:

- **Inventario laboratorio**
- **Clientes corporativos**
- **Garantias**

Aplica logica de **upsert** (inserta o actualiza segun corresponda).

### ¿Hay limite de tamano para archivos Excel?

| Tamano | Recomendacion |
|:---|---:|
| **<= 50 MB** | Sin problemas |
| **> 50 MB** | Dividir en lotes |
| **Volumenes grandes** | Usar script de importacion directa |

### ¿Que diferencia hay entre `/import/excel` y `/import/full-system`?

> [!NOTE]
> `/full-system` es un **alias legacy** de `/excel`. Ambos endpoints ejecutan exactamente la misma logica.

</details>

---

### 5. Reportes

<details open>
<summary><b>Generacion y exportacion de reportes</b></summary>

### ¿Que formatos de reporte estan disponibles?

| Formato | Libreria | Modo | Capacidad |
|:---|---:|:---|---:|
| ![Excel](https://img.shields.io/badge/Excel-217346?logo=microsoftexcel) | XlsxWriter | `constant_memory` | +30,000 registros |
| ![PDF](https://img.shields.io/badge/PDF-red?logo=adobeacrobatreader) | ReportLab | Tabla paginada | +30,000 registros |

> [!TIP]
> Ambos formatos usan **streaming** para evitar problemas de memoria con volumenes grandes de datos.

### ¿Como exporto datos?

```
GET /api/v1/reports/export/{module}?format=excel|pdf
```

| Modulo | Contenido |
|:---|---:|
| `inventory` | Items y activos |
| `alerts` | Alertas generadas |
| `clientes` | Listado de clientes |
| `users` | Usuarios del sistema |
| `guarantees` | Casos de garantia |

### ¿Por que mi exportacion se queda congelada?

| Causa | Sintoma | Solucion |
|:---|---:|---:|
| Pool de conexiones agotado | Sin respuesta | Esperar y reintentar |
| Archivo > 50k registros | Lentitud extrema | Usar filtros |
| Timeout de BD | Error 504 | Verificar slow query log |

</details>

---

### 6. Solucion de Problemas

<details open>
<summary><b>Errores comunes y sus soluciones</b></summary>

### Error: "Cannot connect to database"

| Paso | Accion | Comando |
|:---:|---|---|
| 1 | Verificar MySQL corriendo | `systemctl status mysql` (Linux) / `Get-Service MySQL` (Windows) |
| 2 | Confirmar credenciales `.env` | Revisar `DATABASE_URL` |
| 3 | Verificar puerto 3306 | `telnet localhost 3306` |
| 4 | Verificar BD existe | `mysql -u user -p -e "SHOW DATABASES;"` |

### Error: "JWT token expired"

> [!NOTE]
> El token de acceso expiro. El sistema intenta renovarlo **automaticamente** via interceptor Axios. Si persiste, cierre sesion y vuelva a iniciar.

### Error: "Column not found" al importar Excel

El archivo Excel no coincide con la plantilla esperada. Verifique los nombres de columna:

<details>
<summary><b>Inventario</b></summary>

```
Serial, Referencia, Marca, Equipo, Ubicacion, Estado
```

</details>

<details>
<summary><b>Clientes</b></summary>

```
Nombre, NIT, Contacto, Email, Telefono, Ciudad
```

</details>

<details>
<summary><b>Garantias</b></summary>

```
Serial, Caso, Proveedor, Fecha Envio, Estado, Falla Reportada
```

</details>

### El servidor no inicia con "address already in use"

El puerto **8000** ya esta ocupado. Solucion:

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux
lsof -i :8000
kill -9 <PID>
```

### Los cambios en el frontend no se reflejan

Limpie la cache del navegador: `Ctrl+Shift+R`. En desarrollo, **Vite HMR** deberia actualizar automaticamente.

### Error 500 en API sin mensaje claro

```
1. Revise logs: Backend/logs/error.log
2. Verifique migraciones: alembic current
3. Active DEBUG=True temporalmente en .env
```

### Error "Pool is exhausted" en BD

| Causa | Solucion |
|:---|---:|
| Muchas conexiones abiertas sin cerrar | Aumentar `pool_size` (max 50) |
| Timeout de queries largas | Optimizar consultas lentas |
| Pico de trafico | Reiniciar servidor |

### La migracion falla con "Foreign key constraint failed"

```
1. Revisar datos huerfanos en la tabla referenciada
2. Ejecutar migracion manualmente con datos de prueba
3. alembic downgrade -1 y re-aplicar con datos limpios
```

</details>

---

### 7. Despliegue

<details open>
<summary><b>Guia de puesta en produccion</b></summary>

### ¿Que servidor web se recomienda para produccion?

![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-4%20Workers-4051b5?logo=uvicorn)

**Nginx** como reverse proxy con `proxy_pass` a **Uvicorn** (4 workers recomendados).

> [!TIP]
> Vea `GUIA_ON_PREMISE.md` para configuracion detallada de Nginx.

### ¿Como habilitar HTTPS?

Use **Certbot** (Let's Encrypt) para certificados SSL automaticos:

```bash
sudo certbot --nginx -d sigai.securitas.com.co
```

### ¿Hay soporte para Docker?

| Componente | Base Image | Etapa |
|:---|---:|---:|
| Backend | `python:3.12-slim` | Single-stage |
| Frontend | `node:20-alpine` → `nginx:alpine` | Multi-stage |

### ¿Que plan gratuito recomiendan para pruebas?

| Servicio | Recurso | Limite |
|:---|---:|---:|
| ![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway) Backend | 500h/mes | ~17h/dia |
| ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel) Frontend | 100GB bandwidth/mes | — |
| ![TiDB](https://img.shields.io/badge/TiDB%20Cloud-2CA5E0?logo=tidb) BD | 5GB storage | 1B row reads/mes |

### ¿Como actualizar el sistema en produccion?

```bash
git pull origin main
cd Backend && source .venv/bin/activate && pip install -r requirements.txt && alembic upgrade head
sudo systemctl restart sigai-backend
cd ../Frontend && npm ci && npm run build
sudo systemctl reload nginx
```

### ¿Cuales son las limitaciones del plan gratuito?

| Plataforma | Limitacion | Suficiente para? |
|:---|---:|:---:|
| Railway | 500h/mes (~17h/dia) | Pruebas |
| Vercel | 100GB bandwidth/mes | Pruebas |
| TiDB Cloud | 5GB storage | Pruebas |

</details>

---

<div align="center">

![Separator](https://img.shields.io/badge/---Documento%20actualizado%20al%20Julio%202026%20--%20v2.0-lightgrey?style=for-the-badge)

</div>

> [!IMPORTANT]
> **¿No encuentras tu respuesta?** Contacta al equipo de desarrollo en el canal `#sigai-ses-dev` de Slack o abre un issue en el repositorio.
