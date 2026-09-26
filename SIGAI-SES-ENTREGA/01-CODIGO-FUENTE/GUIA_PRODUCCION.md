# Guía de Producción — SIGAI-SES

## Índice

1. [Despliegue con Docker Compose (Recomendado)](#1-despliegue-con-docker-compose)
2. [Despliegue en Proveedores Cloud](#2-despliegue-en-proveedores-cloud)
3. [Despliegue On-Premise (Linux + Systemd + Nginx)](#3-despliegue-on-premise)
4. [EXE Standalone (Windows - Sin Docker)](#4-exe-standalone)
5. [APK Android (Capacitor)](#5-apk-android)
6. [Variables de Entorno - Referencia Completa](#6-variables-de-entorno)
7. [SSL/HTTPS con Let's Encrypt](#7-ssltls-con-lets-encrypt)
8. [Backup y Recuperación](#8-backup-y-recuperación)
9. [Monitoreo y Mantenimiento](#9-monitoreo-y-mantenimiento)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Despliegue con Docker Compose (Recomendado)

### 1.1 Producción Estándar (MariaDB Local)

```bash
# 1. Clonar/copiar proyecto
cd /opt/sigai-ses

# 2. Configurar variables
cp .env.example .env
nano .env  # Cambiar TODOS los valores marcados

# 3. Levantar servicios
docker compose up -d

# 4. Verificar
docker compose logs -f backend
# Esperar: "Inicialización completada exitosamente"
```

### 1.2 Desarrollo Local (Hot Reload)

```bash
# Crear override para desarrollo
cp docker-compose.override.yml.example docker-compose.override.yml

# Levantar con hot reload
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Accesos:
# Frontend (Vite): http://localhost:5173
# Backend (Uvicorn): http://localhost:8000
```

### 1.3 Con Base de Datos Externa (Supabase, RDS, Cloud SQL, etc.)

```bash
# 1. Configurar .env con DATABASE_URL externa
# Ejemplo Supabase:
# DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres

# 2. Usar override para deshabilitar BD local
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 1.4 Script de Despliegue Automático (Windows)

```powershell
# En la carpeta del proyecto (como Administrador)
.\deploy.ps1

# Opciones:
.\deploy.ps1 -SkipBuild           # Reusar imágenes existentes
.\deploy.ps1 -UseSupabase         # Usar BD externa (Supabase/RDS/etc)
.\deploy.ps1 -EnvFile "C:\config\sigai.env"  # .env externo
```

---

## 2. Despliegue en Proveedores Cloud

### 2.1 AWS (EC2 + RDS)

| Componente | Configuración |
|------------|---------------|
| EC2 | Amazon Linux 2023, t3.medium+, SG: 22,80,443 |
| RDS | MariaDB 10.11, db.t3.micro+, SG desde ECSE |
| Docker | `sudo yum install docker && sudo systemctl enable --now docker` |

```bash
# En EC2
cd ~/Proyecto_SES
cp .env.example .env
# Editar .env con endpoint de RDS
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 2.2 Azure (VM + Azure Database)

```bash
# Azure Database for MariaDB (Flexible Server)
# VM: Ubuntu 22.04, Standard_B2s+
# Configurar .env con: mimariadb.mariadb.database.azure.com
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 2.3 Google Cloud (GCE + Cloud SQL)

```bash
# Cloud SQL: MariaDB, IP privada
# GCE: Ubuntu 22.04, e2-medium+
# Configurar .env con IP privada de Cloud SQL
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 2.4 DigitalOcean (Droplet + Managed DB)

```bash
# Managed Database: MariaDB
# Droplet: Ubuntu 22.04, 2GB RAM+
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### 2.5 Render + Supabase (Totalmente Gratis)

**Backend en Render:**
1. New Web Service > Docker > Seleccionar repo/carpeta `Backend/`
2. Variables de entorno:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
   SECRET_KEY=openssl rand -hex 32
   CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```

**Frontend en Vercel/Netlify:**
1. Importar repo > Carpeta `Frontend/`
2. Build: `npm run build` | Output: `dist`
3. Variable: `VITE_API_URL=https://tu-backend.onrender.com`

### 2.6 Railway + Supabase (Totalmente Gratis)

**Backend en Railway:**
1. Deploy from GitHub > Carpeta `Backend/`
2. Variables:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
   SECRET_KEY=openssl rand -hex 32
   CORS_ALLOWED_ORIGINS=*
   ```

**Frontend en Vercel:**
- `VITE_API_URL=https://tu-backend.railway.app`

---

## 3. Despliegue On-Premise (Linux + Systemd + Nginx)

Ver guía completa: `GUIA_ON_PREMISE.md` o `../03-DOCUMENTACION/06_GUIA_ON_PREMISE.md`

### Resumen rápido:

```bash
# 1. Servidor Ubuntu 22.04 LTS
sudo apt update && sudo apt install -y python3.12 python3.12-venv mysql-server nginx certbot python3-certbot-nginx git

# 2. Clonar y configurar
cd /opt && sudo git clone <repo> sigai-ses && cd sigai-ses
cd Backend && python3.12 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# 3. BD local
sudo mysql -u root -p -e "CREATE DATABASE sigai_ses CHARACTER SET utf8mb4; CREATE USER 'sigai'@'localhost' IDENTIFIED BY 'pass'; GRANT ALL ON sigai_ses.* TO 'sigai'@'localhost';"

# 4. Variables
cp .env.example .env
# Editar: DATABASE_URL=mysql+aiomysql://sigai:pass@localhost:3306/sigai_ses

# 5. Migraciones y admin
alembic upgrade head
python scripts/init_db.py

# 6. Systemd service
sudo tee /etc/systemd/system/sigai-backend.service > /dev/null <<'EOF'
[Unit]
Description=SIGAI-SES Backend
After=network.target mysql.service

[Service]
Type=simple
User=sigai
WorkingDirectory=/opt/sigai-ses/Backend
Environment=PATH=/opt/sigai-ses/Backend/.venv/bin:/usr/bin
ExecStart=/opt/sigai-ses/Backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo useradd -r -s /bin/false sigai
sudo chown -R sigai:sigai /opt/sigai-ses
sudo systemctl daemon-reload && sudo systemctl enable --now sigai-backend

# 7. Frontend build
cd ../Frontend && npm ci && npm run build

# 8. Nginx + SSL
sudo certbot --nginx -d sigai.tudominio.com
```

---

## 4. EXE Standalone (Windows - Sin Docker)

Genera un `.exe` portable con Frontend + Backend integrado.

### 4.1 Requisitos para Compilar

- Windows 10/11
- Python 3.11+
- Node.js 18+
- Backend/.env configurado con BD (Supabase recomendado)

### 4.2 Compilar

```bash
# En la raíz del proyecto
python build_all.py

# Tiempo: 3-8 minutos
# Genera: Backend/dist/SIGAI-SES.exe
```

### 4.3 Comportamiento del .exe

- **Primera ejecución:** Crea acceso directo en Escritorio "SIGAI-SES"
- **Siempre:** Abre navegador en `http://localhost:8000` (login)
- **Conexión:** Usa BD configurada en Backend/.env (Supabase o local)
- **No requiere:** Docker, Python, Node.js en la máquina destino

### 4.4 Distribuir

```bash
# Copiar solo el .exe
Backend/dist/SIGAI-SES.exe

# El usuario destino:
# 1. Doble clic en SIGAI-SES.exe
# 2. Se abre terminal + navegador en login
# 3. Credenciales: admin@securitas.com / password de .env
```

### 4.5 Archivos Involucrados

| Archivo | Función |
|---------|---------|
| `build_all.py` | Script único de compilación |
| `Backend/run.py` | Entry point - crea shortcut + abre navegador |
| `Backend/backend.spec` | Configuración PyInstaller |
| `Backend/app/main.py` | Sirve frontend compilado como estáticos |

---

## 5. APK Android (Capacitor)

Genera APK nativo que conecta a backend en la nube.

### 5.1 Requisitos

- Android Studio (con SDK API 34+)
- Node.js 18+
- Backend desplegado en la nube (Railway/Render)

### 5.2 Pasos

```bash
# 1. Backend en Railway (gratis)
#    railway.app > Deploy from GitHub > Backend/
#    Variables: DATABASE_URL (Supabase), SECRET_KEY, CORS_ALLOWED_ORIGINS=*
#    Guarda la URL: https://sigai-ses-backend.railway.app

# 2. Configurar Frontend
cd Frontend
echo "VITE_API_BASE_URL=https://sigai-ses-backend.railway.app/api/v1" > .env.production

# 3. Build y sincronizar Capacitor
npm run cap:build
# Ejecuta: npm run build -> npx cap copy -> npx cap sync

# 4. Abrir en Android Studio
npx cap open android

# 5. En Android Studio:
#    Build > Build Bundle(s)/APK(s) > Build APK(s)
#    APK generado: android/app/build/outputs/apk/debug/app-debug.apk
```

### 5.3 Probar APK

- **Celular real:** Copiar .apk > Permitir orígenes desconocidos > Instalar
- **Emulador:** Botón ▶️ Run en Android Studio

---

## 6. Variables de Entorno - Referencia Completa

### Raíz (.env para Docker Compose)

```env
# ────── BASE DE DATOS ──────
DB_ROOT_PASSWORD=          # Requerido - 32 chars hex
DB_NAME=sigai_ses          # Opcional
DB_USER=sigai              # Opcional
DB_PASSWORD=               # Requerido - 32 chars hex
DB_PORT=3306               # Opcional

# ────── JWT ──────
SECRET_KEY=                # REQUERIDO - 64 chars hex
ALGORITHM=HS256            # Opcional
ACCESS_TOKEN_EXPIRE_MINUTES=480  # Opcional

# ────── CORS ──────
CORS_ALLOWED_ORIGINS=      # Requerido - dominios separados por coma SIN espacios
# Ej: https://sigai.miempresa.com,http://localhost

# ────── ADMIN ──────
ADMIN_EMAIL=               # Requerido
ADMIN_PASSWORD=            # Requerido
ADMIN_NAME=Administrador SIGAI
ADMIN_CEDULA=0000000000
ADMIN_CODIGO=ADM001

# ────── BACKEND ──────
UVICORN_WORKERS=4          # 2-4 por core CPU
LOG_DIR=/app/logs
TZ=America/Bogota

# ────── FRONTEND ──────
VITE_API_URL=              # URL pública del API (ej: https://api.miempresa.com)
VITE_APP_TITLE=SIGAI-SES

# ────── SSL (Opcional) ──────
# SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
# SSL_KEY_PATH=/etc/nginx/ssl/key.pem
# FORCE_HTTPS=true

# ────── BACKUP (Opcional) ──────
# BACKUP_SCHEDULE=0 2 * * *
# BACKUP_RETENTION_DAYS=30
# BACKUP_PATH=/app/Backups
```

### Backend/.env (para desarrollo local sin Docker)

```env
DATABASE_URL=mysql+aiomysql://user:pass@host:3306/db
DATABASE_URL_SYNC=mysql+pymysql://user:pass@host:3306/db
# O PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=...
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:5173
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

### Frontend/.env

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
# Producción:
# VITE_API_BASE_URL=https://api.miempresa.com/api/v1
```

---

## 7. SSL/TLS con Let's Encrypt

### 7.1 Docker Compose (Nginx en contenedor)

```bash
# 1. Crear directorio para certificados
mkdir -p ssl

# 2. Obtener certificado (primera vez, modo standalone)
sudo certbot certonly --standalone -d sigai.tudominio.com

# 3. Copiar a proyecto
sudo cp /etc/letsencrypt/live/sigai.tudominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/sigai.tudominio.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*

# 4. Descomentar sección SSL en nginx.conf y reiniciar
docker compose restart nginx
```

### 7.2 Renovación Automática

```bash
# Certbot ya configura timer systemd
# Verificar:
sudo certbot renew --dry-run

# Para Docker, usar hook de renovación:
# En /etc/letsencrypt/renewal-hooks/deploy/docker-reload.sh:
#!/bin/bash
cd /ruta/proyecto && docker compose restart nginx
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/docker-reload.sh
```

### 7.3 On-Premise (Nginx Host)

```bash
sudo certbot --nginx -d sigai.tudominio.com
# Certbot configura renovación automática (timer cada 12h)
```

---

## 8. Backup y Recuperación

### 8.1 Backup Manual

```bash
# Docker Compose
docker compose exec backend python -m scripts.backup_db

# On-Premise
/opt/sigai-ses/Backend/.venv/bin/python /opt/sigai-ses/Backend/scripts/backup_db.py
```

### 8.2 Backup Automático

**Linux (cron):**
```bash
crontab -e
0 2 * * * cd /opt/sigai-ses && docker compose exec -T backend python -m scripts.backup_db >> logs/backup.log 2>&1
```

**Windows (Task Scheduler):**
```powershell
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NoProfile -Command "cd C:\ruta\Proyecto_SES; docker compose exec -T backend python -m scripts.backup_db"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SIGAI-Backup-DB"
```

### 8.3 Restaurar Backup

```bash
# 1. Detener servicios
docker compose down

# 2. Restaurar BD (desde archivo .sql)
docker compose up -d db
docker compose exec -T db mysql -u sigai -p sigai_ses < backup_2026-09-22.sql

# 3. Levantar resto
docker compose up -d
```

---

## 9. Monitoreo y Mantenimiento

### 9.1 Health Checks

```bash
# API Health
curl http://localhost/health
curl http://localhost:8000/health
curl http://localhost:8000/health/db

# Docker
docker compose ps
docker stats
```

### 9.2 Logs Estructurados

```bash
# Docker
docker compose logs -f backend

# Archivos (en host)
tail -f logs/app.log
tail -f logs/error.log
tail -f logs/access.log
```

### 9.3 Actualización del Sistema

```bash
# Docker
cd /opt/sigai-ses
git pull
docker compose build --no-cache
docker compose up -d

# On-Premise
cd /opt/sigai-ses
git pull
cd Backend && source .venv/bin/activate && pip install -r requirements.txt && alembic upgrade head
sudo systemctl restart sigai-backend
cd ../Frontend && npm ci && npm run build
sudo systemctl reload nginx
```

### 9.4 Limpieza Docker

```bash
# Eliminar imágenes no usadas
docker image prune -a

# Eliminar volúmenes huérfanos
docker volume prune

# Ver uso de disco
docker system df
```

---

## 10. Troubleshooting

### Error: "docker compose up" falla - puerto ocupado
```bash
# Ver qué usa el puerto
netstat -ano | findstr :80
# Matar proceso o cambiar puerto en docker-compose.yml
```

### Backend "unhealthy" / reinicia constantemente
```bash
docker compose logs backend
# Verificar: DATABASE_URL, SECRET_KEY, credenciales BD
# Fix .env → docker compose restart backend
```

### CORS Error en navegador
```bash
# Agregar dominio a CORS_ALLOWED_ORIGINS en .env
# Reiniciar: docker compose restart backend
```

### Frontend 404 al recargar (SPA)
```bash
# Verificar nginx.conf tiene: try_files $uri $uri/ /index.html;
# En Docker: ya incluido en Frontend/nginx.conf
```

### "Access denied" Base de Datos
```bash
# Verificar que DB_PASSWORD en .env coincide con MYSQL_PASSWORD en docker-compose.yml
# Para BD externa: verificar usuario/host/password en proveedor cloud
```

### SSL/HTTPS no funciona
```bash
# Verificar certificados en ./ssl/
# Verificar nginx.conf sección SSL descomentada
# Verificar puertos 80/443 abiertos en firewall
```

### EXE no se abre / se cierra inmediatamente
```bash
# Ejecutar desde terminal para ver logs
cd Backend\dist
.\SIGAI-SES.exe
```

### APK "La aplicación no se instaló"
```bash
# Android: Ajustes > Seguridad > Instalar apps desconocidas > Permitir origen
# Mínimo Android 8.0+
# APK debug puede ser bloqueado → usar APK firmado (release)
```

---

## Checklist Pre-Producción

- [ ] `.env` configurado con valores reales (NO defaults)
- [ ] `SECRET_KEY` única y segura (64 chars hex)
- [ ] `DB_ROOT_PASSWORD` y `DB_PASSWORD` seguros (32 chars hex)
- [ ] `CORS_ALLOWED_ORIGINS` solo dominios reales
- [ ] `ADMIN_PASSWORD` cambiado tras primer login
- [ ] HTTPS configurado (Let's Encrypt o Cloudflare)
- [ ] Backup automático programado (diario 2 AM)
- [ ] Firewall: solo 80, 443, 22 expuestos
- [ ] Logs rotando (logrotate / Docker logging driver)
- [ ] Pruebas: login, listar inventario, crear garantía, generar reporte
- [ ] Documentación PDF accesible al equipo

---

**SIGAI-SES v1.0.0** • Securitas Colombia S.A. • Unidad de Seguridad Electrónica (SES)
Septiembre 2026
