---
title: "SIGAI-SES: Sistema Integral de Gestión de Activos e Inventario — Securitas"
---

# SIGAI-SES: Sistema Integral de Gestión de Activos e Inventario — Securitas

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-2ea44f?style=for-the-badge&logo=semver" alt="Version">
  <img src="https://img.shields.io/badge/Estado-Producci%C3%B3n-success?style=for-the-badge&logo=github" alt="Estado">
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/SQL-3FCF8E?style=for-the-badge&logo=database&logoColor=black" alt="SQL">
  <img src="https://img.shields.io/badge/Licencia-Propietaria-FF0000?style=for-the-badge&logo=legal" alt="Licencia">
</p>

---

## Visión General del Sistema

> [!IMPORTANT]
> **SIGAI-SES** es una plataforma empresarial robusta diseñada para la gestión, control y trazabilidad de activos tecnológicos, inventarios y procesos de garantías para el área de **Seguridad Electrónica de Securitas Colombia**.

El sistema centraliza la operación de bodegas, laboratorios y técnicos en campo, reemplazando los **procesos manuales basados en Excel** por flujos de trabajo automatizados.

### Capacidades Clave

| Capacidad | | Descripción |
|---|---|---|
| **Visión 360°** | | Ciclo de vida de cada equipo: desde compra, instalación, desmonte, hasta disposición final |
| **Kardex Digital Universal** | | Historial inmutable de cada movimiento de inventario |
| **Importación Inteligente** | | Procesamiento de Excel con _upsert_ y normalización automática |
| **Alertas Automáticas** | | Stock crítico, garantías estancadas, vencimientos |
| **Actas Digitales** | | Generación de PDF con datos del técnico y del representante |
| **Auditoría Completa** | | Registro detallado de cada acción con valores anterior/nuevo |

---

## Stack Tecnológico Detallado

### Backend (Servidor de Aplicaciones)

| Tecnología | Versión | Propósito |
|---|---|---|
| <img src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white" height="20"> | `3.12+` | Lenguaje base del backend |
| <img src="https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white" height="20"> | `0.136.1` | Framework web asíncrono de alto rendimiento |
| <img src="https://img.shields.io/badge/-Uvicorn-000?logo=gunicorn&logoColor=white" height="20"> | `0.47.0` | Servidor ASGI |
| <img src="https://img.shields.io/badge/-SQLAlchemy-000?logo=sqlalchemy&logoColor=white" height="20"> | `2.0.49` | ORM asíncrono con `asyncpg` / `aiomysql` |
| <img src="https://img.shields.io/badge/-Alembic-000?logo=alembic&logoColor=white" height="20"> | `1.18.4` | Migraciones de base de datos |
| <img src="https://img.shields.io/badge/-Pydantic-E92063?logo=pydantic&logoColor=white" height="20"> | `2.13.4` | Validación de datos (schemas) |
| <img src="https://img.shields.io/badge/-Pydantic--Settings-E92063?logo=pydantic&logoColor=white" height="20"> | `2.14.1` | Configuración con `.env` |
| <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white" height="20"> | `16+` | Motor de BD principal |
| <img src="https://img.shields.io/badge/-MySQL%2FMariaDB-4479A1?logo=mysql&logoColor=white" height="20"> | `8.0+` | BD alternativa local (compatible) |
| <img src="https://img.shields.io/badge/-JOSE-000?logo=jwt&logoColor=white" height="20"> | `3.5.0` | Tokens JWT (HS256) |
| <img src="https://img.shields.io/badge/-Passlib-000?logo=passlib&logoColor=white" height="20"> | `4.0.1` | Hashing de contraseñas con **bcrypt** |
| <img src="https://img.shields.io/badge/-Pandas-150458?logo=pandas&logoColor=white" height="20"> | `3.0.3` | Procesamiento de Excel |
| <img src="https://img.shields.io/badge/-OpenPyXL-000?logo=microsoftexcel&logoColor=white" height="20"> | `3.1.5` | Lectura de archivos Excel |
| <img src="https://img.shields.io/badge/-XlsxWriter-000?logo=microsoftexcel&logoColor=white" height="20"> | `3.2.9` | Exportación Excel con streaming (`constant_memory`) |
| <img src="https://img.shields.io/badge/-ReportLab-000?logo=adobeacrobatreader&logoColor=white" height="20"> | `4.5.1` | Generación de PDF con diseño corporativo |
| <img src="https://img.shields.io/badge/-Pillow-000?logo=pillow&logoColor=white" height="20"> | `12.2.0` | Procesamiento de imágenes |
| <img src="https://img.shields.io/badge/-SlowAPI-000?logo=slowapi&logoColor=white" height="20"> | `0.1.9` | Rate limiting |
| <img src="https://img.shields.io/badge/-JSON%20Logger-000?logo=json&logoColor=white" height="20"> | `3.2.1` | Logging estructurado JSON |
| <img src="https://img.shields.io/badge/-psutil-000?logo=psutil&logoColor=white" height="20"> | `6.1.0` | Monitoreo del sistema (`/metrics`) |
| <img src="https://img.shields.io/badge/-httpx-000?logo=httpx&logoColor=white" height="20"> | `0.28.1` | Cliente HTTP para tests |
| <img src="https://img.shields.io/badge/-pytest-0A9EDC?logo=pytest&logoColor=white" height="20"> | `9.0.3` | Testing |

