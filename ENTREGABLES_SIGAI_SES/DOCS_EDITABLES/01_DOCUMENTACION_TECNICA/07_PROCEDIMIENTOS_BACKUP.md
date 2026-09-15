---
title: "Procedimientos de Backup y Disaster Recovery -- SIGAI-SES"
---


# Procedimientos de Backup y Disaster Recovery -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![RPO](https://img.shields.io/badge/RPO-24%20horas-ff69b4?style=for-the-badge)
![RTO](https://img.shields.io/badge/RTO-4%20horas-orange?style=for-the-badge)
![Frequency](https://img.shields.io/badge/Backup-Diario-6DB33F?style=for-the-badge)

---

## Objetivo

> [!TIP]
> Establecer los procedimientos para la realizacion de **respaldos, restauracion y recuperacion ante desastres** del sistema SIGAI-SES, garantizando la **continuidad del servicio** y la **integridad de los datos**.

---

## Politicas de Respaldo

### Frecuencia y Retencion

| Tipo | Frecuencia | Retencion | Destino |
|------|---------------|--------------|------------|
| Backup completo BD | **Diaria** (02:00 AM) | 30 dias | Disco local + S3 opcional |
| Archivos estaticos | **Semanal** (Sabado) | 4 semanas | Disco local |
| Configuracion | **Mensual** | 6 meses | Disco local + Git |
| Logs | **Diaria** | 90 dias | Disco local |

### Objetivos de Recuperacion

| Metrica | Objetivo | Estado |
|---------|-------------|-----------|
| **RPO** (Punto de Recuperacion) | Maximo **24 horas** (pierde hasta 1 dia de datos) | Aceptable |
| **RTO** (Tiempo de Recuperacion) | Maximo **4 horas** para restauracion completa | Aceptable |

---

## Procedimiento de Backup

### 3.1 Backup de Base de Datos (Automatizado)

> [!NOTE]
> **Script:** `Backend/scripts/backup_db.py`

```bash
# Uso manual
cd /opt/sigai-ses/Backend
source .venv/bin/activate
python scripts/backup_db.py

# El script genera:
# /opt/sigai-ses/backups/sigai_ses_db_YYYYMMDD.sql.gz
```

**El script realiza:**

| # | Paso | Estado |
|---|------|-----|
| 1 | Verificacion de conexion a BD | [OK] |
| 2 | Ejecucion de `mysqldump` con opciones | [OK] |
| 3 | Compresion con gzip | [OK] |
| 4 | Eliminacion de backups con mas de 30 dias | [OK] |

**Opciones de mysqldump:**

| Opcion | Proposito |
|--------|-----------|
| `--single-transaction` | No bloquea la BD |
| `--routines` | Incluye procedimientos almacenados |
| `--triggers` | Incluye triggers |
| `--events` | Incluye eventos |

### 3.2 Backup Manual (Via Comando)

<details>
<summary>Ver comandos de backup manual</summary>

```bash
# Backup completo
mysqldump -u sigai -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  sigai_ses_db | gzip > backup_manual_$(date +%Y%m%d_%H%M).sql.gz

# Backup solo esquema (sin datos)
mysqldump -u sigai -p --no-data sigai_ses_db > esquema_sigai.sql

# Backup de tablas especificas
mysqldump -u sigai -p sigai_ses_db usuarios items activos > backup_parcial.sql
```

</details>

### 3.3 Backup de Configuracion y Archivos

```bash
# Backup de archivos estaticos
tar -czf static_backup_$(date +%Y%m%d).tar.gz \
  /opt/sigai-ses/Backend/app/static/

# Backup de logs (comprimidos)
tar -czf logs_backup_$(date +%Y%m%d).tar.gz \
  /opt/sigai-ses/Backend/logs/

# Backup de configuracion (.env y nginx)
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  /opt/sigai-ses/Backend/.env \
  /opt/sigai-ses/Frontend/.env \
  /etc/nginx/sites-available/sigai-ses
```

---

## Procedimiento de Restauracion

### 4.1 Restauracion de Base de Datos

```bash
# 1. Detener servicios que escriben en BD
sudo systemctl stop sigai-backend

# 2. Restaurar desde backup
gunzip < backup_sigai_20260701.sql.gz | mysql -u sigai -p sigai_ses_db

# Alternativa: restaurar desde archivo SQL sin comprimir
mysql -u sigai -p sigai_ses_db < backup_sigai_20260701.sql

# 3. Verificar integridad
mysqlcheck -u sigai -p --all-databases

# 4. Reiniciar servicios
sudo systemctl start sigai-backend
```

### 4.2 Restauracion Completa del Sistema (Disaster Recovery)

> [!WARNING]
> **Escenario:** Servidor completamente perdido. Sigue estos pasos en orden estricto.

<details>
<summary>Ver procedimiento completo de DR</summary>

```bash
# 1. Preparar nuevo servidor (ver GUIA_ON_PREMISE.md)
# 2. Clonar repositorio
cd /opt
git clone https://github.com/TU_USUARIO/proyecto-sigai-ses.git sigai-ses

# 3. Restaurar .env desde backup de configuracion
tar -xzf config_backup_*.tar.gz -C /

# 4. Configurar entorno virtual e instalar dependencias
cd sigai-ses/Backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 5. Restaurar BD
gunzip -c /ruta/backup_sigai_*.sql.gz | mysql -u sigai -p sigai_ses_db

# 6. Ejecutar migraciones pendientes
alembic upgrade head

# 7. Construir frontend
cd ../Frontend
npm ci
npm run build

# 8. Configurar Nginx y reiniciar servicios
sudo systemctl restart sigai-backend nginx
```

</details>

### 4.3 Prueba de Restauracion

> [!IMPORTANT]
> Se debe realizar una **prueba de restauracion trimestralmente**:

| # | Accion | Responsable |
|---|--------|-------------|
| 1 | Restaurar backup en entorno aislado | Admin |
| 2 | Verificar que el sistema inicia correctamente | Admin |
| 3 | Verificar que los datos son correctos (consultas de prueba) | Admin |
| 4 | Documentar resultados | Admin |

---

## Plan de Continuidad del Negocio

### 5.1 Escenarios de Falla

| Escenario | Impacto | Accion | Tiempo |
|-------------|-----------|-----------|-----------|
| Falla del servidor MySQL | Sistema inoperable | Restaurar desde backup en nuevo servidor | 2-4 horas |
| Error de migracion | API caida | `alembic downgrade -1`, diagnosticar y re-aplicar | 30 min |
| Bug critico en despliegue | Funcionalidad afectada | Rollback a version anterior (`git revert`) | 15 min |
| Ataque de seguridad (ransomware) | Datos comprometidos | Restaurar desde backup pre-ataque, parchear vulnerabilidad | 4-8 horas |
| Desastre natural | Servidor fisico destruido | Restaurar en servidor alternativo (cloud) | 8-24 horas |

### 5.2 Procedimiento de Escalamiento

```
1.  Deteccion de incidencia (automatica o reporte de usuario)
       |
2.  Evaluacion de severidad (P0 - P3)
       |
3.  Notificacion al equipo de operaciones
       |
4.  Ejecucion de plan de recuperacion segun escenario
       |
5.  Verificacion de servicio restaurado
       |
6.  Documentacion de lecciones aprendidas
```

---

## Checklist de Mantenimiento

### Diario

- [x] Verificar que el backup automatico se ejecuto correctamente
- [x] Verificar que los servicios estan activos (`systemctl status`)
- [x] Revisar logs de errores (`/opt/sigai-ses/Backend/logs/error.log`)

### Semanal

- [x] Verificar espacio en disco
- [x] Revisar rendimiento de consultas lentas (slow query log)
- [x] Verificar que las alertas se estan generando correctamente

### Mensual

- [ ] Probar restauracion de backup en entorno de pruebas
- [ ] Revisar y rotar backups antiguos
- [ ] Actualizar dependencias de seguridad
- [ ] Revisar logs de auditoria del sistema

### Trimestral

- [ ] Auditoria de seguridad completa
- [ ] Prueba de Disaster Recovery completa
- [ ] Revision de politicas de calidad y actualizacion

---

## Estado de Cumplimiento

```
Backup Diario  [====================] 100% [OK]
Backup Semanal [====================] 100% [OK]
Backup Mensual [================    ]  80% [WARN]
Prueba DR      [===============     ]  60% [PENDING]
```

---

> [!TIP]
> **Mejores practicas:**
> - Guarda **1 copia del backup fuera del servidor** (S3, Google Drive, otro datacenter)
> - **Prueba la restauracion** al menos una vez al trimestre
> - Manten un **registro de incidencias** para mejorar el plan de continuidad

---

*Documento actualizado: Julio 2026 -- v1.0*
*Repositorio: [github.com/TU_USUARIO/proyecto-sigai-ses](https://github.com/TU_USUARIO/proyecto-sigai-ses)*
