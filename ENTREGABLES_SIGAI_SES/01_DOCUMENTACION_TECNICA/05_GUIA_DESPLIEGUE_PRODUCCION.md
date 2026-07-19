---
title: "Guia de Despliegue para Pruebas del Cliente -- SIGAI-SES"
---


# Guia de Despliegue para Pruebas del Cliente -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)
![Cost](https://img.shields.io/badge/Cost-%240-ff69b4?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Vercel%20%E2%86%92%20Railway%20%E2%86%92%20TiDB-6DB33F?style=for-the-badge)

---

> [!TIP]
> **Objetivo:** Publicar SIGAI-SES **gratis, 24/7**, para que el cliente pruebe y puedas actualizar desde VS Code con un simple `git push`.

---

## Arquitectura del Despliegue

```
+------------------+       +----------------------------------+
|    Cliente       |       |         Railway (Backend)         |
|   (Navegador)    | ----> |  +----------------------------+  |
|                  |       |  |  FastAPI + Uvicorn          |  |
+------------------+       |  |  Puerto 8000                |  |
        |                  |  +----------+-----------------+  |
        |                  |             |                     |
        v                  |  +----------v-----------------+  |
+------------------+       |  |  TiDB Cloud (MySQL 5GB)    |  |
|    Vercel        |       |  |  Serverless, 24/7          |  |
| (Frontend        |       |  +----------------------------+  |
|  React)          |       +----------------------------------+
+------------------+
```

**Costo: $0 USD** -- Planes gratuitos de Railway + Vercel + TiDB Cloud

---

## Indice de Pasos

| # | Paso | Servicio | Tiempo |
|---|------|----------|----------|
| 1 | Subir codigo a GitHub | GitHub | ~10 min |
| 2 | Crear BD gratis (TiDB Cloud) | TiDB Cloud | ~10 min |
| 3 | Desplegar Backend en Railway | Railway | ~15 min |
| 4 | Desplegar Frontend en Vercel | Vercel | ~10 min |
| 5 | Probar el sistema | -- | ~5 min |
| 6 | Dar acceso al cliente | GitHub/Vercel | ~5 min |
| 7 | Actualizaciones desde VS Code | VS Code | ~1 min |

---

## PASO 1: Subir el codigo a GitHub

> [!IMPORTANT]
> El codigo debe estar en un repositorio GitHub para que Railway y Vercel puedan desplegarlo.

### 1.1 Crear repositorio en GitHub

| # | Accion | Detalle |
|---|--------|---------|
| 1 | Ir a | [https://github.com/new](https://github.com/new) |
| 2 | Nombre del repo | `proyecto-sigai-ses` |
| 3 | Visibilidad | **Private** (solo tu y el cliente ven el codigo) |
| 4 | Crear | Click en **"Create repository"** |

### 1.2 Subir el codigo desde VS Code

```bash
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES

# Inicializar git
git init
git add .
git commit -m "Version inicial para pruebas"

# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/proyecto-sigai-ses.git
git branch -M main
git push -u origin main
```

> [!WARNING]
> **Verificar que el `.gitignore` excluye archivos sensibles:**
> ```
> .env
> Backend/.env
> Frontend/.env
> docker-compose.override.yml
> *.log
> __pycache__/
> node_modules/
> .venv/
> Frontend/dist/
> ```

---

## PASO 2: Crear Base de Datos Gratis (TiDB Cloud)

> [!NOTE]
> TiDB Cloud ofrece **MySQL compatible 100% gratis, 24/7, con 5GB de almacenamiento**. Perfecto para pruebas.

### 2.1 Crear cuenta

| # | Accion |
|---|--------|
| 1 | Ve a [https://tidbcloud.com](https://tidbcloud.com) |
| 2 | Click **"Sign Up"** (puedes usar Google) |
| 3 | Verifica tu correo electronico |

### 2.2 Crear cluster gratis

```mermaid
graph LR
    A[Click Create Cluster] --> B[Seleccionar Serverless]
    B --> C[Region: AWS us-west-2]
    C --> D[Click Create]
    D --> E[Esperar ~2 minutos]
```

### 2.3 Obtener datos de conexion

```sql
-- Cadena de conexion de ejemplo:
mysql+pymysql://username:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/sigai_ses_db
```

### 2.4 Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS sigai_ses_db;
```

> [!CAUTION]
> **Guarda la cadena de conexion.** La necesitaras en el PASO 3.

---

## PASO 3: Desplegar Backend en Railway

> [!TIP]
> Railway despliega tu backend automaticamente con Docker. **Gratis 500 horas/mes (~17h/dia).**

### 3.1 Crear cuenta

1. Ve a [https://railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Login con tu cuenta de **GitHub**

### 3.2 Crear proyecto

1. Click **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio `proyecto-sigai-ses`
4. Railway detecta el `Dockerfile` automaticamente

### 3.3 Configurar variables de entorno

| Variable | Valor | Seguridad |
|----------|-------|-----|
| `DATABASE_URL` | Cadena de TiDB Cloud (usa `aiomysql`) | Critica |
| `SECRET_KEY` | `openssl rand -hex 32` | Critica |
| `ADMIN_EMAIL` | `admin@securitas.com` | Fija |
| `ADMIN_PASSWORD` | `Admin123!` | Temporal |
| `CORS_ALLOWED_ORIGINS` | `https://proyecto-sigai-ses.vercel.app` | URL |
| `BACKEND_PORT` | `8000` | Default |

**Ejemplo de DATABASE_URL:**
```
mysql+aiomysql://username:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/sigai_ses_db
```

### 3.4 Deploy

```
[OK] Railway redepliega automaticamente
[OK] Ve a la pestana "Deployments" para ver el progreso
[OK] Cuando este verde, el backend esta corriendo
[OK] Copia la URL: https://proyecto-sigai-ses-production.up.railway.app
```

### 3.5 Verificar

```bash
# Abre en el navegador:
# https://TU-URL-RAILWAY.app/docs
# Debes ver la documentacion Swagger de la API
```

---

## PASO 4: Desplegar Frontend en Vercel

> [!TIP]
> Vercel hostea tu frontend React **gratis, 24/7, con HTTPS automatico**.

### 4.1 Crear cuenta

1. Ve a [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Login con tu cuenta de **GitHub**

### 4.2 Importar proyecto

| Campo | Valor |
|-------|-------|
| Repositorio | `proyecto-sigai-ses` |
| Framework Preset | **Vite** |
| Root Directory | `Frontend` |

### 4.3 Configurar variables de entorno

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE_URL` | `https://TU-URL-RAILWAY.app/api/v1` |

### 4.4 Deploy

```
1. Click "Deploy"
2. Espera ~1 minuto
3. Vercel te da una URL: https://proyecto-sigai-ses.vercel.app
```

### 4.5 Actualizar CORS en Railway

```bash
# Ve a Railway > Variables
# Actualiza CORS_ALLOWED_ORIGINS con la URL exacta de Vercel:
CORS_ALLOWED_ORIGINS=https://proyecto-sigai-ses.vercel.app
```

---

## PASO 5: Probar

- [x] Abre la URL de Vercel en el navegador
- [x] Login: `admin@securitas.com` / `Admin123!`
- [x] El frontend debe conectar con el backend [OK]
- [x] Prueba crear un usuario, un item, etc.

> [!NOTE]
> Si todo funciona correctamente, el dashboard mostrara datos y podras navegar por todos los modulos.

---

## PASO 6: Dar Acceso al Cliente

### Credenciales de acceso

```
URL:    https://proyecto-sigai-ses.vercel.app
Usuario: admin@securitas.com
Clave:  Admin123!
```

### Acceso al repositorio (opcional)

| # | Accion |
|---|--------|
| 1 | GitHub > tu repositorio > **Settings > Collaborators** |
| 2 | Click **"Add people"** |
| 3 | Agrega el correo del cliente |

---

## PASO 7: Actualizaciones desde VS Code

> [!TIP]
> Para hacer cambios y que se reflejen automaticamente en produccion:

### Hacer cambios

```bash
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES
# Editar archivos en VS Code...
# Ejemplo: corregir un bug en Backend/app/main.py
```

### Subir cambios

```bash
git add .
git commit -m "Correccion: descripcion del cambio"
git push
```

### Despliegue automatico

| Componente | Tiempo | Gatillo |
|------------|--------|---------|
| **Backend** (Railway) | ~2 minutos | `git push` |
| **Frontend** (Vercel) | ~1 minuto | `git push` |

> [!IMPORTANT]
> No necesitas hacer nada mas. **Solo `git push` y los cambios estan en produccion.**

---

## Comandos Utiles

<details>
<summary>Click para expandir comandos</summary>

### Ver logs del backend (Railway)

```bash
railway logs
# O desde la interfaz web: pestana "Logs"
```

### Verificar estado de la BD

```bash
# Conectar a TiDB Cloud desde terminal
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u username -p
```

### Rollback (si algo se rompe)

| Servicio | Como hacer rollback |
|----------|-------------------|
| Railway | Deployment > seleccionar version anterior > **"Redeploy"** |
| Vercel | Deployments > seleccionar version anterior > **"Promote to Production"** |

</details>

---

## Limitaciones del Plan Gratuito

| Servicio | Limite | Impacto |
|----------|-----------|------------|
| Railway | 500 horas/mes (~17h/dia) | Si se agota, el backend se duerme hasta el mes siguiente |
| Vercel | 100GB bandwidth/mes | Suficiente para pruebas |
| TiDB Cloud | 5GB almacenamiento, 1B row reads/mes | Suficiente para pruebas |

> [!NOTE]
> **Para pruebas del cliente es mas que suficiente.** Si necesitas mas en el futuro, los planes de pago cuestan ~$5/mes.

---

## Solucion de Problemas

| Problema | Solucion |
|-------------|-------------|
| Frontend no carga | Verificar que la URL de Vercel esta en `CORS_ALLOWED_ORIGINS` en Railway |
| Error 500 en API | Ver logs en Railway > pestana **"Logs"** |
| "Connection refused" | Verificar que `DATABASE_URL` esta correcto en Railway |
| Login falla | Verificar que las tablas se crearon en TiDB Cloud |
| Los cambios no se ven | Esperar 2 minutos, Railway/Vercel tardan en redesplegar |

---

## Progreso del Despliegue

```
Paso 1 [========  ] 80% - Codigo en GitHub
Paso 2 [========  ] 80% - BD creada
Paso 3 [==========] 100% - Backend en Railway
Paso 4 [==========] 100% - Frontend en Vercel
Paso 5 [========  ] 80% - Pruebas
Paso 6 [========  ] 80% - Acceso al cliente
Paso 7 [==========] 100% - Actualizaciones
```

---

> [!TIP]
> **Recuerda:** Todo el stack es gratuito para pruebas. Cuando el cliente valide, puedes migrar a planes de pago por ~$5/mes o a on-premise.

---

*Documento actualizado: Julio 2026 -- v1.0*
*Repositorio: [github.com/TU_USUARIO/proyecto-sigai-ses](https://github.com/TU_USUARIO/proyecto-sigai-ses)*
