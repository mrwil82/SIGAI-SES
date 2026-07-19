---
title: "SIGAI-SES — Especificación de Requerimientos v2.0"
---

# SIGAI-SES — Especificación de Requerimientos v2.0

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0--Senior-blue?style=for-the-badge&logo=target" alt="Version 2.0">
  <img src="https://img.shields.io/badge/Status-APROBADO-brightgreen?style=for-the-badge&logo=checkmarx" alt="Status">
  <img src="https://img.shields.io/badge/Cliente-ENEL%20Colombia-orange?style=for-the-badge&logo=flash" alt="Cliente">
  <img src="https://img.shields.io/badge/Proyecto-SIGAI--SES-important?style=for-the-badge&logo=codeigniter" alt="Proyecto">
  <img src="https://img.shields.io/badge/Periodo-Mayo--Julio%202026-yellow?style=for-the-badge&logo=calendar" alt="Periodo">
  <img src="https://img.shields.io/badge/RFs-24%20Funcionales-9cf?style=for-the-badge&logo=bookstack" alt="RFs">
  <img src="https://img.shields.io/badge/RNFs-5%20No%20Funcionales-ff69b4?style=for-the-badge&logo=shield" alt="RNFs">
</p>

---

## Informacion General

| Campo | Detalle |
|:---|---:|
| **Proyecto** | `SIGAI-SES` — Sistema Integral de Gestion de Activos e Inventario |
| **Empresa** | Securitas Colombia S.A. — Unidad de Seguridad Electronica (SES) |
| **Cliente final** | ENEL Colombia (Subestaciones electricas de Cundinamarca) |
| **Autor** | Wilson Ortiz — Pasante SENA |
| **Version** | `2.0` (Revision Senior) |
| **Fecha** | Mayo — Julio 2026 |

---

> [!NOTE]
> Este documento define el alcance completo del sistema **SIGAI-SES**, incluyendo **24 requerimientos funcionales** organizados en **8 modulos**, **5 requerimientos no funcionales**, y un **roadmap de 6 sprints (12 semanas)** para su implementacion.

---

## 1. Requerimientos Funcionales (RF)

### 1.1 Modulo de Seguridad y Acceso

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-01** | Control de Acceso (RBAC) | Tres niveles de acceso: `ADMIN` (Total), `TECNICO` (Consulta/Reportes/Garantias), `TECNICO_LABORATORIO` (Triage/Desmontes/Inventario). Datos aislados por regional. | **Alta** |
| **RF-02** | Autenticacion JWT | Sesiones seguras con **access token** (8h) y **refresh token** (7d). Renovacion automatica mediante interceptor Axios. | **Alta** |
| **RF-03** | Auditoria de Sesiones | Registro detallado de todas las acciones `CREATE / UPDATE / DELETE / LOGIN` con valores anterior y nuevo en formato JSON. | **Alta** |

### 1.2 Modulo de Catalogo e Inventario

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-04** | Maestro de Items | Catalogo con nombre, marca, referencia unica, **8 categorias** (`MONITOREO`, `MANTENIMIENTO`, `INSTALACION`, `SOLUCIONES`, `EPP`, `CONSUMIBLE`, `HERRAMIENTA_LAB`, `REPUESTO`), subcategoria, codigo SAP/CECO, stock minimo, compra maxima, costo unitario. | **Alta** |
| **RF-05** | Activos Serializados | Control individual por **numero de serie unico** para equipos criticos. **8 estados**: `DISPONIBLE`, `INSTALADO`, `EN_GARANTIA`, `REPARADO`, `LABORATORIO`, `DESMONTE`, `BAJA`, `OBSOLETO`. | **Alta** |
| **RF-06** | Inventario Bulk (Consumibles) | Control de stock por cantidades decimales para EPP y consumibles. Alerta automatica cuando `cantidad < stock minimo`. Tabla `stock_bulk` con `punto_recompra_alerta`. | **Alta** |
| **RF-07** | Gestion de Laboratorio | Seguimiento de equipos con placa de activo fijo, fecha de ingreso, fecha de triaje, calificacion tecnica (`BUENO` / `RECUPERABLE` / `Desecho`). | **Media** |

