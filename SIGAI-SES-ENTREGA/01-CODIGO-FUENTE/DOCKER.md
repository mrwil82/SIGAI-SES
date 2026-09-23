# SIGAI-SES - Despliegue con Docker

## Instalacion en 5 pasos

### 1. Copiar el proyecto al servidor
```bash
scp -r Proyecto_SES usuario@tu-servidor:~/
```

### 2. Configurar variables
```bash
cd ~/Proyecto_SES
cp .env.example .env
nano .env  # Editar con tus valores
```

### 3. Levantar servicios
```bash
docker-compose up -d
```

### 4. Verificar
```bash
docker-compose logs -f backend
# Esperar: "Inicializacion completada exitosamente."
```

### 5. Acceder
- URL: http://tu-servidor
- Email: admin@tudominio.com
- Password: Admin123!

---

## Archivos de configuracion

| Archivo | Que configurar |
|---------|---------------|
| `.env` | Todos los valores (BD, JWT, admin) |
| `docker-compose.yml` | Puertos, volumenes (opcional) |
| `nginx.conf` | Dominio SSL (opcional) |

---

## Variables obligatorias en `.env`

```
DB_ROOT_PASSWORD=password-seguro-del-root
DB_USER=sigai
DB_PASSWORD=password-seguro-del-usuario
SECRET_KEY=clave-aleatoria-para-jwt
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=password-del-admin
```

---

## Comandos basicos

```bash
docker-compose up -d          # Iniciar
docker-compose down            # Detener
docker-compose logs -f         # Ver logs
docker-compose restart backend # Reiniciar backend
docker-compose ps              # Ver estado
```

---

## Backup automatico

```bash
# Ejecutar backup manual
docker-compose exec backend python -m scripts.backup_db

# Programar backup diario (crontab)
0 2 * * * cd ~/Proyecto_SES && docker-compose exec -T backend python -m scripts.backup_db >> logs/backup.log 2>&1
```
