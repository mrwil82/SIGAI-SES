---
title: "Guia de Despliegue On-Premise -- SIGAI-SES"
---


# Guia de Despliegue On-Premise -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![OS](https://img.shields.io/badge/OS-Ubuntu%2022.04-orange?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Nginx%20%E2%86%92%20FastAPI%20%E2%86%92%20MySQL-6DB33F?style=for-the-badge)
![SSL](https://img.shields.io/badge/SSL-Let's%20Encrypt-yellow?style=for-the-badge)

---

## Objetivo

> [!TIP]
> Esta guia describe el despliegue del sistema SIGAI-SES en un **servidor corporativo local (on-premise)** utilizando Nginx como reverse proxy, MySQL propio y certificados SSL con Let's Encrypt. Recomendada para clientes que requieren **control total sobre sus datos** e infraestructura propia.

---

## Arquitectura del Despliegue On-Premise

```
+-----------------------------------------------------------+
|                     Internet                               |
|                          |                                 |
|                    HTTPS :443                               |
|                          v                                 |
|            +---------------------------+                   |
|            |  Servidor Corporativo     |                   |
|            |  Ubuntu Server 22.04      |                   |
|            +---------------------------+                   |
|                          |                                 |
|        +-----------------+-----------------+               |
|        v                 v                  v              |
|  +----------+    +--------------+   +----------+           |
|  |  Nginx   |    |   FastAPI    |   |  MySQL   |           |
|  | Reverse  |--->|   Uvicorn    |   |   8.0    |           |
|  |  Proxy   |    |  :8000 (4w)  |   |  :3306   |           |
|  +----------+    +--------------+   +----------+           |
|       |                                                     |
|       v                                                     |
|  +----------+                                               |
|  | Frontend |                                               |
|  |  Build   |                                               |
|  | Estatico |                                               |
|  +----------+                                               |
|                                                              |
|  +----------------------------------------------------+     |
|  | Scripts de Mantenimiento                           |     |
|  |  * backup_db.py    -> Diario                        |     |
|  |  * trigger_alerts  -> Cada 30 min                   |     |
|  +----------------------------------------------------+     |
+-----------------------------------------------------------+
```

---

## Requisitos del Servidor

### Hardware Recomendado

| Recurso | Minimo | Recomendado |
|---------|-----------|----------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 50 GB SSD |
| Red | 100 Mbps | 1 Gbps |

### Software Requerido

| Componente | Version | Gestion |
|------------|---------|------|
| Sistema Operativo | Ubuntu Server **22.04 LTS** o superior | `apt` |
| Python | **3.12+** | `python3.12` |
| Node.js | **18+** (solo para build) | `npm` |
| MySQL | **8.0+** o MariaDB **10.5+** | `mysql-server` |
| Nginx | **1.24+** | `nginx` |
| Certbot | Ultima version (Let's Encrypt) | `certbot` |
| Git | Ultima version | `git` |

---

## Instalacion Paso a Paso

### 4.1 Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
sudo apt install -y python3.12 python3.12-venv python3-pip \
  mysql-server-8.0 nginx certbot python3-certbot-nginx \
  git curl wget

# Configurar MySQL
sudo mysql_secure_installation
sudo systemctl enable mysql
sudo systemctl start mysql
```

### 4.2 Clonar el repositorio

```bash
cd /opt
sudo git clone https://github.com/TU_USUARIO/proyecto-sigai-ses.git sigai-ses
cd sigai-ses
```

### 4.3 Configurar Backend

```bash
cd Backend

# Crear entorno virtual
python3.12 -m venv .venv
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
nano .env
```

> [!WARNING]
> **Configuracion de `.env` para produccion:**
> ```env
> DATABASE_URL=mysql+aiomysql://sigai:password_local@localhost:3306/sigai_ses_db
> SECRET_KEY=generar_con: openssl rand -hex 32
> ALGORITHM=HS256
> ACCESS_TOKEN_EXPIRE_MINUTES=480
> CORS_ALLOWED_ORIGINS=https://sigai.securitas.com.co
> ADMIN_EMAIL=admin@securitas.com
> ADMIN_PASSWORD=Admin123!
> BACKEND_PORT=8000
> ```

### 4.4 Configurar Base de Datos

```bash
# Crear base de datos y usuario
sudo mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS sigai_ses_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sigai'@'localhost' IDENTIFIED BY 'password_local';
GRANT ALL PRIVILEGES ON sigai_ses_db.* TO 'sigai'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Ejecutar migraciones
alembic upgrade head

# Verificar
python scripts/init_db.py
```

### 4.5 Configurar Servicio Systemd (Backend)

<details>
<summary>Ver configuracion del servicio systemd</summary>

Crear archivo `/etc/systemd/system/sigai-backend.service`:

```ini
[Unit]
Description=SIGAI-SES Backend (FastAPI)
After=network.target mysql.service

[Service]
Type=simple
User=sigai
Group=sigai
WorkingDirectory=/opt/sigai-ses/Backend
Environment=PATH=/opt/sigai-ses/Backend/.venv/bin:/usr/bin
ExecStart=/opt/sigai-ses/Backend/.venv/bin/uvicorn app.main:app \
  --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Crear usuario del sistema
sudo useradd -r -s /bin/false sigai
sudo chown -R sigai:sigai /opt/sigai-ses

# Habilitar e iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable sigai-backend
sudo systemctl start sigai-backend
sudo systemctl status sigai-backend
```

</details>

### 4.6 Construir Frontend

```bash
cd /opt/sigai-ses/Frontend

# Instalar dependencias
npm ci

# Configurar .env
cp .env.example .env
echo "VITE_API_BASE_URL=/api/v1" > .env

# Build de produccion
npm run build

# El build se genera en Frontend/dist/
```

### 4.7 Configurar Nginx

<details>
<summary>Ver configuracion completa de Nginx</summary>

Crear archivo `/etc/nginx/sites-available/sigai-ses`:

```nginx
server {
    listen 80;
    server_name sigai.securitas.com.co;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sigai.securitas.com.co;

    # SSL (generar con certbot)
    ssl_certificate /etc/letsencrypt/live/sigai.securitas.com.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sigai.securitas.com.co/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'" always;

    # Frontend (build estatico)
    root /opt/sigai-ses/Frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Archivos estaticos del backend
    location /static/ {
        alias /opt/sigai-ses/Backend/app/static/;
    }

    access_log /var/log/nginx/sigai-access.log;
    error_log /var/log/nginx/sigai-error.log;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/sigai-ses /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

</details>

### 4.8 Configurar SSL con Let's Encrypt

```bash
# Generar certificado SSL
sudo certbot --nginx -d sigai.securitas.com.co

# Verificar renovacion automatica
sudo certbot renew --dry-run
```

> [!NOTE]
> Certbot configura automaticamente la renovacion de certificados cada 60 dias. No necesitas hacer nada adicional.

---

## Verificacion

```bash
# Verificar servicios
sudo systemctl status sigai-backend
sudo systemctl status nginx
sudo systemctl status mysql

# Probar endpoints
curl -k https://sigai.securitas.com.co/api/v1/health
curl -k https://sigai.securitas.com.co/api/v1/health/db

# Probar frontend (abrir en navegador)
# https://sigai.securitas.com.co
```

| Check | Descripcion |
|----------|-------------|
| Backend | Respuesta 200 en `/api/v1/health` |
| Base de datos | Respuesta 200 en `/api/v1/health/db` |
| Frontend | Pagina carga sin errores en navegador |
| SSL | Certificado valido, HTTPS funcionando |

---

## Mantenimiento

### Respaldos automaticos (cron diario)

```bash
sudo crontab -e
# Anadir:
0 2 * * * /opt/sigai-ses/Backend/.venv/bin/python /opt/sigai-ses/Backend/scripts/backup_db.py
```

### Evaluacion de alertas (cron cada 30 min)

```bash
*/30 * * * * /opt/sigai-ses/Backend/.venv/bin/python /opt/sigai-ses/Backend/scripts/trigger_alerts.py
```

### Rotacion de logs

<details>
<summary>Ver configuracion de logrotate</summary>

```bash
sudo nano /etc/logrotate.d/sigai-backend
```

```
/opt/sigai-ses/Backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

</details>

### Actualizacion del sistema

```bash
cd /opt/sigai-ses
git pull origin main

# Backend
sudo systemctl stop sigai-backend
cd Backend
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl start sigai-backend

# Frontend
cd ../Frontend
npm ci
npm run build
sudo systemctl reload nginx
```

---

## Firewall (Puertos Requeridos)

| Puerto | Servicio | Requerido? |
|--------|----------|----------------|
| 22/tcp | SSH | Siempre |
| 80/tcp | HTTP (redireccion) | Siempre |
| 443/tcp | HTTPS | Siempre |
| 3306/tcp | MySQL | Solo si acceso remoto |

```bash
# Configurar UFW
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow 3306/tcp      # MySQL (solo si necesario)
sudo ufw enable
sudo ufw status verbose
```

---

## Estado del Despliegue

```
Preparacion  [============] 100%
Backend      [============] 100%
Base Datos   [============] 100%
Frontend     [============] 100%
Nginx        [============] 100%
SSL          [============] 100%
Firewall     [============  ]  80%
```

---

> [!TIP]
> **Recomendacion:** Despues del despliegue, programa una prueba de carga y verifica que todos los servicios respondan correctamente antes de ponerlo en produccion.

---

*Documento actualizado: Julio 2026 -- v1.0*
*Repositorio: [github.com/TU_USUARIO/proyecto-sigai-ses](https://github.com/TU_USUARIO/proyecto-sigai-ses)*