### 1.3 Modulo de Operaciones y Movimientos

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-08** | Kardex Digital | Historial **inmutable** de cada movimiento (`ENTRADA_COMPRA`, `SALIDA_INSTALACION`, `TRASLADO`, `DEVOLUCION`, `BAJA_DAÑO`, `AJUSTE`, `INGRESO_DESMONTE`). Registro: usuario, fecha, origen, destino, cantidad. | **Alta** |
| **RF-09** | Gestion de Desmontes | Proceso de triaje para equipos retirados con **3 calificaciones**: `BUENO` (reingreso), `RECUPERABLE` (reparacion), `DESECHO` (baja). Registro masivo via Excel. | **Media** |
| **RF-10** | Actas Digitales | Generacion de actas **PDF** con firma tactil (`react-signature-canvas`). **5 tipos**: `ENTREGA_EPP`, `ENTREGA_HERRAMIENTA`, `DESPACHO_PROYECTO`, `DEVOLUCION`, `INGRESO_DESMONTE`. | **Alta** |
| **RF-11** | Asignacion de Responsables | Vinculacion de activos a area del cliente, responsable en sitio, proyecto actual. Historial completo de asignaciones previas. | **Media** |

### 1.4 Modulo de Garantias

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-12** | Seguimiento de Casos | Flujo de **5 estados**: `REGISTRADO -> ENVIADO_PROVEEDOR -> RECIBIDO_PROVEEDOR -> RESUELTO_REEMPLAZADO -> ENTREGADO_CLIENTE`. Numeracion automatica `GSES-XXX`. | **Alta** |
| **RF-13** | Alertas de Vencimiento | Notificacion automatica cuando un caso supera **15 dias** sin cambio de estado. Alerta **CRITICA** en dashboard. | **Media** |

### 1.5 Modulo de Alertas

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-14** | Motor de Reglas | **4 reglas predefinidas**: `stock_bajo` (critica), `vencimiento` (alta), `sin_movimiento` (media), `sobrestock` (baja). Evaluacion cada **15 min** via `APScheduler`. | **Alta** |
| **RF-15** | Gestion de Alertas | Estados: `activa`, `reconocida`, `resuelta`, `ignorada`. Cooldown configurable (default **24h**) para evitar duplicados. | **Media** |
| **RF-16** | SLA y Escalamiento | Si alerta **CRITICA** no se reconoce en **> 2 horas**, escalar automaticamente al supervisor. | **Baja** |

### 1.6 Modulo de Importacion

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-17** | Importacion Excel | Carga masiva con **auto-deteccion de tipo** (inventario, clientes, garantias). Logica **upsert** (crea si no existe, actualiza si existe). Transaccional (todo o nada). | **Alta** |
| **RF-18** | Validacion y Normalizacion | Validacion de columnas obligatorias, tipos de datos, unicidad de seriales/referencias. Normalizacion de formato (mayusculas, espacios, caracteres especiales). | **Alta** |

### 1.7 Modulo de Reportes

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-19** | Exportacion Excel | Streaming con **XlsxWriter** (modo `constant_memory`) para **+30,000 registros**. Formato corporativo con logo Securitas. 5 modulos exportables. | **Media** |
| **RF-20** | Exportacion PDF | **ReportLab** con tabla paginada y diseno corporativo. Ideal para actas de entrega y reportes ejecutivos. | **Media** |
| **RF-21** | Dashboard Analitico | KPIs: total activos, en garantia, stock critico, eficiencia laboratorio. Graficos (`PieChart`, `BarChart`) con **Recharts**. Filtro temporal (hoy, semana, mes). | **Media** |

### 1.8 Modulo de Administracion

