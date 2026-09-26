# SIGAI-SES

Sistema Integral de Gestión de Activos e Inventario para el área de Seguridad Electrónica de Securitas Colombia.

## Descripción

Plataforma empresarial para la gestión, control y trazabilidad de activos tecnológicos, inventarios y procesos de garantías. Unifica operaciones de bodegas, laboratorios y técnicos en campo con visión 360° del ciclo de vida de cada equipo.

## Características Principales

- **Gestión de Inventario:** Control multiregional con trazabilidad individual por serial y placa
- **Ciclo de Garantías:** Seguimiento de estados con alertas automáticas de estancamiento
- **Importación Inteligente:** Procesamiento de Excel con normalización automática y lógica upsert
- **Reportes Masivos:** Generación de PDF/Excel con streaming para +30k registros
- **Seguridad:** Autenticación JWT, roles por regional, auditoría completa de cambios
- **PWA:** Instalable en móvil, funciona offline
- **EXE Standalone:** Frontend + Backend en un solo .exe para Windows
- **APK Android:** App nativa via Capacitor

## Stack Tecnológico

**Backend:** FastAPI (Python 3.12+) • SQLAlchemy asíncrono • MariaDB/MySQL/PostgreSQL • Alembic
**Frontend:** React + TypeScript • Vite • Tailwind CSS • Context API • PWA (Workbox)
**Despliegue:** Docker Compose • Nginx • Systemd (on-premise) • EXE (PyInstaller) • APK (Capacitor)

---

## 🚀 Instalación Rápida

### Opción 1: Docker Compose (Recomendado para Producción)

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones (VER SECUENCIA ABAJO)

# 2. Iniciar servicios
docker compose up -d

# 3. Verificar
docker compose logs -f backend
# Buscar: "Inicialización completada exitosamente"

# 4. Acceder
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Documentación API: http://localhost:8000/docs
```

### Opción 2: Docker Compose con Supabase (PostgreSQL en la nube)

```bash
# 1. Configurar para Supabase
cp .env.example .env
# Editar .env con DATABASE_URL de Supabase

# 2. Usar override para deshabilitar BD local
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### Opción 3: Desarrollo Local (Hot Reload)

```bash
# Requisitos: Python 3.12+ • Node.js 18+ • MySQL 8.0+

# Backend
cd Backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env  # Configurar BD local
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (en otra terminal)
cd Frontend
npm install
cp .env.example .env
npm run dev
```

### Opción 4: On-Premise (Linux + Systemd + Nginx)

Ver: `../03-DOCUMENTACION/06_GUIA_ON_PREMISE.md`

### Opción 5: EXE Standalone (Windows - Sin Docker)

```bash
# Requisitos: Python 3.11+ • Node.js 18+
# Configurar Backend/.env con BD (Supabase o local)
python build_all.py
# Genera: Backend/dist/SIGAI-SES.exe
```

### Opción 6: APK Android (Capacitor)

```bash
# Requisitos: Android Studio • Node.js 18+ • Backend en la nube (Railway)
cd Frontend
npm run cap:build
npx cap open android
# En Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s)
```

---

## ⚙️ Configuración de Variables de Entorno

### Archivo `.env` (Raíz - para Docker Compose)

```env
# BASE DE DATOS (MariaDB Docker)
DB_ROOT_PASSWORD=password_root_seguro_32_chars
DB_NAME=sigai_ses
DB_USER=sigai
DB_PASSWORD=password_usuario_seguro_32_chars

# JWT (OBLIGATORIO cambiar en producción)
SECRET_KEY=clave_secreta_64_chars_hex

# CORS (dominios permitidos, separados por coma SIN espacios)
CORS_ALLOWED_ORIGINS=https://sigai.miempresa.com,http://localhost

# ADMIN INICIAL (cambiar tras primer login)
ADMIN_EMAIL=admin@miempresa.com
ADMIN_PASSWORD=PasswordSeguro123!
ADMIN_NAME=Administrador SIGAI

# WORKERS (2-4 por core CPU)
UVICORN_WORKERS=4

# FRONTEND
VITE_API_URL=https://sigai.miempresa.com
```

### Generar claves seguras:

```bash
# SECRET_KEY (64 chars)
openssl rand -hex 32
# PowerShell: -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# DB_PASSWORD (32 chars)
openssl rand -hex 16
# PowerShell: -join ((1..16) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

---

## 📁 Estructura del Proyecto

```
SIGAI-SES-ENTREGA/
├── 01-CODIGO-FUENTE/          # Código completo + Docker + Scripts
│   ├── Backend/               # API FastAPI (Python 3.12)
│   ├── Frontend/              # React + TypeScript + Vite
│   ├── docker-compose.yml     # Orquestación PRODUCCIÓN (MariaDB)
│   ├── docker-compose.override.yml.example  # Desarrollo local
│   ├── docker-compose.supabase.yml          # Con Supabase (PostgreSQL)
│   ├── nginx.conf             # Reverse proxy principal
│   ├── .env.example           # Template variables producción
│   ├── deploy.ps1             # 👉 DESPLIEGUE 1-CLICK (Windows)
│   ├── DOCKER.md              # Guía Docker detallada
│   └── README.md              # Este archivo
├── 02-INSTALADORES/           # Instaladores nativos
│   ├── Windows/SIGAI-SES-Setup-1.0.0.exe
│   └── Android/SIGAI-SES-1.0.0-debug.apk
├── 03-DOCUMENTACION/          # Documentos técnicos (PDF + MD)
├── 04-BASE-DATOS/sigai_ses_db.sql  # Script SQL completo
└── 05-CI-CD/main.yml          # Pipeline GitHub Actions
```

---

## 🐳 Despliegue en Proveedores Cloud

### AWS (EC2 + RDS MariaDB)
```bash
# 1. EC2: Amazon Linux 2023, t3.medium+, SG: 22,80,443
# 2. RDS: MariaDB 10.11, db.t3.micro+, SG desde EC2
# 3. .env: DATABASE_URL=mysql+aiomysql://admin:pass@rds-endpoint:3306/sigai_ses
# 4. Instalar Docker en EC2 y ejecutar docker compose up -d
```

### Azure (VM + Azure Database for MariaDB)
```bash
# 1. Azure Database for MariaDB (Flexible Server)
# 2. VM Ubuntu 22.04, abrir puertos 22,80,443
# 3. .env: DATABASE_URL=mysql+aiomysql://admin@server:pass@server.mariadb.database.azure.com:3306/sigai_ses
# 4. docker compose up -d
```

### Google Cloud (GCE + Cloud SQL)
```bash
# 1. Cloud SQL: MariaDB 10.11, IP privada
# 2. GCE: Ubuntu 22.04, e2-medium+
# 3. .env: DATABASE_URL=mysql+aiomysql://root:pass@IP_PRIVADA:3306/sigai_ses
# 4. docker compose up -d
```

### DigitalOcean (Droplet + Managed Database)
```bash
# 1. Managed Database: MariaDB, anotar connection string
# 2. Droplet: Ubuntu 22.04, 2GB RAM+
# 3. .env con connection string de DO
# 4. docker compose up -d
```

### Render (Backend) + Supabase (BD) - GRATIS
```bash
# 1. Supabase: Nuevo proyecto gratis, copiar DATABASE_URL (Session Pooler)
# 2. Render: New Web Service > Docker > docker-compose.supabase.yml
# 3. Variables en Render: DATABASE_URL, SECRET_KEY, CORS_ALLOWED_ORIGINS
# 4. Frontend: Vercel/Netlify con VITE_API_URL=https://tu-backend.onrender.com
```

### Railway (Backend) + Supabase (BD) - GRATIS
```bash
# 1. Supabase: igual que arriba
# 2. Railway: Deploy from GitHub > Seleccionar Backend/
# 3. Variables: DATABASE_URL, SECRET_KEY, CORS_ALLOWED_ORIGINS=*
# 4. Frontend: Vercel con VITE_API_URL=https://tu-backend.railway.app
```

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| `DOCKER.md` | Guía detallada Docker Compose |
| `../03-DOCUMENTACION/05_GUIA_DESPLIEGUE_PRODUCCION.md` | Despliegue producción (SSL, dominios, scaling) |
| `../03-DOCUMENTACION/06_GUIA_ON_PREMISE.md` | Linux + Systemd + Nginx + Let's Encrypt |
| `../03-DOCUMENTACION/07_PROCEDIMIENTOS_BACKUP.md` | Backup/restore BD y archivos |
| `../03-DOCUMENTACION/01_MANUAL_TECNICO.md` | Arquitectura, API, BD, seguridad |
| `../03-DOCUMENTACION/02_MANUAL_ADMINISTRADOR.md` | Gestión usuarios, roles, configuración |

---

## 🔧 Comandos Útiles (Docker)

```bash
# Ver estado
docker compose ps

# Logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Reiniciar servicios
docker compose restart backend
docker compose restart

# Reconstruir tras cambios de código
docker compose build --no-cache backend
docker compose up -d

# Backup BD manual
docker compose exec backend python -m scripts.backup_db

# Ejecutar migraciones
docker compose exec backend alembic upgrade head

# Crear admin manualmente
docker compose exec backend python -m scripts.seed_admin

# Detener (mantiene datos)
docker compose down

# ⚠️ DETENER Y BORRAR TODO (incluye base de datos)
docker compose down -v
```

---

## 🔐 Seguridad en Producción

1. **Cambia TODOS los passwords por defecto** antes de exponer a internet
2. **Usa HTTPS** (Let's Encrypt + Nginx o Cloudflare)
3. **Restringe CORS** solo a tu dominio real
4. **No expongas puerto 3306** de MariaDB al exterior
5. **Configura backups automáticos** diarios
6. **Monitorea logs** y alertas de salud
7. **Actualiza imágenes Docker** regularmente

---

## 📞 Soporte

| Nivel | Contacto | Canal |
|-------|----------|-------|
| **Nivel 1** (Operación) | Admin SIGAI local | Logs + reinicio contenedores |
| **Nivel 2** (Técnico) | Equipo Desarrollo Securitas | GitHub Issues / Teams |
| **Nivel 3** (Crítico) | Arquitecto Proyecto | Llamada directa + War Room |

---

**Securitas Colombia S.A.** • Unidad de Seguridad Electrónica (SES)
Versión 1.0.0 • Septiembre 2026