### Frontend (Interfaz de Usuario)

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | <img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white" height="20"> | `18.2` |
| **Lenguaje** | <img src="https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white" height="20"> | `5.2` |
| **Bundler** | <img src="https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white" height="20"> | `7.3` |
| **Estilos** | <img src="https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" height="20"> | `3.4` |
| **Ruteo** | <img src="https://img.shields.io/badge/-React%20Router-CA4245?logo=reactrouter&logoColor=white" height="20"> | `7.18` |
| **Datos** | <img src="https://img.shields.io/badge/-TanStack%20Query-FF4154?logo=reactquery&logoColor=white" height="20"> | `5.101` |
| **HTTP** | <img src="https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white" height="20"> | `1.6.8` |
| **Gráficos** | <img src="https://img.shields.io/badge/-Recharts-22B5BF?logo=recharts&logoColor=white" height="20"> | `2.12` |
| **Iconos** | <img src="https://img.shields.io/badge/-Lucide-000?logo=lucide&logoColor=white" height="20"> | `0.363` |
| **Formularios** | <img src="https://img.shields.io/badge/-React%20Hook%20Form-EC5990?logo=reacthookform&logoColor=white" height="20"> | `7.51` |
| **PWA** | <img src="https://img.shields.io/badge/-vite--plugin--pwa-646CFF?logo=pwa&logoColor=white" height="20"> | `1.3.0` |
| **Móvil** | <img src="https://img.shields.io/badge/-Capacitor-119EFF?logo=capacitor&logoColor=white" height="20"> | `7.2.0` (Android) |
| **Tema** | <img src="https://img.shields.io/badge/-CSS%20Variables-1572B6?logo=css3&logoColor=white" height="20"> | 3 temas (green/blue/bone) |
| **Notificaciones** | <img src="https://img.shields.io/badge/-Toast-000?logo=react&logoColor=white" height="20"> | Sistema propio con portal |

---

## Características Principales

### Gestión de Inventario de Alto Nivel

- Control **multiregional** con datos aislados por ciudad
- Trazabilidad individual por **serial** y **placa de activo fijo**
- Asignación de **EPP** con fechas de vencimiento
- Importación masiva desde **Excel** con detección automática de tipo

### Ciclo de Vida de Garantías

| Estado | Progreso |
|---|---|
| `Registrado` | → |
| `Enviado Proveedor` | → |
| `Recibido Proveedor` | → |
| `Resuelto` | → |
| `Entregado Cliente` | |

- Numeración automática **GSES-XXX**
- Alertas de estancamiento a los **15 días** sin avance
- Vinculación con proveedores y **RMA**

### Inteligencia y Automatización