| ID | Nombre | Descripcion | Prioridad |
|:---:|:---|---:|:---:|
| **RF-22** | Gestion de Regionales | CRUD de ciudades/regiones. **Aislamiento de datos**: usuario solo ve su regional. Admin ve todas. | **Alta** |
| **RF-23** | Busqueda Global | Busqueda en items, activos, clientes y proyectos. Respuesta con **minimo 2 caracteres**. Resultados agrupados por entidad. | **Media** |
| **RF-24** | Configuracion de Usuario | Avatar, cambio de contrasena, preferencias de interfaz. | **Baja** |

---

## 2. Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripcion | Criterio de Aceptacion |
|:---:|:---|---|:---|
| **RNF-01** | Disponibilidad (PWA) | Accesible desde dispositivos moviles. Consulta **offline** del inventario asignado. | Interfaz responsiva, funciona en Chrome/Safari movil |
| **RNF-02** | Escalabilidad | Backend capaz de manejar **50,000 registros** sin degradacion. | Pool de conexiones 30/50, streaming, paginacion |
| **RNF-03** | Seguridad de Datos | Encriptacion con **bcrypt**, JWT con expiracion, HTTPS, CORS restringido. | Passwords hasheados, tokens HS256, HTTPS obligatorio |
| **RNF-04** | Usabilidad | **Mobile-First**, optimizado para uso con guantes o baja iluminacion. | Alto contraste, sidebar colapsable, tipografia clara |
| **RNF-05** | Integridad | Transacciones **SQL** para operaciones atomicas. Toda salida genera movimiento en Kardex. | `session.commit()` en operaciones multi-tabla |

---

## 3. Plan de Ejecucion (Roadmap)

> [!TIP]
> El proyecto se divide en **6 sprints** con una duracion total de **12 semanas**, avanzando desde la base tecnica hasta el despliegue final.

### Sprint 1: Cimientos y Auth (Semanas 1-2)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| Configuracion de entornos y Base de Datos | PostgreSQL / TiDB | Completado |
| API de Autenticacion y Gestion de Usuarios | FastAPI + JWT | Completado |
| Estructura base del Frontend | Vite + React + Tailwind | Completado |
| Modelos iniciales | usuarios, regionales, sesiones_usuario | Completado |

### Sprint 2: Catalogo y Stock Inicial (Semanas 3-4)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| CRUD de Items y Clientes Corporativos | FastAPI + React | Completado |
| Importador masivo desde Excel | pandas + openpyxl | Completado |
| Dashboard de stock actual | Recharts | Completado |
| Modelos | items, activos, stock_bulk, clientes, proveedores | Completado |

### Sprint 3: Operaciones y Kardex (Semanas 5-6)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| Logica de Entradas y Salidas | FastAPI + SQLAlchemy | Completado |
| Registro automatico de movimientos | Auditoria | Completado |
| Gestion de herramientas de Laboratorio | CRUD + estados | Completado |
| Modelos | movimientos_inventario, historial_ubicaciones, audit_logs | Completado |

### Sprint 4: Actas y Garantias (Semanas 7-8)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| Generacion de Actas PDF con firma digital | ReportLab + react-signature-canvas | Completado |
| Modulo completo de Garantias | Flujo de 5 estados | Completado |
| Modelos | actas_entrega, detalles_acta, garantias | Completado |

### Sprint 5: Desmontes y Alertas (Semanas 9-10)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| Flujo de triaje para desmontes | 3 calificaciones + Excel | Completado |
| Motor de reglas para alertas automaticas | APScheduler | Completado |
| Dashboard con KPIs de rotacion y mermas | Recharts | Completado |
| Modelos | alerts, alert_rules | Completado |

### Sprint 6: Despliegue y Cierre (Semanas 11-12)

