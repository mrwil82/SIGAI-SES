---
title: "Gestión de Alertas — SIGAI-SES"
---

# Gestión de Alertas — SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-En%20Produccion-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Database](https://img.shields.io/badge/PostgreSQL%20%2F%20MySQL-4169E1)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB)

> Guía completa del **módulo de alertas** de SIGAI-SES: arquitectura, modelo de datos, motor de reglas, endpoints REST, panel de React y programación automática.

---

## 1. Arquitectura del módulo de alertas

### 1.1 Estructura actual (FastAPI + React + SQLAlchemy)

El módulo está implementado de forma transversal en el stack:

```
Backend/
└── app/
    ├── models/alerts.py          # Modelos Alert y AlertRule (SQLAlchemy)
    ├── schemas/alerts.py         # Schemas Pydantic (AlertRead, AlertUpdate, AlertEstado)
    ├── api/endpoints/alerts.py   # Endpoints REST /api/v1/alerts
    ├── crud/crud_alerts.py       # Lógica de BD + motor de reglas (evaluar_alertas)
    └── core/scheduler.py         # APScheduler — evaluación automática (AsyncIOScheduler)

Frontend/src/
├── services/alerts.ts            # API service (summary del dashboard)
├── hooks/useAlerts.ts            # React Query hooks (CRUD + estado de alertas)
├── hooks/useAlertsSummary.ts     # React Query hook del resumen del navbar
└── pages/Alerts.tsx              # Centro de alertas (tabla + tarjetas)
```

---

## 2. Modelo de datos

### 2.1 Tabla `alerts`

<details open>
<summary><b>Ver DDL de la tabla <code>alerts</code></b></summary>

```sql
CREATE TABLE alerts (
    id            SERIAL PRIMARY KEY,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP,
    resolved_at   TIMESTAMP,
    tipo          VARCHAR(50) NOT NULL,          -- stock_bajo, garantia_vencida, manual
    prioridad     alerta_prioridad NOT NULL DEFAULT 'media',  -- critica|alta|media|baja
    estado        alerta_estado NOT NULL DEFAULT 'activa',    -- activa|reconocida|resuelta|ignorada
    titulo        VARCHAR(200) NOT NULL,
    descripcion   TEXT,
    item_id       INTEGER NOT NULL REFERENCES items(id_item),
    item_nombre   VARCHAR(200),
    valor_actual  DECIMAL(10,2),
    valor_umbral  DECIMAL(10,2),
    unidad        VARCHAR(20),
    asignado_a    INTEGER REFERENCES usuarios(id_usuario),
    solucion      TEXT
);
```

</details>

### 2.2 Tabla `alert_rules` (reglas configurables)

<details open>
<summary><b>Ver DDL de la tabla <code>alert_rules</code></b></summary>

```sql
CREATE TABLE alert_rules (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    tipo        VARCHAR(50) NOT NULL,
    activa      BOOLEAN NOT NULL DEFAULT TRUE,
    prioridad   regla_prioridad NOT NULL,
    condicion   TEXT NOT NULL,       -- condición almacenada como JSON
    descripcion TEXT,
    cooldown_h  INTEGER DEFAULT 24
);
```

</details>

---

## 3. Motor de reglas

**Archivo:** `Backend/app/crud/crud_alerts.py` — función `evaluar_alertas(db)`

> [!NOTE]
> El motor recorre los items y garantías y genera alertas automáticamente. Solo crea una alerta si **no existe ya una activa o reconocida** para el mismo item/tipo (evita duplicados).

### 3.1 Reglas implementadas

| Tipo | Disparador | Prioridad |
|:---|:---|:---:|
| **`stock_bajo`** | `cantidad_actual <= stock_minimo` (StockBulk vs Item) | **crítica** |
| **`garantia_vencida`** | Caso `ENVIADO_PROVEEDOR` con `fecha_envio` con más de **15 días** | **alta** |

### 3.2 Comportamiento

- Recorre `items JOIN stock_bulk` donde `cantidad_actual <= stock_minimo` y crea alerta crítica si no existe una activa/reconocida.
- Recorre `garantias` en estado `ENVIADO_PROVEEDOR` con `fecha_envio` anterior a hace 15 días y crea alerta de alta prioridad.
- Registra todo en una transacción (`db.commit()` / `db.rollback()` en caso de error) y usa el logger estructurado.

---

## 4. Endpoints REST (FastAPI)

> [!TIP]
> Todos los endpoints viven bajo el prefijo `/api/v1/alerts` y retornan respuestas en formato JSON estándar.

