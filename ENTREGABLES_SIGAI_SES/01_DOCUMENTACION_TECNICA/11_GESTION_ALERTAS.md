---
title: "Gestion de Alertas -- Inventario_SE (PROYECTO_SECURITAS)"
---


# Gestion de Alertas -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-En%20Produccion-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![PostgreSQL](https://img.shields.io/badge/Supabase-3FCF8E)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB)

> Guia completa de arquitectura, UX y mejores practicas para el modulo de alertas de SIGAI-SES.

---

## 1. Arquitectura del modulo de alertas

### 1.1 Estructura actual (FastAPI + React + SQLAlchemy)

```
Backend/
└── app/
    ├── models/alerts.py          # Modelos Alert y AlertRule (SQLAlchemy)
    ├── schemas/alerts.py         # Schemas Pydantic (AlertRead, AlertUpdate)
    ├── api/endpoints/alerts.py   # Endpoints REST /api/v1/alerts
    └── crud/crud_alerts.py       # Logica de BD para alertas

Frontend/src/
├── services/alerts.ts            # API service (list, update, delete, evaluar)
├── hooks/useAlerts.ts            # React Query hooks
└── pages/Alerts.tsx              # Centro de alertas (tabla + tarjetas)
```

---

## 2. Modelo de datos

### 2.1 Tabla `alerts` en PostgreSQL (Supabase)

<details open>
<summary><b>Ver DDL de la tabla <code>alerts</code></b></summary>

```sql
CREATE TABLE alerts (
    id            SERIAL PRIMARY KEY,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP,
    resolved_at   TIMESTAMP,
    tipo          VARCHAR(50) NOT NULL,
    prioridad     alerta_prioridad NOT NULL DEFAULT 'media',
    estado        alerta_estado NOT NULL DEFAULT 'activa',
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

CREATE INDEX idx_alerts_estado ON alerts(estado);
CREATE INDEX idx_alerts_tipo ON alerts(tipo);
CREATE INDEX idx_alerts_prioridad ON alerts(prioridad);
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
    condicion   TEXT NOT NULL,
    descripcion TEXT,
    cooldown_h  INTEGER DEFAULT 24
);
```

</details>

---

## 3. Motor de reglas

**Archivo:** `Backend/app/crud/crud_alerts.py` — función `evaluar_alertas()`

> [!NOTE]
> El motor recorre todos los items activos y evalua las reglas predefinidas. Solo crea una alerta si **no existe ya una activa o reconocida** para el mismo item.

<details open>
<summary><b>Ver implementacion del motor de reglas</b></summary>

```python
# Reglas evaluadas por el motor:

REGLAS_ACTIVAS = [
    {"tipo": "stock_bajo", "prioridad": "critica",
     "titulo": "Stock crítico: {nombre}",
     "descripcion": "Stock actual ({actual}) por debajo del mínimo ({umbral})"},

    {"tipo": "stock_bajo", "prioridad": "alta",
     "titulo": "Stock por agotarse: {nombre}",
     "descripcion": "Quedan {actual} unidades (mínimo: {umbral})"},

    {"tipo": "garantia_estancada", "prioridad": "media",
     "titulo": "Garantía estancada: {nombre}",
     "descripcion": "Sin avance por más de 15 días en garantía {id}"},
]
```
        "titulo": "Sin movimiento: {nombre}",
        "condicion": lambda item: item.ultima_transaccion and
                     item.ultima_transaccion < datetime.now() - timedelta(days=90),
        "descripcion": "Sin movimiento desde hace {dias} dias",
    },
    {
        "tipo": "sobrestock",
        "prioridad": "baja",
        "titulo": "Exceso de inventario: {nombre}",
        "condicion": lambda item: item.stock_maximo and item.cantidad > item.stock_maximo,
        "descripcion": "Cantidad {actual} supera maximo {umbral}",
    },
]

def evaluar_alertas():
    """Corre el motor de reglas. Llamar desde un scheduler periodico."""
    db = SessionLocal()
    items = db.query(Item).filter(Item.activo == True).all()
    db.commit()
    return nuevas
```

</details>

---

## 4. Endpoints REST (FastAPI)

> [!TIP]
> Todos los endpoints viven bajo el prefijo `/api/v1/alerts` y retornan respuestas en formato JSON estandar.

<details open>
<summary><b>Ver endpoints disponibles</b></summary>

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/v1/alerts/` | Lista alertas (paginated, filtrable por estado/prioridad/tipo) |
| `GET` | `/api/v1/alerts/summary` | Conteo de alertas agrupadas (dashboard) |
| `PATCH` | `/api/v1/alerts/{id}/estado` | Cambia estado: reconocida, resuelta, ignorada |
| `DELETE` | `/api/v1/alerts/{id}` | Elimina alerta |
| `POST` | `/api/v1/alerts/evaluar` | Disparo manual del motor de reglas |
| `POST` | `/api/v1/alerts/` | Crear alerta manual |

