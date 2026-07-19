# ESTADO DEL PROYECTO — SIGAI-SES

**Sistema Integral de Gestión de Activos e Inventario — Seguridad Electrónica Securitas**

| Campo | Detalle |
|---|---|
| **Proyecto** | SIGAI-SES |
| **Autor/Pasante** | Wilson Ortiz |
| **Programa** | Tecnología en Análisis y Desarrollo de Software — SENA |
| **Modalidad** | Pasantía |
| **Destinatario** | Elkin David Velásquez Hernández — Gerente de Mantenimiento, SES |
| **Stack** | React 18 + TypeScript + Vite / FastAPI + SQLAlchemy async / MySQL 8.0 |
| **Última actualización** | Julio 2026 |

---

## 1. ARQUITECTURA

**Backend (FastAPI 0.110)**
- Python 3.12 + SQLAlchemy 2.0 async (aiomysql) + Pydantic v2
- Autenticación JWT (python-jose + passlib bcrypt)
- Endpoints organizados por módulo en `app/api/endpoints/`
- CRUD separado por entidad en `app/crud/`
- Modelos SQLAlchemy en `app/models/`, schemas Pydantic en `app/schemas/`
- Reportes PDF con ReportLab
- CORS configurable vía variable de entorno

**Frontend (React 18 + Vite + Tailwind)**
- SPA con React Router; sistema de diseño propio "Fusion UI"
- Componentes base en `src/components/Fusion.tsx` (Card, Button, TableContainer, Badge, NeoInput, NeoSelect, etc.)
- Consumo de API con Axios + interceptores JWT
- Contexto de autenticación global (`AuthContext`)
- ErrorBoundary global en `App.tsx`
- Custom hooks React Query para clientes, proyectos, garantías, usuarios, alertas

**Base de datos (MySQL 8.0)**
- Script DDL: `Backend/Base_de_datos/script_db_v2.sql`
- Esquema relacional con tablas: usuarios, items, activos, proyectos, clientes, movimientos_inventario, garantias, actas, auditoria, alertas, etc.

---

## 2. MÓDULOS — ESTADO DE IMPLEMENTACIÓN

### 2.1 Autenticación y Usuarios (RF-01, RF-02, RF-03)
- [x] Login JWT con refresh token
- [x] RBAC: ADMIN, SUPERVISOR, BODEGUERO, TÉCNICO
- [x] CRUD completo de usuarios (Admin)
- [x] Auditoría de sesiones y acciones críticas
- [x] Página de perfil de usuario

### 2.2 Catálogo e Inventario (RF-04, RF-05, RF-06)
- [x] CRUD de items en catálogo maestro (nombre, marca, referencia, categoría, subcategoría)
- [x] Activos serializados con asignación de ubicación (estante, pasillo)
- [x] Stock bulk para consumibles con stock mínimo y alertas
- [x] Vista de inventario con toggle "Eliminados" (soft-delete)
- [x] Costo total calculado (costo_unitario × cantidad_actual)
- [x] Paginación, búsqueda global y filtros
- [x] Importación masiva desde Excel
- [x] Reportes exportables (PDF/Excel)

### 2.3 Movimientos y Kardex (RF-07, RF-08)
- [x] Registro de entradas y salidas
- [x] Kardex digital con historial inmutable
- [ ] Vinculación automática de toda transacción con auditoría
- [ ] Dashboard de rotación de inventario

### 2.4 Actas de Entrega (RF-09, RF-10)
- [x] Creación de actas con selección de items
- [x] Tipos de acta: INSTALACION, RETIRO, PRESTAMO, TRASLADO, MANTENIMIENTO, MONITOREO, etc.
- [x] Edición de actas
- [x] Vista detalle de acta con descarga PDF
- [x] Marcado de descarga
- [x] Búsqueda escribible (SearchableSelect) en cliente, proyecto, técnico, representante
- [ ] Captura de firma digital táctil
- [ ] Generación de PDF con firma incrustada

### 2.5 Garantías (RF-11, RF-12)
- [x] Registro de casos de garantía
- [x] Flujo de estados: REGISTRADO → ENVIADO_PROVEEDOR → RECIBIDO → RESUELTO
- [x] Alertas de vencimiento por tiempo límite
- [x] Búsqueda escribible (SearchableSelect) en activo (serial) y proveedor
- [ ] Notificaciones automáticas por correo
- [ ] Adjuntar fotos de falla

### 2.6 Desmontes
- [x] Registro de equipos retirados de clientes
- [x] Proceso de triaje (FUNCIONAL, DAÑADO, CHATARRA)
- [x] Búsqueda escribible (SearchableSelect) en equipo, cliente, proyecto

### 2.7 Proyectos y Clientes
- [x] CRUD de clientes corporativos
- [x] CRUD de proyectos asociados a cliente
- [x] Búsqueda escribible en cliente responsable

### 2.8 Dashboard y Analíticas
- [x] Dashboard principal con métricas
- [x] Búsqueda global (items, clientes)
- [x] Auto-dismiss de inline alerts (4500ms)

### 2.9 Alertas
- [ ] Motor de reglas para alertas automáticas (stock bajo, vencimiento, sin movimiento, sobrestock)
- [ ] Tabla `alerts` y `alert_rules` en BD
- [ ] Scheduler periódico (APScheduler)
- [ ] Badge de alertas en sidebar
- [ ] Vista de dashboard de alertas con filtros

---

## 3. CORRECCIONES APLICADAS (Sesión Julio 2026)

