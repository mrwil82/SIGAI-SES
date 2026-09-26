# 📦 ENTREGA PRODUCCIÓN - SIGAI-SES v1.0.0
## Checklist Final para el Cliente (Securitas Colombia S.A.)

---

## 🎯 RESUMEN EJECUTIVO

| Ítem | Detalle |
|------|---------|
| **Sistema** | SIGAI-SES - Gestión de Activos e Inventario SES |
| **Versión** | 1.0.0 |
| **Fecha entrega** | 25 de septiembre de 2026 |
| **Entorno objetivo** | Windows Server 2019/2022 + Docker Desktop/Engine, Linux (Ubuntu 22.04+), Cloud (AWS/Azure/GCP/DO/Render/Railway) |
| **Arquitectura** | 4 contenedores: MariaDB + Backend (FastAPI) + Frontend (React) + Nginx |
| **Opciones BD** | MariaDB local (Docker), Supabase (PostgreSQL gratis), RDS, Cloud SQL, Azure DB, BD externa |
| **Despliegues alternativos** | EXE Standalone (Windows), APK Android (Capacitor), On-Premise (Systemd+Nginx) |

---

## 📁 ESTRUCTURA DE ENTREGA

```
SIGAI-SES-ENTREGA/
├── 01-CODIGO-FUENTE/          # Código completo + Docker + Scripts
│   ├── Backend/               # API FastAPI (Python 3.12)
│   ├── Frontend/              # React + TypeScript + Vite
│   ├── docker-compose.yml     # Orquestación PRODUCCIÓN
│   ├── docker-compose.override.yml.example  # Para desarrollo local
│   ├── nginx.conf             # Reverse proxy principal
│   ├── .env.production.example # Template variables producción
│   ├── deploy.ps1             # 👉 DESPLIEGUE 1-CLICK (Windows)
│   ├── DOCKER.md              # Guía Docker
│   └── README.md              # Documentación técnica
├── 02-INSTALADORES/           # Instaladores nativos
│   ├── Windows/SIGAI-SES-Setup-1.0.0.exe
│   └── Android/SIGAI-SES-1.0.0-debug.apk
├── 03-DOCUMENTACION/          # 30 PDFs técnicos + manuales
├── 04-BASE-DATOS/sigai_ses_db.sql  # Script SQL completo
└── 05-CI-CD/main.yml          # Pipeline GitHub Actions
```

---

## 🚀 DESPLIEGUE EN PRODUCCIÓN (CLIENTE)

### OPCIÓN A: Script Automático (RECOMENDADO - Windows)

```powershell
# 1. Copiar carpeta 01-CODIGO-FUENTE al servidor
# 2. Abrir PowerShell como ADMINISTRADOR
# 3. Ejecutar:
cd C:\ruta\a\01-CODIGO-FUENTE
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\deploy.ps1
```

**El script hace TODO automáticamente:**
- ✅ Verifica Docker instalado y corriendo
- ✅ Genera `.env` con contraseñas seguras aleatorias
- ✅ Muestra credenciales admin **una sola vez** (¡copie y guarde!)
- ✅ Construye imágenes Docker
- ✅ Levanta 4 contenedores (DB, Backend, Frontend, Nginx)
- ✅ Espera health checks (máx 2 min)
- ✅ Muestra URLs de acceso y comandos útiles

**Opciones del script:**
```powershell
.\deploy.ps1 -SkipBuild           # Reusar imágenes (deploy rápido)
.\deploy.ps1 -UseSupabase         # Usar BD externa (Supabase/RDS/Cloud SQL)
.\deploy.ps1 -EnvFile "C:\config\sigai.env"  # .env externo
```

### OPCIÓN B: Manual (Linux / Docker CLI)

```bash
cd 01-CODIGO-FUENTE

# Producción estándar (MariaDB local)
cp .env.example .env
# EDITAR .env con sus valores reales
docker compose up -d --build

# Con BD externa (Supabase/RDS/Cloud SQL/Azure DB)
cp .env.example .env
# EDITAR .env con DATABASE_URL externa
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d --build

docker compose logs -f backend  # Verificar "Inicialización completada exitosamente"
```