| Característica | | Descripción |
|---|---|---|
| **Motor de Importación** | | Upsert con lógica transaccional |
| **Motor de Alertas** | | APScheduler — evaluación cada **30 min** |
| **Reglas Predefinidas** | | `stock_bajo` · `vencimiento` · `sin_movimiento` · `sobrestock` |
| **Streaming** | | Reportes de **+30,000 registros** sin degradación |
| **Búsqueda Global** | | Respuesta a partir de **2 caracteres** |

### Seguridad y Auditoría

| Mecanismo | | Estado |
|---|---|---|
| OAuth2 Password Flow | | |
| JWT (access + refresh tokens) | | |
| RBAC — 3 roles | | `ADMIN · TECNICO · TECNICO_LABORATORIO` |
| Hash bcrypt | | |
| CORS restringido | | |
| Auditoría con valores anterior/nuevo | | |
| Rate limiting en login | | `10 req/min` |
| GZip compression | | `> 500 bytes` |

---

## Arquitectura del Sistema (3 Capas)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENTE (React + Vite + TS)                 │
│                                                                  │
│    Login  │   Dashboard  │   Inventory  │   Guarantees  │
│                Deliveries  │   Clients  │   Projects      │
│                                                                  │
│    14 rutas ·  Fusion UI Design System · 3 Temas CSS        │
│    PWA (Service Worker) · APK Android (Capacitor)            │
└──────────────────────────────────────────────────────────────────┘
           │
           │   Axios HTTP (JWT Bearer Token + Refresh)
           │   Proxy: /api → servidor backend

┌──────────────────────────────────────────────────────────────────┐
│              SERVIDOR DE APLICACIONES (FastAPI)                │
│                                                                  │
│    Uvicorn Workers · FastAPI 0.136 · Python 3.12              │
│                                                                  │
│    Auth  │   CRUD  │   Reports  │   Import             │
│    Analytics  │   Alerts  │   Monitoring                 │
│                                                                  │
│             82 endpoints REST bajo /api/v1/                   │
│             Despliegue: servidor corporativo o cloud           │
└──────────────────────────────────────────────────────────────────┘
           │
           │   SQLAlchemy Async (asyncpg / aiomysql)
           │   Pool de conexiones a base de datos

┌──────────────────────────────────────────────────────────────────┐
│                 BASE DE DATOS RELACIONAL                       │
│                                                                  │
│    usuarios  │   items  │   activos  │   garantias     │
│    audit_logs  │   alerts  │   clientes  │  ...           │
│                                                                  │
│    18 tablas ·  15 migraciones Alembic · Avatares en Base64  │
│    Motor: PostgreSQL / MySQL / MariaDB (segun entorno)        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Backend

<details>
<summary><b>Click para expandir la estructura completa del backend</b></summary>

