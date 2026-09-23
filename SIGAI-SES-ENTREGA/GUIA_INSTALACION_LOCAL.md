# 🚀 GUÍA DE INSTALACIÓN LOCAL (SIN DOCKER)

> **Para entornos de desarrollo, testing o servidores sin Docker**

---

## 📋 REQUISITOS PREVIOS

| Herramienta | Versión Mínima | Descarga |
|-------------|----------------|----------|
| **Node.js** | 18+ | https://nodejs.org |
| **Python** | 3.12+ | https://python.org |
| **MariaDB/MySQL** | 10.4+ / 8.0+ | https://mariadb.org / https://mysql.com |
| **Git** | 2.30+ | https://git-scm.com |

---

## 🗄️ 1. BASE DE DATOS

### Opción A: MariaDB Local (Recomendado)
```bash
# Windows (Chocolatey)
choco install mariadb

# O descargar instalador de mariadb.org
# Durante instalación: recordar root password

# Crear BD y usuario
mysql -u root -p
CREATE DATABASE sigai_ses CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sigai'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON sigai_ses.* TO 'sigai'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Opción B: Usar script SQL incluido
```bash
mysql -u root -p sigai_ses < 04-BASE-DATOS/sigai_ses_db.sql
```

---

## ⚙️ 2. BACKEND (FastAPI)

```bash
cd 01-CODIGO-FUENTE/Backend

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales:
# DATABASE_URL=mysql+aiomysql://sigai:tu_password@localhost:3306/sigai_ses
# SECRET_KEY=tu_clave_secreta_32_chars
# CORS_ALLOWED_ORIGINS=http://localhost:5173
# ADMIN_EMAIL=admin@tudominio.com
# ADMIN_PASSWORD=Admin123!

# Ejecutar migraciones
alembic upgrade head

# Crear usuario admin
python -m scripts.seed_admin

# Iniciar servidor (desarrollo)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Iniciar servidor (producción)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Verificar:** http://localhost:8000/docs

---

## 🌐 3. FRONTEND (React + Vite)

```bash
cd 01-CODIGO-FUENTE/Frontend

# Instalar dependencias (PRIMERA VEZ OBLIGATORIO)
npm install

# Configurar variables de entorno
copy .env.example .env
# Editar .env:
# VITE_API_URL=http://localhost:8000

# Desarrollo (con hot reload)
npm run dev
# Abre: http://localhost:5173

# Producción (build estático)
npm run build
# Genera carpeta dist/ lista para servir con Nginx/Apache
```

---

## 🔧 4. NGINX (Reverse Proxy - Opcional pero recomendado)

```nginx
# nginx.conf (incluido en 01-CODIGO-FUENTE/)
server {
    listen 80;
    server_name localhost;

    # Frontend estático
    location / {
        root /ruta/a/01-CODIGO-FUENTE/Frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📱 5. INSTALADORES LISTOS (02-INSTALADORES/)

| Plataforma | Archivo | Uso |
|------------|---------|-----|
| **Windows** | `SIGAI-SES-Setup-1.0.0.exe` | Instalador completo (Inno Setup) |
| **Windows Portable* | Ver abajo | Ejecutar backend+frontend manualmente |
| **Android** | `SIGAI-SES-1.0.0-debug.apk` | Instalar en dispositivo/emulador |

### *Versión "Portable" Windows (Sin instalador)
```bash
# 1. Backend
cd 01-CODIGO-FUENTE\Backend
.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Frontend (en otra terminal)
cd 01-CODIGO-FUENTE\Frontend
npm run build
npx serve -s dist -l 3000
# O usar Python: python -m http.server 3000 -d dist

# 3. Acceder: http://localhost:3000
```

---

## 🔐 VARIABLES DE ENTORNO CRÍTICAS (.env)

```env
# Backend (.env en 01-CODIGO-FUENTE/Backend/)
DATABASE_URL=mysql+aiomysql://sigai:password@localhost:3306/sigai_ses
SECRET_KEY=generar_con_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_EMAIL=admin@securitas.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administrador SIGAI

# Frontend (.env en 01-CODIGO-FUENTE/Frontend/)
VITE_API_URL=http://localhost:8000
```

**Generar SECRET_KEY:**
```bash
# PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# Linux/Mac
openssl rand -hex 32
```

---

## ✅ CHECKLIST DE VERIFICACIÓN LOCAL

- [ ] MariaDB corriendo en puerto 3306
- [ ] BD `sigai_ses` creada y accesible
- [ ] Backend responde en http://localhost:8000/health
- [ ] Swagger UI en http://localhost:8000/docs
- [ ] Frontend compila sin errores (`npm run build`)
- [ ] Frontend accesible en http://localhost:5173 (dev) o 3000 (prod)
- [ ] Login funciona: admin@securitas.com / Admin123!
- [ ] CORS configurado correctamente

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

| Error | Solución |
|-------|----------|
| `vite: command not found` | Ejecutar `npm install` en Frontend/ |
| `ModuleNotFoundError: pymysql` | `pip install -r requirements.txt` en Backend/ |
| `Access denied for user` | Verificar credenciales en .env y permisos en MariaDB |
| `CORS error` | Agregar origen en `CORS_ALLOWED_ORIGINS` |
| `Port 8000 in use` | Cambiar puerto en uvicorn o matar proceso |

---

## 📞 SOPORTE

- **Logs Backend:** `Backend/logs/app.log`
- **Logs Frontend:** Consola del navegador (F12)
- **Documentación completa:** `03-DOCUMENTACION/PDFs/`

---

**SIGAI-SES v1.0.0** - Securitas Colombia S.A.