**Ejemplo de respuesta `GET /alerts/summary`:**

```json
{
  "total": 8,
  "critica": 3,
  "alta": 2,
  "media": 2,
  "baja": 1,
  "por_estado": { "activa": 5, "reconocida": 2, "resuelta": 1 }
}
```

</details>

---

## 5. Panel de alertas en React (frontend)

### 5.1 Pagina Alerts.tsx

El centro de alertas se encuentra en `Frontend/src/pages/Alerts.tsx`. Incluye:

- **Vista mixta**: tabla paginada + tarjetas de resumen
- **Filtros**: por estado (activa/reconocida/resuelta/ignorada) y prioridad
- **Acciones**: reconocer, resolver, ignorar, reasignar
- **Busqueda**: por titulo o tipo de alerta
- **Colores**: codificados por prioridad segun el tema activo

```tsx
// Estructura simplificada del componente Alertas
<DashboardLayout>
  <SectionTitle icon={Bell} title="Centro de Alertas" />
  <SummaryCards data={summary} />
  <FiltersBar />
  <AlertTable data={alerts} onAction={handleAction} />
</DashboardLayout>
```

### 5.2 Badge en el Navbar

El conteo de alertas activas se muestra en el Navbar (dentro de Fusion.tsx) como un badge rojo sobre el icono de campana:

```tsx
<button className="relative">
  <Bell size={20} />
  {alertasActivas > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger
                     text-white text-[10px] font-bold rounded-full
                     flex items-center justify-center">
      {alertasActivas > 9 ? '9+' : alertasActivas}
    </span>
  )}
</button>
```

### 5.3 Dashboard summary

Las alertas se muestran en el Dashboard principal como tarjetas de resumen que enlazan al centro de alertas:

```tsx
<StatCard
  title="Alertas Críticas"
  value={alertasCriticas}
  icon={AlertTriangle}
  color="danger"
  onClick={() => navigate('/alerts')}
/>
```
        bgcolor=colores.get(prioridad, ft.colors.GREY_700),
        duration=5000,
        action="Ver",
        on_action=lambda e: page.go("/alertas"),
    )
    page.overlay.append(snack)
    snack.open = True
    page.update()
```

</details>

---

## 6. Scheduler automatico de evaluacion

> [!IMPORTANT]
> El scheduler ejecuta `evaluar_alertas()` cada **15 minutos**. Se integra con el ciclo de vida de FastAPI mediante el patron `lifespan`.

<details open>
<summary><b>Ver configuracion del scheduler</b></summary>

```python
# En main.py o en un worker aparte con APScheduler
from apscheduler.schedulers.background import BackgroundScheduler
from app.alerts.rules import evaluar_alertas

scheduler = BackgroundScheduler()
scheduler.add_job(evaluar_alertas, "interval", minutes=15, id="motor_alertas")
scheduler.start()
```

</details>

Opcionalmente, con FastAPI `lifespan`:

<details>
<summary><b>Ver integracion con lifespan</b></summary>

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)
```

</details>

---

## 7. Tipos de alertas recomendados

| Tipo | Disparador | Prioridad | Frecuencia |
|:---|:---|:---:|:---:|
| **Stock minimo** | `cantidad < stock_minimo` | **Critica** | Cada 15 min |
| **Agotado** | `cantidad == 0` | **Critica** | Cada 15 min |
| **Proximo a vencer** | `fecha_vencimiento <= 30 dias` | **Alta** | Diaria |
| **Vencido** | `fecha_vencimiento < hoy` | **Critica** | Diaria |
| **Sin movimiento** | ultima transaccion > 90 dias | **Media** | Semanal |
| **Sobrestock** | `cantidad > stock_maximo` | **Baja** | Diaria |
| **Discrepancia** | diferencia fisico vs sistema > 5% | **Alta** | Tras conteo |
| **Proveedor tardio** | orden compra vencida sin recibir | **Alta** | Diaria |
| **Valor alto estancado** | item costoso sin rotacion | **Media** | Semanal |

---

## 8. Vistas recomendadas

### 8.1 Dashboard (vista principal)

> [!TIP]
> Agrupa la informacion mas critica en la parte superior para que el usuario pueda tomar accion inmediata.

- **4 tarjetas metricas**: total activas, criticas, tiempo prom. resolucion, resueltas hoy
- **Grafica de barras**: alertas por categoria
- **Grafica de linea**: tendencia de alertas por dia (ultimos 7 dias)
- **Tabla de cola** con filtros por prioridad y estado

### 8.2 Vista de detalle de alerta

- Encabezado con titulo, badge de prioridad y estado
- Linea de tiempo de cambios de estado
- Campo de notas / comentarios
- Botones: **Reconocer**, **Resolver**, **Asignar**, **Ignorar**

