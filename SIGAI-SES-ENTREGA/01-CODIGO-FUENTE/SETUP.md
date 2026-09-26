# =============================================================================
# SIGAI-SES - Guía de Instalación
# =============================================================================
# Este archivo explica cómo configurar la aplicación en cualquier servidor.
# =============================================================================


## REQUISITOS

- Docker >= 20.10
- Docker Compose >= 2.0 (plugin `docker compose`)
- Conexión a internet (para descargar imágenes)

---

## INSTALACIÓN RÁPIDA (5 minutos)

### Paso 1: Clonar o copiar el proyecto

```bash
git clone <url-del-repositorio>
cd Proyecto_SES
```

### Paso 2: Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env
```

**Valores MÍNIMOS a cambiar en `.env`:**

| Variable | Qué es | Ejemplo |
|----------|--------|---------|
| `DB_ROOT_PASSWORD` | Password del root de MariaDB | `a1b2c3d4e5f6...` (32 hex) |
| `DB_USER` | Usuario de la BD | `sigai` |
| `DB_PASSWORD` | Password del usuario | `f6e5d4c3b2a1...` (32 hex) |
| `SECRET_KEY` | Clave secreta para JWT | Generar con el comando de abajo |
| `ADMIN_EMAIL` | Email del primer admin | `admin@tudominio.com` |
| `ADMIN_PASSWORD` | Password del admin | `Admin123!` |
| `CORS_ALLOWED_ORIGINS` | Dominios permitidos | `https://tudominio.com,http://localhost` |
| `VITE_API_URL` | URL pública del API | `https://tudominio.com` |

**Generar SECRET_KEY seguro:**

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

### Paso 3: Iniciar la aplicación

```bash
# Producción (MariaDB local en Docker)
docker compose up -d

# Desarrollo (hot reload)
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Con Supabase/BD externa (PostgreSQL en la nube)
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d
```

### Paso 4: Verificar que funciona

```bash
# Ver logs del backend
docker compose logs -f backend

# Buscar la línea:
# "Inicialización completada exitosamente"
```

### Paso 5: Acceder

- **Frontend:** http://tu-servidor
- **API:** http://tu-servidor:8000
- **Health Check:** http://tu-servidor/health
- **Credenciales:** admin@tudominio.com / password configurado

---

## CONFIGURAR EN DIFERENTES PROVEEDORES


### AWS (EC2 + RDS MariaDB)

1. **Crear instancia EC2:**
   - AMI: Amazon Linux 2023 o Ubuntu 22.04
   - Tipo: t3.medium (mínimo)
   - Security Group: Abrir puertos 22, 80, 443

2. **Crear RDS MariaDB:**
   - Engine: MariaDB 10.11
   - Instance: db.t3.micro (mínimo)
   - Security Group: Permitir conexión desde la EC2
   - Anotar el endpoint: `mi-db.xxxxx.us-east-1.rds.amazonaws.com`

3. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql://admin:password@mi-db.xxxxx.us-east-1.rds.amazonaws.com:3306/sigai_ses
   SECRET_KEY=tu-clave-secreta-aqui
   CORS_ALLOWED_ORIGINS=https://tudominio.com
   ADMIN_EMAIL=admin@tudominio.com
   ADMIN_PASSWORD=TuPasswordSegura!
   ```

4. **Instalar Docker en la EC2:**
   ```bash
   sudo yum update -y
   sudo yum install docker -y
   sudo service docker start
   sudo usermod -aG docker ec2-user

   # Instalar Docker Compose plugin
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

5. **Copiar el proyecto y ejecutar:**
   ```bash
   # Copiar archivos via SCP
   scp -r Proyecto_SES ec2-user@tu-ip:~/

   # Conectar y ejecutar
   ssh ec2-user@tu-ip
   cd ~/Proyecto_SES
   # Usar override para BD externa
   cp docker-compose.supabase.yml docker-compose.override.yml
   # Editar .env con DATABASE_URL de RDS
   docker compose up -d
   ```


### Azure (VM + Azure Database for MariaDB)

1. **Crear Azure Database for MariaDB:**
   - Ir a Azure Portal > MariaDB
   - Crear servidor con credenciales seguras
   - Anotar: `mimariadb.mariadb.database.azure.com`

2. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql://adminUsuario@mimariadb.mariadb.database.azure.com:3306/sigai_ses
   SECRET_KEY=tu-clave-secreta-aqui
   CORS_ALLOWED_ORIGINS=https://tudominio.com
   ADMIN_EMAIL=admin@tudominio.com
   ADMIN_PASSWORD=TuPasswordSegura!
   ```

3. **Desplegar:**
   - Usar Azure CLI o Docker en VM de Azure
   - O usar Azure App Service con Docker


### Google Cloud (GCE + Cloud SQL)

1. **Crear Cloud SQL:**
   - Ir a Console > SQL
   - Crear instancia MariaDB
   - Anotar la IP privada

2. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql://root:password@IP_PRIVADA:3306/sigai_ses
   SECRET_KEY=tu-clave-secreta-aqui
   CORS_ALLOWED_ORIGINS=https://tudominio.com
   ADMIN_EMAIL=admin@tudominio.com
   ADMIN_PASSWORD=TuPasswordSegura!
   ```


### DigitalOcean (Droplet + Managed Database)

1. **Crear Managed Database:**
   - Ir a Control Panel > Databases
   - Crear cluster MariaDB
   - Anotar el connection string

2. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql://doadmin:password@db-mibase-do-user-XXXX.db.ondigitalocean.com:3306/sigai_ses
   SECRET_KEY=tu-clave-secreta-aqui
   CORS_ALLOWED_ORIGINS=https://tudominio.com
   ADMIN_EMAIL=admin@tudominio.com
   ADMIN_PASSWORD=TuPasswordSegura!
   ```


### Render (Backend) + Supabase (BD) - **GRATIS**

1. **Supabase (Base de datos PostgreSQL gratis 500MB):**
   - Ir a https://supabase.com, crear proyecto
   - Settings > Database > Connection string > Session Pooler
   - Copiar URI y reemplazar `postgresql://` por `postgresql+asyncpg://`

2. **Render (Backend gratis 500h/mes):**
   - Ir a https://render.com, New Web Service
   - Conectar GitHub, seleccionar carpeta `Backend/`
   - Render detecta Dockerfile automáticamente
   - En **Environment Variables** agregar:
     ```
     DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
     SECRET_KEY=tu-clave-secreta-aqui
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=480
     CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
     ```

3. **Frontend (Vercel/Netlify gratis):**
   - Conectar repo, carpeta `Frontend/`
   - Build command: `npm run build`
   - Output: `dist`
   - Variable: `VITE_API_URL=https://tu-backend.onrender.com`


### Railway (Backend) + Supabase (BD) - **GRATIS**

1. **Supabase:** Igual que arriba
2. **Railway:**
   - Ir a https://railway.app, New Project > Deploy from GitHub
   - Seleccionar repo, carpeta `Backend/`
   - Variables:
     ```
     DATABASE_URL=postgresql+asyncpg://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres
     SECRET_KEY=tu-clave-secreta-aqui
     CORS_ALLOWED_ORIGINS=*
     ```
   - Railway da URL: `https://sigai-ses-backend.railway.app`


### Servidor Local / On-Premise (Linux)

1. **Instalar Docker:**
   - Ubuntu/Debian: `sudo apt install docker.io docker-compose-plugin`
   - RHEL/Fedora: `sudo dnf install docker docker-compose-plugin`
   - Iniciar: `sudo systemctl enable --now docker`

2. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql://sigai:su_password@localhost:3306/sigai_ses
   SECRET_KEY=tu-clave-secreta-aqui
   CORS_ALLOWED_ORIGINS=http://localhost
   ADMIN_EMAIL=admin@securitas.com
   ADMIN_PASSWORD=Admin123!
   ```

3. **Ejecutar:**
   ```bash
   docker compose up -d
   ```

4. **Para producción real con dominio + SSL:**
   Ver: `GUIA_ON_PREMISE.md` (Nginx + Systemd + Let's Encrypt)


---

## COMANDOS ÚTILES

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Reiniciar un servicio
docker compose restart backend

# Reiniciar todo
docker compose restart

# Detener todo
docker compose down

# ⚠️ DETENER Y ELIMINAR DATOS (incluye base de datos)
docker compose down -v

# Reconstruir después de cambios
docker compose build --no-cache
docker compose up -d

# Crear usuario admin manualmente
docker compose exec backend python -m scripts.seed_admin

# Backup de la BD
docker compose exec backend python -m scripts.backup_db

# Ejecutar alertas manualmente
docker compose exec backend python -m scripts.scheduler_alerts

# Ejecutar migraciones
docker compose exec backend alembic upgrade head

# Ver uso de recursos
docker stats
```