```
Backend/
├── app/
│   ├── main.py                    # Punto de entrada FastAPI
│   ├── core/
│   │   ├── config.py              # Configuración (Settings con .env)
│   │   └── security.py            # JWT + bcrypt helpers
│   ├── db/
│   │   └── session.py             # AsyncSession, engine, Base declarativa
│   ├── models/                  # Modelos SQLAlchemy (18 tablas)
│   │   ├── user.py                # Usuario, Regional, SesionUsuario
│   │   ├── inventory.py           # Item, Activo, StockBulk, Movimiento...
│   │   ├── business.py            # Cliente, Proveedor, Proyecto
│   │   ├── deliveries.py          # ActaEntrega, DetalleActaEntrega
│   │   ├── guarantees.py          # Garantia
│   │   ├── alerts.py              # Alert, AlertRule
│   │   └── audit.py               # AuditLog
│   ├── schemas/                 # Schemas Pydantic (validación)
│   │   ├── auth.py                # Token, TokenData
│   │   ├── user.py                # UsuarioCreate/Update/Read
│   │   ├── inventory.py           # Item, Activo, Movimiento, EPP...
│   │   ├── business.py            # Cliente, Proyecto, Proveedor...
│   │   ├── deliveries.py          # ActaEntrega, DetalleActa
│   │   ├── alerts.py              # AlertRead, AlertUpdate
│   │   ├── audit.py               # AuditLog
│   │   └── tracking.py            # EPP, HistorialUbicacion
│   ├── crud/                    # Lógica de BD asíncrona
│   │   ├── crud_user.py
│   │   ├── crud_inventory.py
│   │   ├── crud_business.py
│   │   ├── crud_alerts.py
│   │   ├── crud_analytics.py
│   │   ├── crud_audit.py
│   │   └── crud_deliveries.py
│   ├── api/
│   │   ├── deps.py                # Dependencias (get_current_user...)
│   │   └── endpoints/           # Handlers de rutas (10 módulos)
│   │       ├── auth.py            # Login, refresh, logout...
│   │       ├── users.py           # CRUD usuarios, audit, settings...
│   │       ├── inventory.py       # CRUD items, activos, ubicaciones...
│   │       ├── business.py        # CRUD clientes, proyectos...
│   │       ├── analytics.py       # Summary, search global
│   │       ├── reports.py         # Exportación Excel/PDF
│   │       ├── alerts.py          # CRUD alertas, resumen...
│   │       ├── regionales.py      # Listado de regionales
│   │       ├── import_data.py     # Importación Excel (3 formatos)
│   │       └── monitoring.py      # Health check, metrics
│   └── services/
│       └── import_service.py      # Motor de importación Excel
├── migrations/                  # 14 versiones de migraciones Alembic
├── tests/
│   ├── conftest.py                # Configuración de tests (SQLite async)
│   ├── test_import_service.py     # Tests del motor de importación
│   └── test_main.py              # Tests de la API principal
├── scripts/
│   ├── init_db.py                 # Inicialización de BD + seed admin
│   ├── seed_admin.py              # Creación de usuario admin
│   ├── scheduler_alerts.py        # Evaluación programada de alertas
│   ├── trigger_alerts.py          # Evaluación manual de alertas
│   └── backup_db.py               # Backup con mysqldump
└── Base_de_datos/
    └── sigai_ses_db.sql           # Dump completo de BD (4941 líneas)
```
</details>

---

## Estructura del Frontend

<details>
<summary><b>Click para expandir la estructura completa del frontend</b></summary>

```
Frontend/src/
├── main.tsx                    # Punto de entrada
├── App.tsx                     # Router principal con 14 rutas
├── index.css                   # Estilos globales + Tailwind + 3 temas CSS
├── vite-env.d.ts               # Tipos de entorno VITE
├── context/
│   ├── AuthContext.tsx            # Contexto de autenticación JWT
│   └── ThemeContext.tsx           # Contexto de temas (green/blue/bone)
├── lib/
│   ├── toast.ts                  # Sistema de notificaciones toast
│   └── logger.ts                 # Logger estructurado
├── hooks/
│   ├── useInventory.ts           # Hook inventario (React Query)
│   ├── useUsers.ts               # CRUD usuarios
│   ├── useProjects.ts            # CRUD proyectos
│   ├── useGuarantees.ts          # CRUD garantías
│   ├── useClients.ts             # CRUD clientes
│   └── useAlerts.ts              # CRUD alertas
├── services/                   # Capa de API (axios con interceptores)
│   ├── api.ts                    # Instancia axios + refresh token
│   ├── auth.ts                   # Login, register, me
│   ├── users.ts                  # CRUD usuarios + avatar + settings
│   ├── inventory.ts             # Items, activos, ubicaciones, importación
│   ├── business.ts              # Clientes, proyectos, garantías, actas
│   ├── analytics.ts             # Dashboard stats, search global
│   ├── alerts.ts                # Alertas
│   ├── desmontes.ts             # Triage
│   ├── regionales.ts            # Regionales
│   ├── download.ts             # Descarga blob (web + Capacitor)
│   └── errorHandler.ts         # Parseo de errores API
├── components/                # Componentes reutilizables
│   ├── Fusion.tsx               # Design System (1069 líneas)
│   ├── DashboardComponents.tsx  # StatCard, QuickAccessBtn...
│   ├── ProtectedRoute.tsx       # Ruta protegida (requiere token)
│   ├── RoleProtectedRoute.tsx   # Ruta protegida por rol
│   ├── Toaster.tsx              # Portal de notificaciones toast
│   ├── ExportMenu.tsx           # Exportación PDF/Excel
│   ├── UserSettingsModal.tsx    # Modal de avatar + contraseña
│   ├── SearchableSelect.tsx     # Select con búsqueda
│   ├── Skeleton.tsx             # Placeholders de carga
│   └── ErrorBoundary.tsx        # Captura de errores React
└── pages/                    # 14 páginas + sub-páginas
    ├── Login.tsx                #  Inicio de sesión
    ├── Dashboard.tsx            #  Panel principal con KPIs
    ├── Inventory.tsx            #  Gestión de inventario
    ├── Clients.tsx              #  Directorio de clientes
    ├── ClientDetail.tsx         #  Detalle de cliente
    ├── Projects.tsx             #  Gestión de proyectos
    ├── ProjectDetail.tsx        #  Detalle de proyecto
    ├── Guarantees.tsx           #  Seguimiento de garantías
    ├── GuaranteeDetail.tsx      #  Detalle de garantía
    ├── Alerts.tsx               #  Centro de alertas
    ├── Audit.tsx                #  Bitácora de auditoría (solo ADMIN)
    ├── Users.tsx                #  Administración de usuarios (solo ADMIN)
    ├── Deliveries.tsx           #  Actas de entrega (solo ADMIN)
    │   ├── types.ts             #  Tipos y constantes de actas
    │   ├── ItemModal.tsx        #  Modal selección items
    │   ├── EditActaModal.tsx    #  Modal edición acta
    │   └── ActaViewModal.tsx    #  Modal vista acta
    ├── Settings.tsx             #  Configuración de usuario
    └── Desmontes.tsx            #  Triage de equipos desmontados
```
</details>

