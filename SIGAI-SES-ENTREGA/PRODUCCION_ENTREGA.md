# 📦 ENTREGA PRODUCCIÓN - SIGAI-SES v1.0.0
## Checklist Final para el Cliente (Securitas Colombia S.A.)

---

## 🎯 RESUMEN EJECUTIVO

| Ítem | Detalle |
|------|---------|
| **Sistema** | SIGAI-SES - Gestión de Activos e Inventario SES |
| **Versión** | 1.0.0 |
| **Fecha entrega** | 22 de septiembre de 2026 |
| **Entorno objetivo** | Windows Server 2019/2022 + Docker Desktop / Docker Engine |
| **Arquitectura** | 4 contenedores: MariaDB + Backend (FastAPI) + Frontend (React) + Nginx |

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

### OPCIÓN B: Manual (Linux / Docker CLI)

```bash
cd 01-CODIGO-FUENTE
cp .env.production.example .env
# EDITAR .env con sus valores reales (ver sección Variables Críticas)
docker compose up -d --build
docker compose logs -f backend  # Verificar "Inicializacion completada exitosamente"
```

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

| Problema | Causa | Solución |
|----------|-------|----------|
| `docker compose up` falla puerto 80/3306/8000 ocupado | Otro servicio usando puerto | `netstat -ano | findstr :80` → matar proceso o cambiar puerto en `docker-compose.yml` |
| Backend "unhealthy" / reinicia constante | BD no lista / credenciales mal | `docker compose logs backend` → ver error → fix `.env` → `docker compose restart backend` |
| Frontend 404 al recargar página (SPA) | Nginx no config `try_files` | Usar `Frontend/nginx.conf` incluido (ya corregido en Dockerfile) |
| CORS error en navegador | Dominio no en `CORS_ALLOWED_ORIGINS` | Agregar dominio a `.env` → `docker compose restart backend` |
| "Access denied" BD | Password incorrecto en `.env` | Verificar `DB_PASSWORD` = `MYSQL_PASSWORD` en docker-compose.yml |
| SSL/HTTPS no funciona | Certificados no configurados | Ver `05_GUIA_DESPLIEGUE_PRODUCCION.pdf` sección SSL |

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
