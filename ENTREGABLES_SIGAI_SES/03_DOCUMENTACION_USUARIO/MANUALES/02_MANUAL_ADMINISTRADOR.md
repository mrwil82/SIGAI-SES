---
title: "Manual del Administrador — SIGAI-SES"
---

# Manual del Administrador — SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Role](https://img.shields.io/badge/Rol-Administrador-red?style=for-the-badge)
![Project](https://img.shields.io/badge/Proyecto-SIGAI--SES-important?style=for-the-badge)
![Sections](https://img.shields.io/badge/Secciones-10-ff69b4?style=for-the-badge)
![Date](https://img.shields.io/badge/Julio-2026-lightgrey?style=for-the-badge)

> [!NOTE]
> Este manual esta dirigido al **personal de TI y Administradores** encargados de la gestion avanzada del sistema SIGAI-SES en Securitas Colombia. Como administrador, tiene **acceso total** al sistema incluyendo configuracion global, gestion de usuarios, auditoria y todos los modulos operativos.

---

<details>
<summary><b>Indice de Contenidos</b></summary>

| # | Seccion | Descripcion |
|---|---------|-------------|
| 1 | [Introduccion](#1-introduccion) | Alcance del rol administrador |
| 2 | [Gestion de Usuarios](#2-gestion-de-usuarios-y-permisos) | Perfiles, creacion, roles, bajas |
| 3 | [Regionales](#3-gestion-de-regionales-y-sedes) | Aislamiento de datos por ciudad |
| 4 | [Alertas](#4-configuracion-de-alertas-automaticas) | Tipos, umbrales, SLA, escalamiento |
| 5 | [Auditoria](#5-auditoria-y-trazabilidad) | Bitacora, consultas, buenas practicas |
| 6 | [Respaldos](#6-respaldos-y-mantenimiento) | Backup, restauracion, depuracion, monitoreo |
| 7 | [Actas](#7-gestion-de-actas-de-entrega) | Tipos, creacion, estados |
| 8 | [Configuracion Avanzada](#8-configuracion-avanzada) | Variables de entorno, migraciones, scripts |
| 9 | [Solucion de Problemas](#9-solucion-de-problemas) | Tabla de errores y soluciones |
| 10 | [Referencia Rapida](#10-referencia-rapida) | Comandos y URLs |

</details>

---

## 1. Introduccion

**SIGAI-SES** otorga al rol **ADMIN** control total sobre:

| Area | Descripcion |
|------|-------------|
| **Usuarios** | Creacion, modificacion, roles, desactivacion |
| **Regionales** | Aislamiento de datos por ciudad |
| **Alertas** | Configuracion de reglas y umbrales |
| **Auditoria** | Trazabilidad completa de acciones |
| **Respaldos** | Mantenimiento de base de datos |
| **Configuracion** | Variables de entorno y migraciones |

> [!IMPORTANT]
> Como **Administrador**, usted es responsable de la **integridad**, **seguridad** y **disponibilidad** del sistema. Use sus privilegios con responsabilidad.

---

## 2. Gestion de Usuarios y Permisos

### 2.1 Perfiles de Usuario

El sistema utiliza un modelo de **Control de Acceso basado en Roles (RBAC)** con 3 niveles:

| Rol | Acceso | Descripcion |
|:---:|:-----:|-------------|
| **ADMIN** | Total | Gestion de usuarios, auditoria, configuracion global, todos los modulos |
| **TECNICO** | Operativo | Consulta de inventario, garantias, entregas, desmontes, reportes |
| **TECNICO_LABORATORIO** | Laboratorio | Triage de equipos, registro de desmontes, inventario, garantias |

### 2.2 Como Crear un Usuario

1. Inicie sesion con su cuenta de **Administrador**
2. Dirijase a la seccion **"Usuarios"** en el menu lateral
3. Haga clic en **"Nuevo Usuario"**
4. Complete los campos:

| Campo | Descripcion | Unico |
|-------|-------------|:-----:|
| **Nombre** | Nombre completo del usuario | No |
| **Email** | Correo electronico corporativo *(usado para login)* | Si |
| **Rol** | Seleccione `ADMIN`, `TECNICO` o `TECNICO_LABORATORIO` | No |
| **Regional** | Ciudad a la que pertenece | No |
| **Cedula** | Numero de cedula | Si |
| **Codigo Empleado** | Codigo interno de Securitas | Si |
| **Contrasena** | Temporal *(el usuario la cambiara en su primer ingreso)* | No |

5. Haga clic en **"Guardar"**
6. *(Futuro v1.1.0)* El sistema enviara las credenciales por email automaticamente

> [!TIP]
> Use una **contrasena temporal** segura y comuniquela al usuario por un **canal seguro** (telefono o presencial).

### 2.3 Gestion de Roles y Permisos

El **ADMIN** puede modificar el rol de cualquier usuario en cualquier momento. Los cambios afectan **inmediatamente** el acceso del usuario.

**Reglas importantes:**

| Regla | Descripcion |
|-------|-------------|
| Creacion | Solo **ADMIN** puede crear, editar o eliminar usuarios |
| Degradacion | Un ADMIN **no puede** ser degradado por otro ADMIN *(requiere accion directa en BD)* |
| Inactivos | Usuarios con `is_active = false` **no pueden** iniciar sesion |

### 2.4 Baja de Usuarios

1. Vaya a **Usuarios** y busque al usuario
2. Use la opcion **"Desactivar"** en lugar de eliminar

> [!WARNING]
> **No elimine usuarios.** La desactivacion preserva el historial de auditoria. Un usuario desactivado no puede iniciar sesion pero **sus registros historicos se conservan**.

---

## 3. Gestion de Regionales y Sedes

### 3.1 Que Son las Regionales?

Las regionales definen el **aislamiento de datos por ciudad**:

| Situacion | Comportamiento |
|-----------|----------------|
| Usuario de "Bogota" | Solo ve equipos, clientes y proyectos de **Bogota** |
| Administrador | Ve **todas las regionales** |

### 3.2 Como Gestionar Regionales

1. Vaya a la seccion **"Regionales"** *(accesible solo desde configuracion)*
2. Puede **crear**, **editar** o **desactivar** regionales
3. Cada regional tiene: **nombre** y **ciudad principal**
4. Al crear un usuario, debe asignarle una **regional**

### 3.3 Consideraciones

| Consideracion | Detalle |
|---------------|---------|
| Cambio de regional | No afecta los **registros historicos** del usuario |
| Eliminar regional | Los usuarios asignados deben **reasignarse** |
| Vision global | Los administradores pueden seleccionar *"Todas las regionales"* para ver datos consolidados |

---

## 4. Configuracion de Alertas Automaticas

### 4.1 Tipos de Alertas

El sistema evalua reglas de negocio cada **15 minutos**:

| Tipo | Prioridad | Condicion | Accion |
|:----:|:---------:|-----------|--------|
| Stock Bajo | **Critica** | `cantidad < stock_minimo` | Alerta inmediata en dashboard |
| Agotado | **Critica** | `cantidad == 0` | Alerta inmediata, recompra urgente |
| Proximo a vencer | **Alta** | `fecha_vencimiento <= 30 dias` | Planificar renovacion |
| Vencido | **Critica** | `fecha_vencimiento < hoy` | Alerta de incumplimiento |
| Sin movimiento | **Media** | `ultima transaccion > 90 dias` | Evaluar necesidad del item |
| Sobrestock | **Baja** | `cantidad > stock_maximo` | Evaluar devolucion o traslado |
| Garantia estancada | **Alta** | Caso sin avance > 15 dias | Escalar al supervisor |

### 4.2 Como Configurar Umbrales

Los umbrales se configuran a nivel de **item** en el catalogo:

1. Vaya a **Inventario** > **Catalogo**
2. Seleccione el item a configurar
3. Ajuste los valores:

| Parametro | Descripcion |
|-----------|-------------|
| **Stock minimo** | Cantidad que **dispara** la alerta de stock bajo |
| **Compra maxima** | Limite por **orden de compra** |

4. Guarde los cambios

### 4.3 Gestion de Alertas

En el **Centro de Alertas** puede:

| Accion | Icono | Descripcion |
|--------|:-----:|-------------|
| Filtrar | F | Por **estado** (activa, reconocida, resuelta, ignorada) y **prioridad** |
| Reconocer | O | Marca que esta al tanto del problema *(cambia estado a "reconocida")* |
| Resolver | X | Indica que el problema fue solucionado *(requiere notas)* |
| Ignorar | - | Descarta la alerta *(no recomendado, solo si es falso positivo)* |
| Asignar | U | Asigna la alerta a un **usuario responsable** |
| Exportar | E | Descarga el historial de alertas a **Excel** o **PDF** |

### 4.4 SLA y Escalamiento

Si una alerta **CRITICA** no se reconoce en mas de **2 horas**:

1. El sistema **escala automaticamente** al supervisor
2. Se envia una alerta de **mayor prioridad**

> [!NOTE]
> **Pendiente de implementar en v1.1.0:** Notificaciones por email/WhatsApp.

---

## 5. Auditoria y Trazabilidad

### 5.1 Bitacora de Auditoria

Todas las acciones `CREATE`, `UPDATE`, `DELETE` y `LOGIN` quedan registradas:

| Accion | Datos Registrados |
|:------:|-------------------|
| **CREATE** | Usuario, tabla, timestamp, valor_nuevo |
| **UPDATE** | Usuario, tabla, timestamp, valor_anterior, valor_nuevo |
| **DELETE** | Usuario, tabla, timestamp, valor_anterior |
| **LOGIN** | Usuario, accion="LOGIN", timestamp |

### 5.2 Como Consultar la Auditoria

1. Vaya a **Auditoria** en el menu lateral *(solo ADMIN)*
2. Use los **filtros disponibles**:

| Filtro | Descripcion |
|--------|-------------|
| **Tabla** | Filtre por tabla afectada (usuarios, items, activos, etc.) |
| **Accion** | Filtre por tipo de accion (CREATE, UPDATE, DELETE, LOGIN) |
| **Usuario** | Filtre por usuario que realizo la accion |

3. Los resultados muestran:

- **Fecha y hora** exacta
- **Usuario** que realizo la accion
- **Tabla y registro** afectados
- **Valores anterior y nuevo** (en formato JSON)

### 5.3 Buenas Practicas de Auditoria

| # | Practica |
|:-:|----------|
| 1 | Revise la bitacora **semanalmente** para detectar actividad sospechosa |
| 2 | **Archive** registros con mas de **1 ano** de antiguedad para mantener el rendimiento |
| 3 | **No elimine** registros de auditoria *(son evidencia legal)* |

> [!WARNING]
> Los registros de auditoria constituyen **evidencia legal** ante cualquier controversia. Nunca los elimine directamente de la base de datos.

---

## 6. Respaldos y Mantenimiento

### 6.1 Copia de Seguridad de la Base de Datos

**Frecuencia recomendada:** Diaria

```bash
# Backup manual
mysqldump -u [usuario] -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  sigai_ses_db > respaldo_sigai_$(date +%Y%m%d).sql
```

**Script automatizado:** `Backend/scripts/backup_db.py`

> [!TIP]
> Programe el backup en un **cron job** o **Tarea Programada de Windows** para ejecucion automatica diaria.

### 6.2 Restauracion de Base de Datos

```bash
# Restaurar desde backup
mysql -u [usuario] -p sigai_ses_db < respaldo_sigai_20260701.sql

# Luego ejecutar migraciones pendientes
alembic upgrade head
```

### 6.3 Depuracion de Bitacoras

Para mantener el sistema agil, archive logs de mas de 1 ano:

```sql
-- Archivar logs de auditoria con mas de 1 ano
INSERT INTO audit_logs_archivo SELECT * FROM audit_logs
WHERE fecha_accion < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM audit_logs WHERE fecha_accion < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 6.4 Monitoreo del Servidor

| Recurso | Descripcion | Ruta |
|---------|-------------|------|
| **Health check** | Estado del servidor | `GET /health` |
| **Health DB** | Conexion a base de datos | `GET /health/db` |
| **Metricas** | CPU, RAM, uso | `GET /metrics` |
| **Logs** | Archivos de registro | `Backend/logs/app.log`, `error.log`, `access.log` |

---

## 7. Gestion de Actas de Entrega

### 7.1 Tipos de Acta

| Tipo | Uso |
|:----:|-----|
| **ENTREGA_EPP** | Entrega de elementos de proteccion personal a tecnicos |
| **ENTREGA_HERRAMIENTA** | Asignacion de herramientas a tecnicos |
| **DESPACHO_PROYECTO** | Envio de equipos para instalacion en cliente |
| **DEVOLUCION** | Equipos retornados a bodega |
| **INGRESO_DESMONTE** | Ingreso de equipos retirados de clientes |

### 7.2 Como Crear un Acta

1. Vaya a **Entregas** > **"Nueva Acta"**
2. Seleccione el **tipo de acta**
3. Seleccione el **tecnico responsable**
4. Seleccione el **proyecto/cliente** destino
5. Agregue los **items/activos** con cantidades
6. Capture la **firma digital** del receptor
7. Haga clic en **"Generar Acta"**
8. El sistema creara un **PDF** del acta para descargar e imprimir

### 7.3 Estados del Acta

| Estado | Descripcion |
|:------:|-------------|
| **BORRADOR** | En proceso de creacion, aun no finalizada |
| **FIRMADA** | Completada y firmada, PDF generado |
| **ANULADA** | Invalidada *(se mantiene en el historico)* |

> [!NOTE]
> Las actas **anuladas** se conservan en el historico para efectos de auditoria y trazabilidad.

---

## 8. Configuracion Avanzada

### 8.1 Variables de Entorno (.env)

| Variable | Descripcion | Valor por defecto |
|----------|-------------|:-----------------:|
| `DATABASE_URL` | Conexion a MySQL | `mysql+aiomysql://...` |
| `SECRET_KEY` | Clave para firmar JWT | *(generar con `openssl rand -hex 32`)* |
| `CORS_ALLOWED_ORIGINS` | Origenes permitidos | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email del admin inicial | `admin@securitas.com` |
| `ADMIN_PASSWORD` | Password del admin inicial | `Admin123!` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracion access token | `480` (8 horas) |
| `BACKEND_PORT` | Puerto del servidor | `8000` |

> [!WARNING]
> **Nunca** comparta la `SECRET_KEY` ni las credenciales de produccion. Use variables de entorno seguras.

### 8.2 Migraciones (Alembic)

```bash
# Crear nueva migracion
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head

# Revertir ultima migracion
alembic downgrade -1

# Ver historial
alembic history
```

### 8.3 Scripts de Administracion

| Script | Ubicacion | Proposito |
|--------|-----------|-----------|
| `init_db.py` | `Backend/scripts/` | Inicializa BD y crea admin |
| `seed_admin.py` | `Backend/scripts/` | Crea usuario admin |
| `backup_db.py` | `Backend/scripts/` | Backup MySQL automatizado |
| `trigger_alerts.py` | `Backend/scripts/` | Evalua alertas manualmente |
| `scheduler_alerts.py` | `Backend/scripts/` | Programa evaluacion de alertas (cron) |

---

## 9. Solucion de Problemas

| Problema | Causa Probable | Solucion |
|:---------|:---------------|:---------|
| **Acceso Denegado (401)** | La sesion ha caducado | Cierre sesion y vuelva a iniciar |
| **Error 403 Forbidden** | El usuario no tiene permisos | Verifique el **rol** del usuario |
| **Error al cargar Excel** | Formato de columnas incorrecto | Use la **plantilla oficial** (ver FAQ) |
| **El informe no se descarga** | Falla de conexion con el servidor | Verifique que el servidor este activo y su conexion a internet |
| **Base de datos lenta** | Indices faltantes o volumen alto | Verifique pool de conexiones, ejecute `ANALYZE TABLE` |
| **Servidor no responde** | Puerto ocupado o proceso caido | `netstat -ano | findstr :8000` y `taskkill /PID <PID> /F` |
| **Error de migracion** | Conflictos en versiones | `alembic downgrade -1`, resuelva y re-aplique |
| **Logo no aparece en PDF** | Ruta de imagen incorrecta | Verifique que `Securitas-logo-light.png` existe en `Backend/app/static/` |

> [!TIP]
> Para problemas recurrentes, revise los **logs** del servidor en `Backend/logs/` para obtener informacion detallada del error.

---

## 10. Referencia Rapida

### Comandos Utiles

```bash
# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ejecutar pruebas
pytest -v

# Verificar estado
curl http://localhost:8000/health

# Backup manual
python Backend/scripts/backup_db.py

# Evaluar alertas manualmente
python Backend/scripts/trigger_alerts.py
```

### URLs de Verificacion

| Recurso | URL |
|:--------|:---:|
| **API** | `http://localhost:8000` |
| **Swagger** | `http://localhost:8000/docs` |
| **Redoc** | `http://localhost:8000/redoc` |
| **Health** | `http://localhost:8000/health` |
| **Frontend (dev)** | `http://localhost:5173` |

---

| Resumen del Manual |
|:---------------------:|
| **Secciones:** 10 |
| **Perfiles de usuario:** 3 |
| **Tipos de alerta:** 7 |
| **Scripts administracion:** 5 |
| **Problemas resueltos:** 8 |
| **Comandos rapidos:** 5 |

---

> [!IMPORTANT]
> Para **soporte tecnico especializado**, comuniquese con el **equipo de desarrollo del proyecto**.

*Documento actualizado: Julio 2026 — SIGAI-SES v1.0.0*
