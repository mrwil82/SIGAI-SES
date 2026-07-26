---
title: "Guia de Despliegue para Pruebas del Cliente -- SIGAI-SES"
---


# Guia de Despliegue para Pruebas del Cliente -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Producci%C3%B3n-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)
![Cost](https://img.shields.io/badge/Cost-%240-ff69b4?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Render%20%E2%86%92%20Supabase-6DB33F?style=for-the-badge)

---

> [!TIP]
> **Objetivo:** Publicar SIGAI-SES **gratis, 24/7**, para que el cliente pruebe y puedas actualizar desde VS Code con un simple `git push`.

---

## Arquitectura del Despliegue

```
+------------------+       +----------------------------------+
|    Cliente       |       |        Render (Backend)           |
|   (Navegador)    | ----> |  +----------------------------+  |
|   + APK Android  |       |  | FastAPI + Uvicorn (4w)     |  |
|   + EXE Windows  |       |  | Python 3.12                |  |
+------------------+       |  | Auto-deploy desde GitHub   |  |
        |                  |  +----------+-----------------+  |
        |                  |             |                     |
        v                  |  +----------v-----------------+  |
+------------------+       |  | Supabase (PostgreSQL 16)   |  |
|   GitHub Pages   |       |  | 500 MB, 4 GB RAM          |  |
| (Frontend        |       |  | Session Pooler (IPv4)     |  |
|  React Build)    |       |  +----------------------------+  |
+------------------+       +----------------------------------+
```

**Costo: $0 USD** -- Planes gratuitos de Render + Supabase

---

## Indice de Pasos

| # | Paso | Servicio | Tiempo |
|---|------|----------|----------|
| 1 | Subir codigo a GitHub | GitHub | ~10 min |
| 2 | Crear BD gratis (Supabase) | Supabase | ~10 min |
| 3 | Configurar variables de entorno | Render | ~5 min |
| 4 | Desplegar Backend en Render | Render | ~15 min |
| 5 | CI Pipeline (GitHub Actions) | GitHub | ~5 min |
| 5 | Probar el sistema | -- | ~5 min |
| 6 | Dar acceso al cliente | GitHub/Vercel | ~5 min |
| 7 | Actualizaciones desde VS Code | VS Code | ~1 min |

---

## PASO 1: Subir el codigo a GitHub

> [!IMPORTANT]
> El codigo ya debe estar en un repositorio GitHub. Render y GitHub Actions se conectan directamente al repositorio.

**Repositorio actual:** [https://github.com/mrwil82/SIGAI-SES](https://github.com/mrwil82/SIGAI-SES)

### Verificar que el `.gitignore` excluye archivos sensibles

```
.env
Backend/.env
Frontend/.env
*.log
__pycache__/
node_modules/
.venv/
Frontend/dist/
Backend/app/static/avatars/
```

---

## PASO 2: Crear Base de Datos Gratis (Supabase)

> [!NOTE]
> Supabase ofrece **PostgreSQL 100% gratis, 24/7, con 500 MB de almacenamiento**.

### 2.1 Crear cuenta

1. Ve a [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Login con GitHub

### 2.2 Crear proyecto

| Campo | Valor |
|-------|-------|
| **Name** | `sigai-ses-db` |
| **Database Password** | `Sigaises2026` |
| **Region** | `US West-2 (Oregon)` |
| **Pricing Plan** | Free |

Espera ~2 minutos a que se provisione.

### 2.3 Obtener cadena de conexion

1. En Dashboard > **Project Settings** > **Database**
2. En **Connection string** selecciona **URI**
3. Copia la cadena `postgresql://postgres.xxxxx:password@aws-1-us-west-2.pooler.supabase.com:5432/postgres`

### 2.4 Configurar en el backend

Reemplaza los valores en la variable `DATABASE_URL`:

```
DATABASE_URL=postgresql+asyncpg://postgres.TU_PROYECTO:TU_PASSWORD@aws-1-us-west-2.pooler.supabase.com:5432/postgres
DATABASE_URL_SYNC=postgresql://postgres.TU_PROYECTO:TU_PASSWORD@aws-1-us-west-2.pooler.supabase.com:5432/postgres
```

> [!CAUTION]
> Guarda la cadena de conexion. La necesitaras en el PASO 3.

---

## PASO 3: Desplegar Backend en Render

> [!TIP]
> Render despliega tu backend automaticamente desde GitHub. **Plan gratuito: 750 horas/mes, incluye HTTPS.**

### 3.1 Crear cuenta

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"Sign Up"** con cuenta de **GitHub**

### 3.2 Crear Web Service

1. Click **"New +"** > **"Web Service"**
2. Conecta tu repositorio `mrwil82/SIGAI-SES`
3. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | `sigai-ses-api` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port 10000` |

### 3.3 Configurar variables de entorno

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres.oiyhzbgnhmlrrgxokulu:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres` |
| `DATABASE_URL_SYNC` | `postgresql://postgres.oiyhzbgnhmlrrgxokulu:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres` |
| `SECRET_KEY` | `clave_secreta_super_segura_123` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` |
| `ADMIN_EMAIL` | `admin@securitas.com` |
| `ADMIN_PASSWORD` | `Admin123!` |
| `ADMIN_NAME` | `Administrador SIGAI` |
| `ADMIN_CEDULA` | `0000000000` |
| `ADMIN_CODIGO` | `ADM001` |

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Render construye e inicia el servicio (~3 min)
3. Una vez verde, la URL sera: `https://sigai-ses-api.onrender.com`

### 3.5 Auto-deploy

Render redepliega automaticamente con cada `git push` a la rama `main`.

### 3.6 Verificar

```
Abre en el navegador:
https://sigai-ses-api.onrender.com/docs
→ Debes ver la documentacion Swagger de la API
```

---

## PASO 4: CI Pipeline (GitHub Actions)

> [!NOTE]
> El pipeline se ejecuta automaticamente en cada `git push` y ejecuta:
> - **backend-tests**: 32 tests (pytest con SQLite async)
> - **frontend-lint**: ESLint con `--max-warnings 300`

### Workflow definido en `.github/workflows/main.yml`

```yaml
name: CI Pipeline
on: [push]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: "sqlite+aiosqlite:///:memory:"
      SECRET_KEY: "test-secret-key"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"
      - run: pip install -r Backend/requirements.txt
      - run: pytest Backend/tests/

  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: Frontend/package-lock.json
      - run: npm ci
        working-directory: Frontend
      - run: npm run lint
        working-directory: Frontend
```

> [!TIP]
> Para ver el estado del pipeline: [https://github.com/mrwil82/SIGAI-SES/actions](https://github.com/mrwil82/SIGAI-SES/actions)

---

## PASO 5: Probar

- [x] Abre `https://sigai-ses-api.onrender.com` en el navegador
- [x] Login: `admin@securitas.com` / `Admin123!`
- [x] Dashboard carga con KPIs
- [x] Prueba crear un item, un cliente, una garantia
- [x] Genera un acta de entrega con PDF
- [x] Cambia el tema en Configuracion
- [x] Sube tu foto de avatar
- [x] Verifica que los tests pasan en GitHub Actions

---

## PASO 6: Builds Ejecutables

### APK Android

```bash
cd Frontend
npm run cap:apk
# Genera: Frontend/android/app/build/outputs/apk/debug/app-debug.apk (~4.4 MB)
```

### EXE Windows (Portable)

```bash
cd Backend
pyinstaller backend.spec
# Genera: Backend/dist/SIGAI-SES.exe (~67 MB)
```

### Instalador Windows

```bash
# Usar Inno Setup con dist_installer/setup.iss
# Genera: dist_installer/SIGAI-SES-Setup-1.0.0.exe
```

---

## PASO 7: Actualizaciones desde VS Code

> [!TIP]
> Para hacer cambios y que se reflejen automaticamente en produccion:

```bash
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES
# Editar archivos en VS Code...
# Luego:

git add .
git commit -m "Descripcion del cambio"
git push
```

| Componente | Tiempo | Gatillo |
|------------|--------|---------|
| **Backend** (Render) | ~3 minutos | `git push` a `main` |
| **Frontend** (Render) | ~2 minutos | `git push` a `main` |
| **CI Pipeline** | ~4 minutos | `git push` |

> [!IMPORTANT]
> No necesitas hacer nada mas. **Solo `git push` y los cambios estan en produccion.**

---

## Comandos Utiles

<details>
<summary>Click para expandir comandos</summary>

### Ver logs del backend (Render)

```
Ir a: https://dashboard.render.com
→ Seleccionar servicio "sigai-ses-api"
→ Pestana "Logs"
```

### Verificar estado de la BD

```bash
# Conectar a Supabase desde terminal
psql -h aws-1-us-west-2.pooler.supabase.com -p 5432 -U postgres.oiyhzbgnhmlrrgxokulu -d postgres
```

### Rollback (si algo se rompe)

| Servicio | Como hacer rollback |
|----------|-------------------|
| Render | Dashboard > Deploy > seleccionar version anterior > **"Deploy"** |
| GitHub Actions | No aplica, solo CI; si falla no bloquea el deploy |

</details>

---

## Limitaciones del Plan Gratuito

| Servicio | Limite | Impacto |
|----------|-----------|------------|
| Render | 750 horas/mes, 512 MB RAM | Suficiente para pruebas 24/7 |
| Supabase | 500 MB BD, 2 GB ancho de banda | Suficiente para pruebas |
| GitHub Actions | 2000 min/mes | Suficiente para CI |

> [!NOTE]
> **Para pruebas del cliente es mas que suficiente.** Si se requiere crecimiento, los planes de pago cuestan ~$7-25/mes.

---

## Solucion de Problemas

| Problema | Solucion |
|-------------|-------------|
| Frontend no carga | Verificar que `VITE_API_BASE_URL` apunta a Render |
| Error 500 en API | Revisar logs en Render > pestana **"Logs"** |
| "value too long for type VARCHAR(255)" | Ejecutar migracion: `ALTER TABLE usuarios ALTER COLUMN avatar_url TYPE TEXT;` |
| Login falla | Verificar que `SECRET_KEY` y `DATABASE_URL` estan configurados en Render |
| Los cambios no se ven | Esperar 3 minutos, Render tarda en redesplegar |
| 404 en avatars | Los avatars antiguos en disco no existen en Render; subir avatar desde Configuracion |

---

## Progreso del Despliegue

```
Paso 1 [==========] 100% - Codigo en GitHub
Paso 2 [==========] 100% - BD Supabase creada
Paso 3 [==========] 100% - Backend en Render
Paso 4 [==========] 100% - CI Pipeline funcional
Paso 5 [========  ] 80% - Pruebas
Paso 6 [========  ] 80% - Builds ejecutables
Paso 7 [==========] 100% - Actualizaciones automaticas
```

---

> [!TIP]
> **Todo el stack es gratuito.** Cuando el cliente valide, se puede migrar a planes de pago o on-premise.

---

*Documento actualizado: Julio 2026 -- v1.0*
*Repositorio: [https://github.com/mrwil82/SIGAI-SES](https://github.com/mrwil82/SIGAI-SES)*
*Backend: [https://sigai-ses-api.onrender.com](https://sigai-ses-api.onrender.com)*