---

## CRON JOBS (TAREAS AUTOMÁTICAS)

### Backup diario a las 2 AM

```bash
# Linux/Mac - editar crontab
crontab -e

# Agregar esta línea:
0 2 * * * cd /ruta/a/Proyecto_SES && docker compose exec -T backend python -m scripts.backup_db >> logs/backup.log 2>&1
```

### Evaluación de alertas cada 30 minutos

```bash
# En crontab:
*/30 * * * * cd /ruta/a/Proyecto_SES && docker compose exec -T backend python -m scripts.scheduler_alerts >> logs/alerts.log 2>&1
```

### Windows Task Scheduler (PowerShell)

```powershell
# Backup diario 2 AM
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NoProfile -Command "cd C:\ruta\Proyecto_SES; docker compose exec -T backend python -m scripts.backup_db"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SIGAI-Backup-DB" -Description "Backup diario SIGAI-SES BD"

# Alertas cada 30 min
$action2 = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NoProfile -Command "cd C:\ruta\Proyecto_SES; docker compose exec -T backend python -m scripts.scheduler_alerts"'
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -Action $action2 -Trigger $trigger2 -TaskName "SIGAI-Alertas" -Description "Evaluación alertas cada 30 min"
```

---

## TROUBLESHOOTING

### La BD no conecta
```bash
docker compose logs db
# Verificar que MariaDB está corriendo y accepting connections
```

### El backend no inicia
```bash
docker compose logs backend
# Buscar errores de conexión a BD o variables faltantes
```

### Error 502 en el navegador
```bash
docker compose ps
# Verificar que todos los servicios están "Up"
docker compose logs nginx
```

### No puedo acceder desde fuera
```bash
# Verificar firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar que nginx escucha en 0.0.0.0:80
docker compose exec nginx netstat -tlnp
```

### Frontend no carga (página en blanco)
```bash
# Verificar que el build se copió correctamente
docker compose exec frontend ls -la /usr/share/nginx/html/
# Verificar nginx config
docker compose exec nginx nginx -t
```

---

## SEGURIDAD

1. **Cambiar passwords por defecto** antes de producción
2. **Usar HTTPS** (configurar SSL en nginx o usar Cloudflare)
3. **Restringir CORS** solo a tu dominio
4. **No exponer el puerto 3306** de MariaDB al exterior
5. **Hacer backups regulares** de la base de datos
6. **Mantener Docker actualizado** (`docker compose pull && docker compose up -d`)

---

## ARCHIVOS DE CONFIGURACIÓN IMPORTANTES

| Archivo | Descripción |
|---------|-------------|
| `.env` | Variables de entorno principales (NO SUBIR A GIT) |
| `docker-compose.yml` | Orquestación producción |
| `docker-compose.override.yml` | Desarrollo local (hot reload) |
| `docker-compose.supabase.yml` | Override para BD externa |
| `nginx.conf` | Reverse proxy, rate limiting, SSL |
| `Backend/Dockerfile` | Imagen backend multi-stage |
| `Frontend/Dockerfile` | Imagen frontend multi-stage |
| `Frontend/nginx.conf` | Nginx para SPA (React Router) |

---

## SOPORTE

| Nivel | Contacto | Canal |
|-------|----------|-------|
| **Nivel 1** (Operación) | Admin SIGAI local | Logs + reinicio contenedores |
| **Nivel 2** (Técnico) | Equipo Desarrollo Securitas | GitHub Issues / Teams |
| **Nivel 3** (Crítico) | Arquitecto Proyecto | Llamada directa + War Room |
