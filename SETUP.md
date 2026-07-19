# =============================================================================
# SIGAI-SES - Guia de Instalacion
# =============================================================================
# Este archivo explica como configurar la aplicacion en cualquier servidor.
# =============================================================================


## REQUISITOS

- Docker >= 20.10
- Docker Compose >= 2.0
- Conexion a internet


## INSTALACION RAPIDA (5 minutos)

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

**Valores MINIMOS a cambiar en `.env`:**

| Variable | Que es | Ejemplo |
|----------|--------|---------|
| `DB_ROOT_PASSWORD` | Password del root de MySQL | `MiPasswordSegura123!` |
| `DB_USER` | Usuario de la BD | `sigai` |
| `DB_PASSWORD` | Password del usuario | `MiPasswordSegura123!` |
| `SECRET_KEY` | Clave secreta para JWT | Generar con el comando de abajo |
| `ADMIN_EMAIL` | Email del primer admin | `admin@tudominio.com` |
| `ADMIN_PASSWORD` | Password del admin | `Admin123!` |

**Generar SECRET_KEY seguro:**

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

### Paso 3: Iniciar la aplicacion

```bash
docker-compose up -d
```

### Paso 4: Verificar que funciona

```bash
# Ver logs del backend
docker-compose logs -f backend

# Buscar la linea:
# "Inicializacion completada exitosamente."
```

### Paso 5: Acceder

- **Frontend:** http://tu-servidor
- **API:** http://tu-servidor/api/v1
- **Health Check:** http://tu-servidor/health
- **Credenciales:** admin@tudominio.com / Admin123!


## CONFIGURAR EN DIFERENTES PROVEEDORES


### AWS (EC2 + RDS)

1. **Crear instancia EC2:**
   - AMI: Amazon Linux 2023 o Ubuntu 22.04
   - Tipo: t3.medium (minimo)
   - Security Group: Abrir puertos 22, 80, 443

2. **Crear RDS MariaDB:**
   - Engine: MariaDB 10.4
   - Instance: db.t3.micro (minimo)
   - Security Group: Permitir conexion desde la EC2
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
   
   # Instalar Docker Compose
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
   docker-compose up -d
   ```


### Azure (App Service + Azure Database)

1. **Crear Azure Database for MariaDB:**
   - Ir a Azure Portal > MariaDB
   - Crear servidor con credenciales seguras
   - Anotar: `mimariadb.mariadb.database.azure.com`

2. **Configurar `.env`:**
   ```
   DATABASE_URL=mysql+aiomysql@adminAzure@mimariadb.mariadb.database.azure.com:3306/sigai_ses
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


### Servidor Local / On-Premise

1. **Instalar Docker:**
   - Windows: Docker Desktop
   - Mac: Docker Desktop
   - Linux: `sudo apt install docker.io docker-compose`

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
   docker-compose up -d
   ```


## COMANDOS UTILES

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar datos (CUIDADO: borra la BD)
docker-compose down -v

# Reconstruir despues de cambios
docker-compose build --no-cache
docker-compose up -d

# Crear usuario admin manualmente
docker-compose exec backend python -m scripts.seed_admin

# Backup de la BD
docker-compose exec backend python -m scripts.backup_db

# Ejecutar alertas manualmente
docker-compose exec backend python -m scripts.scheduler_alerts
```


## CRON JOBS (TAREAS AUTOMATICAS)

### Backup diario a las 2 AM

```bash
# Linux/Mac - editar crontab
crontab -e

# Agregar esta linea:
0 2 * * * cd /ruta/a/Proyecto_SES && docker-compose exec -T backend python -m scripts.backup_db >> logs/backup.log 2>&1
```

### Alertas cada 30 minutos

```bash
# En crontab:
*/30 * * * * cd /ruta/a/Proyecto_SES && docker-compose exec -T backend python -m scripts.scheduler_alerts >> logs/alerts.log 2>&1
```


## TROUBLESHOOTING

### La BD no conecta
```bash
docker-compose logs db
# Verificar que MariaDB esta corriendo y accepting connections
```

### El backend no inicia
```bash
docker-compose logs backend
# Buscar errores de conexion a BD o variables faltantes
```

### Error 502 en el navegador
```bash
docker-compose ps
# Verificar que todos los servicios estan "Up"
docker-compose logs nginx
```

### No puedo acceder desde fuera
```bash
# Verificar firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar que nginx escucha en 0.0.0.0:80
docker-compose exec nginx netstat -tlnp
```


## SEGURIDAD

1. **Cambiar passwords por defecto** antes de produccion
2. **Usar HTTPS** (configurar SSL en nginx o usar Cloudflare)
3. **Restringir CORS** solo a tu dominio
4. **No exponer el puerto 3306** de MySQL al exterior
5. **Hacer backups regulares** de la base de datos
