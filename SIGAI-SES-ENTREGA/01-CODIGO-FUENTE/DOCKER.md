# SIGAI-SES - Despliegue con Docker

## Instalación Rápida (5 minutos)

### 1. Copiar el proyecto al servidor
```bash
scp -r Proyecto_SES usuario@tu-servidor:~/
```

### 2. Configurar variables
```bash
cd ~/Proyecto_SES
cp .env.example .env
nano .env  # Editar con tus valores (VER VARIABLES OBLIGATORIAS ABAJO)
```

### 3. Levantar servicios
```bash
# Producción (MariaDB local)
docker compose up -d

# Desarrollo (con hot reload)
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Con Supabase (PostgreSQL en la nube)
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 4. Verificar
```bash
docker compose logs -f backend
# Esperar: "Inicialización completada exitosamente"
```

### 5. Acceder
- **Frontend:** http://tu-servidor
- **Backend API:** http://tu-servidor:8000
- **Swagger Docs:** http://tu-servidor:8000/docs
- **Health Check:** http://tu-servidor/health

---

## Archivos de Configuración

| Archivo | Qué Configura |
|---------|---------------|
| `.env` | Todos los valores (BD, JWT, admin, CORS) |
| `docker-compose.yml` | Orquestación producción (MariaDB + Backend + Frontend + Nginx) |
| `docker-compose.override.yml` | Desarrollo local (hot reload, puertos extra) |
| `docker-compose.supabase.yml` | Usar Supabase en lugar de BD local |
| `nginx.conf` | Reverse proxy, SSL, rate limiting, seguridad |

---

## Variables Obligatorias en `.env`

```env
# BASE DE DATOS (MariaDB Docker)
DB_ROOT_PASSWORD=password-seguro-del-root-32-chars
DB_NAME=sigai_ses
DB_USER=sigai
DB_PASSWORD=password-seguro-del-usuario-32-chars

# JWT (OBLIGATORIO cambiar en producción)
SECRET_KEY=clave-aleatoria-64-chars-para-jwt

# CORS (dominios permitidos, separados por coma SIN espacios)
CORS_ALLOWED_ORIGINS=https://tudominio.com,http://localhost

# ADMIN INICIAL (cambiar tras primer login)
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=password-seguro-del-admin

# WORKERS (2-4 por core CPU)
UVICORN_WORKERS=4

# FRONTEND (URL pública del API)
VITE_API_URL=https://tudominio.com
```

---

## Generar Claves Seguras

```bash
# SECRET_KEY (64 chars hex)
openssl rand -hex 32

# DB_PASSWORD / DB_ROOT_PASSWORD (32 chars hex)
openssl rand -hex 16

# PowerShell (Windows)
# SECRET_KEY:
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
# DB_PASSWORD:
-join ((1..16) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
# ADMIN_PASSWORD:
"Admin$(Get-Random -Minimum 10000 -Maximum 99999)!"
```

---

## Comandos Básicos

```bash
# Iniciar
docker compose up -d

# Detener (mantiene datos)
docker compose down

# Ver logs en tiempo real
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Ver estado contenedores
docker compose ps

# Reiniciar un servicio
docker compose restart backend

# Reconstruir tras cambios de código
docker compose build --no-cache backend
docker compose up -d

# Ver uso de recursos
docker stats
```

---

## Despliegue en Diferentes Escenarios

### Desarrollo Local (Hot Reload)
```bash
# Crea docker-compose.override.yml basado en .example
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
# Frontend: http://localhost:5173 (Vite dev server con HMR)
# Backend:  http://localhost:8000 (uvicorn con --reload)
```

### Con Supabase (PostgreSQL en la nube - GRATIS 500MB)
```bash
# 1. Crear proyecto en https://supabase.com
# 2. Obtener DATABASE_URL (Session Pooler, puerto 5432)
# 3. Editar .env:
#    DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
#    DATABASE_URL_SYNC=postgresql+psycopg2://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
# 4. Levantar SIN BD local:
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### Con Base de Datos Externa (RDS, Cloud SQL, Azure Database, etc.)
```bash
# 1. Crear BD gestionada (MariaDB/MySQL/PostgreSQL)
# 2. Editar .env con DATABASE_URL apuntando a la BD externa
# 3. Levantar SIN BD local:
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
# (docker-compose.supabase.yml deshabilita el contenedor db local)
```

### On-Premise (Linux + Systemd + Nginx + Let's Encrypt)
Ver: `GUIA_ON_PREMISE.md` o `../03-DOCUMENTACION/06_GUIA_ON_PREMISE.md`

---

## Backup Automático

```bash
# Backup manual
docker compose exec backend python -m scripts.backup_db

# Backup diario a las 2 AM (crontab en host Linux)
0 2 * * * cd /ruta/Proyecto_SES && docker compose exec -T backend python -m scripts.backup_db >> logs/backup.log 2>&1

# Windows Task Scheduler (PowerShell)
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NoProfile -Command "cd C:\ruta\Proyecto_SES; docker compose exec -T backend python -m scripts.backup_db"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SIGAI-Backup-DB"
```

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Puerto 80/3306/8000 ocupado | Otro servicio usando puerto | `netstat -ano \| findstr :80` → matar proceso o cambiar puerto en `docker-compose.yml` |
| Backend "unhealthy" / reinicia constante | BD no lista / credenciales mal | `docker compose logs backend` → ver error → fix `.env` → `docker compose restart backend` |
| Frontend 404 al recargar (SPA) | Nginx no config `try_files` | Usar `Frontend/nginx.conf` incluido (ya corregido en Dockerfile) |
| CORS error en navegador | Dominio no en `CORS_ALLOWED_ORIGINS` | Agregar dominio a `.env` → `docker compose restart backend` |
| "Access denied" BD | Password incorrecto en `.env` | Verificar `DB_PASSWORD` = `MYSQL_PASSWORD` en docker-compose.yml |
| SSL/HTTPS no funciona | Certificados no configurados | Ver `GUIA_DESPLIEGUE_PRODUCCION.md` sección SSL |

---

## Seguridad en Producción

1. **Cambia TODOS los passwords por defecto** antes de exponer a internet
2. **Usa HTTPS** (Let's Encrypt + Nginx o Cloudflare)
3. **Restringe CORS** solo a tu dominio real
4. **No expongas el puerto 3306** de MariaDB al exterior
5. **Haz backups regulares** de la base de datos
6. **Actualiza imágenes Docker** mensualmente: `docker compose pull && docker compose up -d`

---

## Estructura de Volúmenes y Redes

```
Volúmenes:
  db_data       → /var/lib/mysql (datos MariaDB)
  static_files  → /app/app/static (avatars, uploads, frontend build)

Redes:
  sigai-network → Bridge interno (db ↔ backend ↔ frontend ↔ nginx)
```

---

## Health Checks

```bash
# Verificar salud de todos los servicios
docker compose ps

# Health checks incluidos:
# - db: mysqladmin ping
# - backend: curl http://localhost:8000/health
# - nginx: implícito (puerto 80)
# - frontend: implícito (puerto 80)
```