### 8.3 Configuracion de reglas

- Lista de reglas con toggle activar/desactivar
- Formulario para editar umbrales (stock minimo, dias de anticipacion, etc.)
- Historial de disparos por regla

### 8.4 Historial

- Tabla de alertas resueltas e ignoradas
- Filtros por rango de fechas, tipo, item
- Exportacion a Excel

---

## 9. Mejoras adicionales recomendadas

### 9.1 Agrupacion de alertas

> [!TIP]
> Evita ruido visual agrupando alertas del mismo tipo en una sola tarjeta resumen.

```python
# En lugar de 50 alertas de stock bajo separadas:
# -> "15 items con stock bajo en categoria EPP"
```

### 9.2 Silenciar / posponer alertas (snooze)

```sql
ALTER TABLE alerts ADD COLUMN snoozed_until DATETIME NULL;
```

> [!NOTE]
> El motor salta alertas con `snoozed_until > NOW()` para respetar el periodo de snooze.

### 9.3 Asignacion de alertas

```python
# Asignar alerta a un usuario responsable
PATCH /alerts/{id}/asignar
{"asignado_a": user_id}
```

### 9.4 Notificaciones push / WhatsApp

> [!WARNING]
> Las integraciones externas requieren claves de API. Guardalas en **variables de entorno** o en un vault de secretos.

```python
import httpx

async def notificar_whatsapp(numero, mensaje):
    # Integracion con WhatsApp Business API o Twilio
    async with httpx.AsyncClient() as client:
        await client.post(WHATSAPP_URL, json={"to": numero, "message": mensaje})
```

### 9.5 SLA y escalamiento automatico

> [!IMPORTANT]
> Si una alerta **critica** lleva mas de **2 horas** sin reconocer -> escalar al supervisor automaticamente.

```python
def escalar_alertas_vencidas():
    alertas = db.query(Alert).filter(
        Alert.prioridad == "critica",
        Alert.estado == "activa",
        Alert.created_at < datetime.now() - timedelta(hours=2)
    ).all()
    for a in alertas:
        notificar_supervisor(a)
```

### 9.6 KPIs del modulo de alertas

> [!TIP]
> Calcula y muestra estos KPIs en el dashboard para medir la *salud* del proceso de alertas.

| KPI | Descripcion |
|:---|:---|
| **MTTR** | *Mean Time To Resolve* -- promedio de minutos desde creacion hasta resolucion |
| **Tasa de reconocimiento** | % de alertas reconocidas en < 30 min |
| **Top items problematicos** | Items con mas alertas historicas |
| **Eficacia de reglas** | Cuales reglas generan mas alertas validas vs ignoradas |

### 9.7 Deduplicacion inteligente

> [!NOTE]
> Antes de crear una alerta, se verifica el **cooldown** configurado en la regla para evitar duplicados.

```python
ultima = db.query(Alert).filter(
    Alert.item_id == item.id,
    Alert.tipo == tipo,
    Alert.created_at > datetime.now() - timedelta(hours=cooldown_horas)
).first()
if ultima:
    continue  # No re-disparar en el periodo de cooldown
```

### 9.8 Exportacion de reporte de alertas

<details>
<summary><b>Ver generador de Excel</b></summary>

```python
import openpyxl

def exportar_alertas_excel(alertas, ruta_salida):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Alertas"
    ws.append(["ID", "Tipo", "Prioridad", "Titulo", "Item", "Estado", "Creada", "Resuelta"])
    for a in alertas:
        ws.append([a.id, a.tipo, a.prioridad, a.titulo, a.item_nombre,
                   a.estado, str(a.created_at), str(a.resolved_at or "")])
    wb.save(ruta_salida)
```

</details>

---

## 10. Checklist de implementacion

### Base
- [x] Crear tabla `alerts` y `alert_rules` en MySQL
- [ ] Implementar modelo SQLAlchemy `Alert`
- [ ] Implementar motor de reglas `evaluar_alertas()`
- [ ] Conectar scheduler (APScheduler) cada 15 minutos

### API REST
- [ ] Endpoints REST: GET, PATCH estado, GET resumen

### Frontend Flet
- [ ] Vista Flet: dashboard con metricas + tabla + filtros
- [ ] Badge de alertas en el sidebar
- [ ] Toast de nueva alerta critica

### Detalle y configuracion
- [ ] Vista de detalle con linea de tiempo
- [ ] Configuracion de reglas (toggle + umbrales)
- [ ] Historial y exportacion Excel

### Mejoras
- [ ] Logica de cooldown (deduplicacion)
- [ ] Logica de escalamiento por SLA
- [ ] (Opcional) Integracion WhatsApp para criticas

---

> *Documento generado para **PROYECTO_SECURITAS -- Inventario_SE** - Compatible con FastAPI + Flet + MySQL + APScheduler*