### OPCIÓN C: Proveedores Cloud (Render/Railway + Supabase) — **GRATIS**

**Backend en Render + Frontend en Vercel:**
1. Supabase: Crear proyecto gratis → copiar DATABASE_URL (Session Pooler)
2. Render: New Web Service → Docker → carpeta `Backend/`
   - Variables: `DATABASE_URL`, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app`
3. Vercel: Importar repo → carpeta `Frontend/` → `VITE_API_URL=https://tu-backend.onrender.com`

**Backend en Railway + Frontend en Vercel:**
1. Railway: Deploy from GitHub → carpeta `Backend/`
   - Variables: `DATABASE_URL` (Supabase), `SECRET_KEY`, `CORS_ALLOWED_ORIGINS=*`
2. Vercel: `VITE_API_URL=https://tu-backend.railway.app`

### OPCIÓN D: EXE Standalone (Windows - Sin Docker)

```bash
# En máquina de desarrollo (requiere Python 3.11+ y Node.js 18+)
# Configurar Backend/.env con BD (Supabase recomendado)
python build_all.py
# Genera: Backend/dist/SIGAI-SES.exe (portable, sin dependencias)
```

### OPCIÓN E: On-Premise Linux (Systemd + Nginx + Let's Encrypt)

Ver: `03-DOCUMENTACION/06_GUIA_ON_PREMISE.md`

---

## 🌐 ACCESO POST-DESPLIEGUE

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend (App)** | `http://<IP-SERVIDOR>` | admin@securitas.com / *password generado* |
| **Backend API** | `http://<IP-SERVIDOR>:8000` | - |
| **Swagger Docs** | `http://<IP-SERVIDOR>:8000/docs` | - |
| **Health Check** | `http://<IP-SERVIDOR>/health` | - |

> **Nota:** Si usa dominio propio (ej: `sigai.securitas.com`), configure DNS → IP del servidor y actualice `CORS_ALLOWED_ORIGINS` en `.env`.

---

## 🔐 VARIABLES CRÍTICAS (.env) - CONFIGURAR ANTES DE PRODUCCIÓN

### Para Docker Compose (MariaDB Local)

| Variable | Descripción | Ejemplo Generado |
|----------|-------------|------------------|
| `DB_ROOT_PASSWORD` | Password root MariaDB | `a1b2c3d4e5f6...` (32 hex) |
| `DB_PASSWORD` | Password usuario app | `f6e5d4c3b2a1...` (32 hex) |
| `SECRET_KEY` | **Clave JWT - CRÍTICO** | `secret_key_64_chars_hex` |
| `ADMIN_EMAIL` | Email admin inicial | `admin@securitas.com` |
| `ADMIN_PASSWORD` | Password admin inicial | `Admin12345!` |
| `CORS_ALLOWED_ORIGINS` | Dominios permitidos | `https://sigai.securitas.com,http://localhost` |
| `VITE_API_URL` | URL pública del API | `https://sigai.securitas.com` |
| `UVICORN_WORKERS` | Workers backend (CPU cores × 2) | `4` |

### Para BD Externa (Supabase/RDS/Cloud SQL/Azure DB)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL async BD (SQLAlchemy) | `postgresql+asyncpg://user:pass@host:5432/db` |
| `DATABASE_URL_SYNC` | URL sync BD (Alembic) | `postgresql+psycopg2://user:pass@host:5432/db` |
| `SECRET_KEY` | **Clave JWT - CRÍTICO** | `secret_key_64_chars_hex` |
| `CORS_ALLOWED_ORIGINS` | Dominios permitidos | `https://sigai.securitas.com,https://app.vercel.app` |
| `VITE_API_URL` | URL pública del API | `https://api.miempresa.com` |
| `UVICORN_WORKERS` | Workers backend | `4` |

### 🔑 CÓMO GENERAR CLAVES SEGURAS

```powershell
# PowerShell (Windows) - Ejecute en terminal:
# SECRET_KEY (64 chars):
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# DB_PASSWORD (32 chars):
-join ((1..16) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# ADMIN_PASSWORD:
"Admin$(Get-Random -Minimum 10000 -Maximum 99999)!"
```