<details open>
<summary><b>Ver endpoints disponibles</b></summary>

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/v1/alerts/` | Lista alertas (paginado, filtrable por estado/prioridad/tipo) |
| `GET` | `/api/v1/alerts/alerts` | Alias de listado de alertas |
| `GET` | `/api/v1/alerts/summary` | Resumen para el Dashboard y navbar |
| `PATCH` | `/api/v1/alerts/{id}/estado` | Cambia estado: reconocida, resuelta, ignorada (con notas, valor_actual, solución, asignación) |
| `DELETE` | `/api/v1/alerts/{id}` | Elimina alerta |
| `POST` | `/api/v1/alerts/evaluar` | Disparo manual del motor de reglas |
| `POST` | `/api/v1/alerts/` | Crear alerta manual |

**Ejemplo de respuesta `GET /alerts/summary`:**

```json
{
  "total": 8,
  "stock": [ { "id": 12, "title": "Stock crítico: Cámara Dome", "count": 3.0 } ],
  "garantias": [ { "id": 5, "title": "Garantía estancada: GSES-045" } ]
}
```

</details>

---

## 5. Panel de alertas en React (frontend)

### 5.1 Página `Alerts.tsx`

El centro de alertas se encuentra en `Frontend/src/pages/Alerts.tsx`. Incluye:

- **Vista mixta**: tabla paginada + tarjetas de resumen.
- **Filtros**: por estado (activa/reconocida/resuelta/ignorada) y paginación.
- **Acciones**: actualizar estado con notas, valor actual y solución; crear y eliminar alertas.
- **React Query**: hooks `useAlerts`, `useCreateAlert`, `useUpdateAlertEstado`, `useDeleteAlert` (staleTime 5 min, invalidación automática de la caché `["alerts"]`).

### 5.2 Badge en el Navbar

El conteo de alertas activas se muestra en el Navbar (dentro de `Fusion.tsx`) como un badge sobre el icono de campana. Usa el hook `useDashboardAlerts()` que llama a `GET /alerts/summary` (caché de 5 min).

### 5.3 Dashboard

Las alertas se muestran en el Dashboard principal como tarjetas de resumen que enlazan al centro de alertas, junto con el widget "SIGAI-SES AI" que predice **stock por agotarse** y **garantías por vencer** (endpoint `/analytics/predictions`).

---

## 6. Scheduler automático de evaluación

> [!IMPORTANT]
> El scheduler ejecuta `evaluar_alertas()` cada **30 minutos**, y también una vez inmediatamente al arrancar. Se integra con el ciclo de vida de FastAPI mediante el patrón `lifespan` usando **APScheduler `AsyncIOScheduler`** (no `BackgroundScheduler`).

<details open>
<summary><b>Ver configuración real del scheduler</b></summary>

Archivo `Backend/app/core/scheduler.py`:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

scheduler = AsyncIOScheduler()

async def evaluate_alerts_job():
    from app.crud.crud_alerts import evaluar_alertas
    # ... crea engine y sesión asíncrona, ejecuta evaluar_alertas(db) ...

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            evaluate_alerts_job,
            trigger=IntervalTrigger(minutes=30),
            id="evaluate_alerts",
        )
        scheduler.start()
        scheduler.add_job(evaluate_alerts_job, trigger="date",
                          id="evaluate_alerts_startup")  # evalúa al inicio
```

Integración con `lifespan` en `app/main.py`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()
```

</details>

---

## 7. Estados de alerta

| Estado | Significado | Acción |
|:---|:---|:---|
| `activa` | Recién generada, sin gestionar | Reconocer / resolver / ignorar |
| `reconocida` | En revisión por un responsable | Resolver / ignorar |
| `resuelta` | Atendida (se marca `resolved_at`) | Histórico |
| `ignorada` | Descartada (se marca `resolved_at`) | Histórico |

---

## 8. KPIs del módulo de alertas

> [!TIP]
> El dashboard permite medir la *salud* del proceso de alertas.

| KPI | Descripcion |
|:---|:---|
| **Total activas** | Alertas sin gestionar (resumen del navbar/dashboard) |
| **Stock crítico** | Items bajo el mínimo, con `valor_actual` vs `valor_umbral` |
| **Garantías estancadas** | Casos sin avance por más de 15 días |
| **Tiempo de resolución** | `resolved_at - created_at` por alerta |

---

## 9. Checklist de implementación

### Base (implementado)
- [x] Tabla `alerts` y `alert_rules` en la BD (Alembic)
- [x] Modelos SQLAlchemy `Alert` y `AlertRule`
- [x] Motor de reglas `evaluar_alertas()` (stock bajo + garantías estancadas)
- [x] Scheduler (APScheduler `AsyncIOScheduler`) cada 30 minutos + evaluación al arrancar
- [x] Deduplicación: no re-crea alertas activas/reconocidas del mismo item/tipo

### API REST (implementado)
- [x] Endpoints: GET listado, GET summary, PATCH estado, DELETE, POST evaluar, POST crear

### Frontend (implementado)
- [x] Centro de alertas `Alerts.tsx` con tabla paginada y filtros
- [x] Badge de alertas en el Navbar (campana)
- [x] Resumen de alertas en el Dashboard

### Mejoras futuras (pendiente)
- [ ] Configuración visual de reglas (toggle + umbrales) en el frontend
- [ ] Historial detallado y exportación Excel de alertas
- [ ] Escalamiento automático por SLA (críticas sin reconocer > 2h)
- [ ] Notificaciones push / WhatsApp / correo para alertas críticas

---

> *Documento actualizado: Agosto 2026 — v1.1 — Compatible con FastAPI + React + SQLAlchemy + APScheduler*