| Actividad | Tecnologia | Estado |
|:---|---:|:---:|
| Dockerizacion y despliegue | Railway + Vercel + TiDB Cloud | Completado |
| Pruebas de integracion | pytest + httpx | Completado |
| Documentacion tecnica final | Markdown + Swagger | Completado |
| Capacitacion de usuarios | Sesiones guiadas | Completado |

---

## 4. Matriz de Funcionalidades por Modulo

> [!NOTE]
> **23 de 24** funcionalidades implementadas. Solo `SLA y escalamiento` permanece planificado para version futura.

| Modulo | Funcionalidad | Prioridad | Estado |
|:---|---|:---:|:---:|
| Seguridad | Login JWT con refresh token | Alta | **IMPLEMENTADO** |
| Seguridad | RBAC (3 roles) | Alta | **IMPLEMENTADO** |
| Seguridad | Auditoria de acciones | Alta | **IMPLEMENTADO** |
| Seguridad | Aislamiento por regional | Alta | **IMPLEMENTADO** |
| Inventario | CRUD Catalogo | Alta | **IMPLEMENTADO** |
| Inventario | Activos serializados | Alta | **IMPLEMENTADO** |
| Inventario | Stock bulk con alertas | Alta | **IMPLEMENTADO** |
| Inventario | Historial de ubicaciones | Alta | **IMPLEMENTADO** |
| Inventario | Asignacion EPP | Media | **IMPLEMENTADO** |
| Operaciones | Kardex digital inmutable | Alta | **IMPLEMENTADO** |
| Operaciones | Actas PDF con firma | Alta | **IMPLEMENTADO** |
| Operaciones | Desmontes y triaje | Alta | **IMPLEMENTADO** |
| Garantias | Flujo de estados | Alta | **IMPLEMENTADO** |
| Garantias | Alertas de estancamiento | Media | **IMPLEMENTADO** |
| Alertas | Motor de reglas automatico | Alta | **IMPLEMENTADO** |
| Alertas | SLA y escalamiento | Baja | **PLANIFICADO** |
| Importacion | Excel con upsert | Alta | **IMPLEMENTADO** |
| Importacion | Validacion y normalizacion | Media | **IMPLEMENTADO** |
| Reportes | Exportacion Excel streaming | Media | **IMPLEMENTADO** |
| Reportes | Exportacion PDF | Media | **IMPLEMENTADO** |
| Reportes | Dashboard con KPIs | Media | **IMPLEMENTADO** |
| Admin | Gestion de usuarios | Alta | **IMPLEMENTADO** |
| Admin | Busqueda global | Media | **IMPLEMENTADO** |
| Admin | Configuracion de usuario | Baja | **IMPLEMENTADO** |

### Progreso General por Modulo

| Modulo | Implementado | Planificado | Progreso |
|:---|---:|:---:|:---:|
| Seguridad | 4 | 0 | `████████░░` 100% |
| Inventario | 5 | 0 | `████████░░` 100% |
| Operaciones | 3 | 0 | `████████░░` 100% |
| Garantias | 2 | 0 | `████████░░` 100% |
| Alertas | 1 | 1 | `██████░░░░` 50% |
| Importacion | 2 | 0 | `████████░░` 100% |
| Reportes | 3 | 0 | `████████░░` 100% |
| Admin | 3 | 0 | `████████░░` 100% |
| **Total** | **23** | **1** | `████████░░` **96%** |

---

### Etiquetas del Proyecto

| Tag | Valor |
|:---|:---|
| `Version` | `v2.0` |
| `Empresa` | `Securitas Colombia S.A.` |
| `Cliente` | `ENEL Colombia` |
| `Backend` | `FastAPI · SQLAlchemy · Python 3.12` |
| `Frontend` | `React 18 · TypeScript · Tailwind CSS` |
| `Base de Datos` | `PostgreSQL / TiDB` |
| `Deploy` | `Railway · Vercel · Docker` |
| `Periodo` | `Mayo — Julio 2026` |

---

> *Documento actualizado al: **Julio 2026 — v2.0***