```bash
# Linux / Git Bash / WSL:
openssl rand -hex 32   # SECRET_KEY
openssl rand -hex 16   # DB_PASSWORD
```

---

## 🛠️ COMANDOS DE OPERACIÓN DIARIA

```powershell
# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Reiniciar solo el backend (deploy de código)
docker compose restart backend

# Reiniciar todo
docker compose restart

# Ver estado contenedores
docker compose ps

# Backup manual de BD
docker compose exec backend python -m scripts.backup_db

# Ver uso de recursos
docker stats

# Detener (mantiene datos)
docker compose down

# ⚠️ DETENER Y BORRAR TODO (incluye base de datos)
docker compose down -v
```

---

## 💾 BACKUP Y RECUPERACIÓN

### Backup Automático (Recomendado: Windows Task Scheduler)

```powershell
# Crear tarea programada diaria a las 2:00 AM
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
    -Argument '-NoProfile -Command "cd C:\ruta\01-CODIGO-FUENTE; docker compose exec -T backend python -m scripts.backup_db"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SIGAI-Backup-DB" -Description "Backup diario SIGAI-SES BD"
```

### Backup Manual

```powershell
# Backup completo (SQL + archivos)
docker compose exec backend python -m scripts.backup_db

# Backup solo SQL
docker compose exec db mysqldump -u sigai -p sigai_ses > backup_$(date +%F).sql
```

### Restaurar Backup

```powershell
# Detener servicios
docker compose down

# Restaurar volumen BD (desde backup .sql)
docker compose up -d db
docker compose exec -T db mysql -u sigai -p sigai_ses < backup_2026-09-22.sql

# Levantar resto
docker compose up -d
```

> 📖 **Ver guía completa:** `03-DOCUMENTACION/PDFs/07_PROCEDIMIENTOS_BACKUP.pdf`

---

## 🔧 TROUBLESHOOTING COMÚN

### Docker Compose (Local/On-Premise)

| Problema | Causa | Solución |
|----------|-------|----------|
| `docker compose up` falla puerto 80/3306/8000 ocupado | Otro servicio usando puerto | `netstat -ano \| findstr :80` → matar proceso o cambiar puerto en `docker-compose.yml` |
| Backend "unhealthy" / reinicia constante | BD no lista / credenciales mal | `docker compose logs backend` → ver error → fix `.env` → `docker compose restart backend` |
| Frontend 404 al recargar página (SPA) | Nginx no config `try_files` | Usar `Frontend/nginx.conf` incluido (ya corregido en Dockerfile) |
| CORS error en navegador | Dominio no en `CORS_ALLOWED_ORIGINS` | Agregar dominio a `.env` → `docker compose restart backend` |
| "Access denied" BD | Password incorrecto en `.env` | Verificar `DB_PASSWORD` = `MYSQL_PASSWORD` en docker-compose.yml |
| SSL/HTTPS no funciona | Certificados no configurados | Ver `GUIA_PRODUCCION.md` sección SSL |

### Cloud Providers (Render/Railway + Supabase)

| Problema | Causa | Solución |
|----------|-------|----------|
| Build falla en Render/Railway | Dockerfile no encontrado o error de build | Verificar `Backend/Dockerfile` existe y `docker build` pasa localmente |
| Backend no conecta a Supabase | DATABASE_URL incorrecta | Usar **Session Pooler** (puerto 5432), no Transaction Pooler (6543) |
| CORS error desde Vercel/Netlify | Dominio frontend no en CORS | Agregar `https://tu-app.vercel.app` a `CORS_ALLOWED_ORIGINS` en Render/Railway |
| Timeout en requests grandes | Límite de 30s en Render/Railway | Aumentar `proxy_read_timeout` en nginx.conf o usar streaming |
| Variables de entorno no se cargan | Nombre incorrecto en dashboard | Verificar mayúsculas/minúsculas: `DATABASE_URL` no `database_url` |

### EXE Standalone (Windows)