---

## Instalación Rápida

> [!WARNING]
> Asegúrate de tener los siguientes requisitos antes de comenzar:

| Requisito | Versión Mínima |
|---|---|---|
| **Python** | `3.12+` |
| **Node.js** | `18+` |
| **Base de datos** | PostgreSQL 16+ / MySQL 8.0+ / MariaDB 10.5+ |

### Backend

```bash
# 1. Clonar e ir al directorio
cd Backend

# 2. Crear entorno virtual
python -m venv .venv

# 3. Activar entorno
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar .env (ver .env.example)

# 6. Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# 1. Ir al directorio
cd Frontend

# 2. Instalar dependencias
npm install

# 3. Configurar .env
# VITE_API_BASE_URL=http://localhost:8000/api/v1

# 4. Iniciar en desarrollo
npm run dev

# 5. Generar versión de producción
npm run build
```

---

## Estado del Proyecto

<details>
<summary><b>Click para ver indicadores del proyecto</b></summary>

<br>

| Indicador | | Estado |
|---|---|---|
| **Versión Actual** | | `v1.0.0` — Producción |
| **Fecha** | | Julio 2026 |
| **Cobertura de Tests** | | 32 tests (backend) — CI pasa |
| **Endpoints API** | | 82 REST (`/api/v1/`) |
| **Tablas en BD** | | 18 |
| **Migraciones Alembic** | | 15 versiones |
| **Roles de Usuario** | | 3 (ADMIN, TECNICO, TECNICO_LABORATORIO) |
| **Temas UI** | | 3 (Verde, Azul Cobalto, Blanco Hueso) |
| **Despliegue** | | Servidor corporativo o cloud (GitHub Actions CI) |
| **Builds** | | Web (PWA) + APK Android + EXE Windows |

</details>

---

<p align="center">
  <b>SIGAI-SES</b> — <i>Sistema Integral de Gestión de Activos e Inventario</i><br><br>
  <img src="https://img.shields.io/badge/Desarrollado%20para-Securitas%20Colombia%20S.A.-003B71?style=for-the-badge&logo=security" alt="Securitas"><br><br>
   <b>Securitas Colombia S.A.</b> — <i>Unidad de Seguridad Electrónica (SES)</i><br>
   v1.0.0 ·  Julio 2026
</p>