### Backend
| # | Problema | Solución |
|---|---|---|
| 1 | ZeroDivisionError en `PaginatedResponse.create` | `max(1, page_size)` en denominador y numerador |
| 2 | Inventory `all_results=True` con total=0 | Pasar `max(1, total)` como `effective_page_size` |
| 3 | Búsqueda global no filtraba soft-deleted | Agregar `deleted_at.is_(None)` en Items y Clientes |
| 4 | CORS hardcodeado como `*` | Configurable desde `CORS_ALLOWED_ORIGINS` env var |
| 5 | Secrets en .env commiteados | Saneados, añadidos `.env.example` |
| 6 | Auditoría sin eager load de usuario | `selectinload(Usuario)` + search/accion params |
| 7 | Item "ollas" (id=138) deleted_at erróneo | Restaurado (deleted_at = None) |
| 8 | Token/TokenData sin refresh_token | Migrado a schemas de `user.py` |

### Frontend
| # | Problema | Solución |
|---|---|---|
| 1 | Falta SearchableSelect escribible | Nuevo componente `SearchableSelect.tsx` implementado en Desmontes, Deliveries, Garantías, Proyectos, Usuarios |
| 2 | Sin ErrorBoundary global | Creado e integrado en `App.tsx` |
| 3 | Sin auto-dismiss en alerts inline | useEffect con 4500ms en Clients, Projects, Guarantees, Inventory |
| 4 | Falta toggle "Eliminados" en inventario | Botón + backend `include_deleted` + estilo semi-transparente tachado |
| 5 | Costo total ausente en inventario | `costo_unitario × cantidad_actual` |
| 6 | Inventory service usaba skip/limit obsoleto | Migrado a page/page_size con cap all_results |
| 7 | Auditoría mostraba user_id en vez de nombre | Usa `usuario.nombre`; filtro por acción; oculta campos nulos |
| 8 | ItemModal categorías incompletas | Expandidas a todas las categorías de inventario |
| 9 | Null-safe search faltante | `.toLowerCase()` no falla si marca/atributo es null |
| 10 | Columna Fecha en actas campo incorrecto | Cambiado a `fecha_entrega` |
| 11 | EditActaModal: null acta + hooks tras early return | key prop + mover hooks antes del return |
| 12 | window.confirm disperso | Centralizado en ConfirmModal + reemplazado en páginas principales |
| 13 | console.log en Users.tsx | Eliminado |
| 14 | ImportService muerto en import_data.py | Eliminado |

---

## 4. PENDIENTE PRIORITARIO

### Alto (bugs / funcionalidad crítica)
- [ ] **Firma digital táctil** en actas (reemplazar react-signature-canvas eliminado)
- [ ] **Notificaciones automáticas** (correo/WhatsApp) para garantías vencidas
- [ ] **Pipeline CI** (lint, tests, build) + pre-commit hooks
- [ ] **Rotar secrets** usados en entornos públicos

### Medio (mejoras funcionales)
- [ ] **Módulo de alertas completo** (motor de reglas + scheduler + dashboard)
- [ ] **Dashboard de rotación** de inventario (consumo promedio 3 meses)
- [ ] **Offline-ready (PWA)** para consultas en campo sin conexión
- [ ] **QR code workflow** — escanear serial abre historial del activo
- [ ] **Pruebas unitarias** para endpoints de actas e importación

### Bajo (deuda técnica / polish)
- [ ] Regenerar `Frontend/dist` con build limpio
- [ ] Linter + formatter configurados en pre-commit
- [ ] Cobertura de tests: pytest + frontend tests
- [ ] Dockerizar ambos entornos con docker-compose
- [ ] Manual de usuario / capacitación

---

## 5. ESTRUCTURA DEL PROYECTO

```
Proyecto_SES/
├── Backend/
│   ├── app/
│   │   ├── api/endpoints/     # auth, inventory, business, users, analytics, import_data
│   │   ├── core/              # config, security (JWT)
│   │   ├── crud/              # crud_inventory, crud_deliveries, crud_analytics, etc.
│   │   ├── db/                # database.py, Base
│   │   ├── models/            # SQLAlchemy models (items, activos, users, actas, etc.)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── utils/             # PDF generation, email
│   │   └── main.py
│   ├── Base_de_datos/script_db_v2.sql
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── Frontend/
│   ├── src/
│   │   ├── components/        # Fusion.tsx, SearchableSelect, ExportMenu, ErrorBoundary
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useClients, useProjects, useGuarantees, useUsers, useAlerts
│   │   ├── pages/             # Dashboard, Inventory, Deliveries, Guarantees, Projects, etc.
│   │   │   └── deliveries/    # EditActaModal, ActaViewModal, ItemModal, types.ts
│   │   ├── services/          # api.ts, inventory.ts, users.ts, business.ts, etc.
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
└── DOCUMENTOS/                # Documentación técnica
```

---

## 6. NOTAS TÉCNICAS

- **Autenticación**: JWT con 480min de expiración. Refresh token implementado.
- **Soft-delete**: Items y usuarios usan `deleted_at`; búsqueda global los excluye por defecto.
- **Paginación**: Params `page` y `page_size` (no skip/limit) con máximo 500 por página.
- **CORS**: Configurable vía `CORS_ALLOWED_ORIGINS`; default `http://localhost:5173` en dev.
- **Roles**: ADMIN (total), SUPERVISOR (reportes/aprobaciones), BODEGUERO (entradas/salidas), TÉCNICO (consulta).