| Problema | Causa | Solución |
|----------|-------|----------|
| .exe se cierra inmediatamente | Error de conexión BD / variable faltante | Ejecutar desde terminal: `Backend\dist\SIGAI-SES.exe` para ver logs |
| "Module not found" en PyInstaller | Hidden import faltante | Agregar módulo a `Backend/backend.spec` → `hiddenimports` |
| No abre navegador | Error en `run.py` | Verificar `webbrowser.open()` y puerto 8000 libre |
| Antivirus bloquea .exe | Falso positivo | Firmar .exe o agregar excepción en antivirus |

### APK Android

| Problema | Causa | Solución |
|----------|-------|----------|
| "App no instalada" | Orígenes desconocidos deshabilitado | Ajustes > Seguridad > Instalar apps desconocidas > Permitir |
| Error de red en APK | Backend no accesible | Verificar `VITE_API_BASE_URL` en `.env.production` apunta a URL pública (Railway/Render) |
| Gradle sync falla | SDK/NDK versión incorrecta | Android Studio > SDK Manager > Instalar API 34 + Build Tools 34.0.0 |

---

## 📊 MONITOREO BÁSICO

```powershell
# Health check automático (agregar a monitoring)
curl http://localhost/health
curl http://localhost:8000/health

# Logs estructurados (JSON) en: 01-CODIGO-FUENTE/Backend/logs/
# - app.log      : Aplicación general
# - error.log    : Solo errores
# - access.log   : Requests HTTP (nginx)
```

---

## 📞 SOPORTE Y ESCALAMIENTO

| Nivel | Contacto | Canal |
|-------|----------|-------|
| **Nivel 1** (Operación) | Admin SIGAI local | Logs + reinicio contenedores |
| **Nivel 2** (Técnico) | Equipo Desarrollo Securitas | GitHub Issues / Teams |
| **Nivel 3** (Crítico) | Arquitecto Proyecto | Llamada directa + War Room |

**Documentación técnica completa:** `03-DOCUMENTACION/PDFs/`
- `01_MANUAL_TECNICO.pdf` - Arquitectura, API, BD
- `02_MANUAL_ADMINISTRADOR.pdf` - Gestión usuarios, roles, config
- `05_GUIA_DESPLIEGUE_PRODUCCION.pdf` - Cloud, SSL, scaling
- `08_CATALOGO_ERRORES_API.pdf` - Códigos error y solución

---

## ✅ CHECKLIST ENTREGA CLIENTE (FIRMAR)

- [ ] Carpeta `01-CODIGO-FUENTE/` copiada al servidor destino
- [ ] Docker Desktop / Engine instalado y corriendo
- [ ] Script `deploy.ps1` ejecutado **como Administrador**
- [ ] Credenciales generadas **copiadas y guardadas en vault seguro**
- [ ] Frontend accesible en `http://<IP>/`
- [ ] Login exitoso con `admin@securitas.com` / password generado
- [ ] Cambio de password admin **inmediato** tras primer login
- [ ] `CORS_ALLOWED_ORIGINS` actualizado con dominio real
- [ ] `VITE_API_URL` actualizado con URL pública real
- [ ] Backup automático configurado (Task Scheduler / cron)
- [ ] SSL/HTTPS configurado (si aplica dominio propio)
- [ ] Documentación PDF entregada y accesible al equipo
- [ ] Pruebas de smoke test: login, listar inventario, crear garantía, generar reporte

---

## 📝 NOTAS IMPORTANTES PARA EL CLIENTE

1. **PRIMER LOGIN:** Cambie la contraseña del admin inmediatamente (Perfil → Cambiar contraseña)
2. **SECRET_KEY:** Si la pierde, **todos los tokens JWT se invalidan** (usuarios deben reloguearse)
3. **BD:** Los datos persisten en volumen Docker `db_data`. `docker compose down -v` **BORRA TODO**.
4. **ACTUALIZACIONES:** Para nueva versión: `git pull` → `docker compose build --no-cache` → `docker compose up -d`
5. **ESCALABILIDAD:** Aumente `UVICORN_WORKERS` según CPU (máx 2×cores). Para HA: múltiples replicas + load balancer externo.

---

**Firma Conformidad Cliente:** _________________________ **Fecha:** _______________

**Entregado por:** _________________________ **Fecha:** _______________

---

*SIGAI-SES v1.0.0 - Securitas Colombia S.A. - Unidad de Seguridad Electrónica (SES)*
