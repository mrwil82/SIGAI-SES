<p align="center">
  <img src="https://img.shields.io/badge/Proyecto-SIGAI--SES-0055A4?style=for-the-badge&logo=git" alt="Proyecto">
  <img src="https://img.shields.io/badge/Estado-Release%20Candidate-success?style=for-the-badge&logo=github" alt="Estado">
  <img src="https://img.shields.io/badge/Versi%C3%B3n-v1.0.0-blue?style=for-the-badge&logo=semver" alt="Version">
  <img src="https://img.shields.io/badge/Julio-2026-FF6B35?style=for-the-badge&logo=calendar" alt="Fecha">
  <img src="https://img.shields.io/badge/Confidencial-Securitas%20Colombia-red?style=for-the-badge&logo=lock" alt="Confidencial">
</p>

<h1 align="center">
  ENTREGABLES SIGAI-SES
</h1>

<p align="center">
  <b>Sistema Integral de Gestion de Activos e Inventario</b><br>
  <i>Seguridad Electronica Securitas -- Colombia S.A.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker" alt="Docker">
</p>

---

> [!IMPORTANT]
> Este directorio contiene la **documentacion completa** del proyecto **SIGAI-SES** (Sistema Integral de Gestion de Activos e Inventario -- Seguridad Electronica Securitas), desarrollado para **ENEL Colombia**.

---

## Informacion del Proyecto

| Campo | Detalle |
|---|---|
| **Proyecto** | SIGAI-SES -- Sistema Integral de Gestion de Activos e Inventario |
| **Empresa** | Securitas Colombia S.A. -- Unidad de Seguridad Electronica (SES) |
| **Cliente** | ENEL Colombia (Subestaciones electricas de Cundinamarca) |
| **Autor** | Wilson Ortiz -- Pasante SENA (Analisis y Desarrollo de Software) |
| **Destinatario** | Elkin David Velasquez Hernandez -- Gerente de Mantenimiento SES |
| **Version Actual** | `v1.0.0` -- Release Candidate |
| **Fecha** | Julio 2026 |
| **Stack** | FastAPI + React + Vite + MySQL + Tailwind CSS |

---

## Estructura del Repositorio

<details>
<summary><b>Click para expandir la estructura completa</b></summary>

```
ENTREGABLES_SIGAI_SES/
├── 01_DOCUMENTACION_TECNICA/         # Documentacion para el equipo de desarrollo y TI
│   ├── 00_README_TECNICO.md           # Resumen tecnologico del proyecto
│   ├── 00_TOC.md                     # Tabla de contenidos tecnicos
│   ├── 02_GUIA_INSTALACION_BACKEND   # Instalacion del backend (FastAPI + MySQL)
│   ├── 03_GUIA_INSTALACION_FRONTEND  # Instalacion del frontend (React + Vite)
│   ├── 04_DICCIONARIO_DE_DATOS       # 18 tablas documentadas con campos y relaciones
│   ├── 05_GUIA_DESPLIEGUE_PRODUCCION # Despliegue cloud (GitHub + Railway + Vercel + TiDB)
│   ├── ARQUITECTURA/
│   │   ├── 01_ARQUITECTURA_SISTEMA   # Arquitectura por capas y componentes
│   │   └── 02_DIAGRAMAS_FLUJO       # Diagramas de procesos del negocio
│   ├── API_SPEC/
│   │   └── openapi.yaml              # Especificacion OpenAPI 3.0.3 (60+ endpoints)
│   ├── FAQ/
│   │   └── 01_FAQ_TECNICA           # 30+ preguntas tecnicas frecuentes
│   ├── MANUALES/
│   │   ├── 01_MANUAL_TECNICO         # Manual tecnico detallado del sistema
│   │   └── images/                   # Diagramas ER, arquitectura, flujos
│   ├── 06_GUIA_ON_PREMISE            # Despliegue en servidor corporativo local
│   ├── 07_PROCEDIMIENTOS_BACKUP      # Respaldo, restauracion y DRP
│   ├── 08_CATALOGO_ERRORES_API       # Codigos de error HTTP y mensajes
│   ├── 09_GUIA_MIGRACION_DATOS       # Migracion desde Excel/Legacy a SIGAI-SES
│   ├── 10_PLAN_CAPACITACION          # Plan de capacitacion para usuarios finales
│   ├── 11_GESTION_ALERTAS            # Diseno detallado del motor de alertas y reglas
│   └── datos_migracion/              # Archivos Excel legacy para migracion (3 archivos)
│
├── 02_DOCUMENTACION_GESTION/         # Documentacion para la gestion del proyecto
│   ├── 01_ESPECIFICACION_REQUISITOS  # 13 RF, 5 RNF, Roadmap 12 semanas
│   ├── 02_ESTADO_FINAL_PROYECTO      # Estado v1.0.0, auditoria, deuda tecnica
│   ├── 00_PROPUESTA_TECNICA          # Propuesta tecnica original v2.0 (documento fundacional)
│   └── 03_ACTA_DE_ENTREGA.pdf        # Acta de entrega formal firmada (PDF)
│
├── 03_DOCUMENTACION_USUARIO/         # Documentacion para usuarios del sistema
│   ├── 01_HISTORIAS_USUARIO          # 24 historias de usuario con criterios de aceptacion
│   ├── FAQ/
│   │   └── 01_FAQ_USUARIO           # 16 preguntas frecuentes para usuarios finales
│   └── MANUALES/
│       ├── 01_MANUAL_USUARIO_TECNICO # Manual paso a paso para tecnicos de campo
│       └── 02_MANUAL_ADMINISTRADOR   # Manual para administradores del sistema
│
├── 04_CALIDAD_Y_LEGAL/               # Documentacion de calidad y aspectos legales
│   ├── 01_PLAN_DE_PRUEBAS           # Plan de pruebas (unitarias, integracion, E2E, rendimiento, seguridad)
│   ├── 02_INFORME_SEGURIDAD         # Informe de seguridad OWASP Top 10 y vulnerabilidades
│   ├── 03_AVISO_DE_PRIVACIDAD       # Aviso de privacidad (Ley 1581 de 2012 Colombia)
│   └── POLITICAS_DE_CALIDAD         # Politicas de calidad del proyecto
│
├── CHANGELOG.md                      # Historial de versiones del proyecto
├── ACCESO_CLIENTE.md                 # Credenciales de prueba para el cliente
├── GUIA_ENTREGA_PROFESIONAL.md       # Guia para formatear y entregar documentacion
└── README.md                         # Este archivo
```

</details>

---

## Resumen de Documentos por Categoria

| Categoria | Archivos | Total Paginas | Contenido Principal |
|---|---|---|---|
| **Documentacion Tecnica** | 17 documentos | ~85 paginas | Instalacion, API, BD, despliegue, manual tecnico, guias operativas, alertas |
| **Gestion** | 4 documentos | ~9 paginas | Propuesta tecnica, requisitos, estado, acta de entrega formal |
| **Usuario** | 5 documentos | ~25 paginas | 24 HU, manuales tecnico/admin, FAQ |
| **Calidad y Legal** | 4 documentos | ~16 paginas | Pruebas, seguridad OWASP, privacidad, calidad |
| **Especificacion API** | 1 (YAML) | 1397 lineas | 60+ endpoints REST documentados |
| **Diagramas** | 6 Mermaid + 7 PNG | ~100 lineas | Arquitectura, flujos, ER |

---

## Stack Tecnologico

### Backend (FastAPI)

| Tecnologia | Version | Proposito |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="16"> **Python** | `3.12+` | Lenguaje base |
| **FastAPI** | `0.136.1` | Framework web asincrono |
| **SQLAlchemy** | `2.0.49` | ORM asincrono (aiomysql) |
| **MySQL/MariaDB** | `8.0+` | Base de datos relacional |
| **Alembic** | `1.18.4` | Migraciones de BD |
| **python-jose** | `3.5.0` | Tokens JWT (HS256) |
| **passlib[bcrypt]** | `1.7.4` | Hashing de contrasenas |
| **Pandas** | `3.0.3` | Procesamiento de Excel |
| **ReportLab** | `4.5.1` | Generacion de PDF |
| **XlsxWriter** | `3.2.9` | Exportacion Excel con streaming |
| **SlowAPI** | `0.1.9` | Rate limiting (10 req/min en login) |
| **Docker** | -- | Contenerizacion multi-etapa |

### Frontend (React + TypeScript)

| Tecnologia | Version | Proposito |
|---|---|---|
| **React** | `18.2` | Framework de interfaz de usuario |
| **TypeScript** | `5.2` | Tipado estatico |
| **Vite** | `5.2` | Bundler y dev server |
| **Tailwind CSS** | `3.4` | Estilos utilitarios |
| **TanStack React Query** | `5.101` | Fetching de datos con cache |
| **Axios** | `1.6.8` | HTTP client con interceptores JWT |
| **React Router DOM** | `6.22` | Ruteo SPA (11 rutas) |
| **Recharts** | `2.12` | Graficos (PieChart, BarChart) |
| **Lucide React** | `0.363` | Iconos |
| **react-signature-canvas** | `1.1` | Firmas digitales en actas |
| **xlsx** | `0.18.5` | Exportacion a Excel |

---

## Modulos del Sistema

<details>
<summary><b>1. Seguridad y Acceso</b></summary>

- [OK] Autenticacion OAuth2 + JWT (access/refresh tokens)
- RBAC con 3 roles: `ADMIN`, `TECNICO`, `TECNICO_LABORATORIO`
- Aislamiento de datos por regional
- Auditoria completa de acciones (`CREATE`/`UPDATE`/`DELETE`/`LOGIN`)
- Sesiones revocables (tabla `sesiones_usuario`)

</details>

<details>
<summary><b>2. Inventario y Catalogo</b></summary>

- Catalogo maestro de items con categorias, subcategorias y codigos SAP/CECO
- Activos serializados con trazabilidad individual
- Stock bulk para consumibles con alertas de minimo
- Historial de ubicaciones por activo
- Asignacion de EPP con fechas de vencimiento

</details>

<details>
<summary><b>3. Operaciones y Movimientos (Kardex Digital)</b></summary>

- Registro inmutable de entradas, salidas, traslados y devoluciones
- Actas de entrega digitales con firma tactile y PDF
- Desmontes con triaje (`BUENO`, `RECUPERABLE`, `DESECHO`)
- Integridad transaccional (movimiento siempre genera kardex)

</details>

<details>
<summary><b>4. Garantias</b></summary>

- Flujo completo de 5 estados: `Registrado -> Enviado -> Recibido -> Resuelto -> Entregado`
- Numeracion automatica `GSES-XXX`
- Alertas de estancamiento (15+ dias sin avance)
- Vinculacion directa con serial del activo y proveedor

</details>

<details>
<summary><b>5. Alertas</b></summary>

- Motor de reglas automatico (APScheduler cada 15 min)
- 4 reglas predefinidas: `stock_bajo`, `vencimiento`, `sin_movimiento`, `sobrestock`
- Estados: `activa`, `reconocida`, `resuelta`, `ignorada`
- Cooldown inteligente para evitar duplicados
- SLA con escalamiento automatico

</details>

<details>
<summary><b>6. Importacion Inteligente</b></summary>

- Auto-deteccion de tipo de archivo Excel
- Upsert (crea o actualiza segun exista)
- Normalizacion de datos y validacion de columnas
- Transaccional: todo o nada
- Soporte para inventario, clientes y garantias

</details>

<details>
<summary><b>7. Reportes y Analiticas</b></summary>

- Exportacion a Excel (XlsxWriter con streaming para +30k registros)
- Exportacion a PDF (ReportLab con diseno corporativo)
- Dashboard con KPIs (activos totales, en garantia, stock critico, eficiencia lab)
- Busqueda global en items, activos, clientes y proyectos

</details>

---

## Resumen Cuantitativo del Proyecto

| Metrica | Valor |
|---|---|
| Total de archivos de documentacion | `30 documentos` |
| Total lineas de documentacion | `~4,200 lineas` |
| Tablas de base de datos | `18` |
| Endpoints de API | `60+` |
| Historias de usuario | `24` |
| Requisitos funcionales | `13` |
| Roles de usuario | `3` |
| Diagramas (MMD + PNG) | `13` |
| Archivos Excel de datos reales | `3` (147 garantias, 17 clientes, 34 herramientas) |

---

## Enlaces Rapidos

### Documentacion Tecnica

| Documento | Descripcion |
|---|---|
| [README TECNICO](./01_DOCUMENTACION_TECNICA/00_README_TECNICO.md) | Resumen tecnologico del proyecto |
| [GUIA INSTALACION BACKEND](./01_DOCUMENTACION_TECNICA/02_GUIA_INSTALACION_BACKEND.md) | Instalacion del backend FastAPI |
| [GUIA INSTALACION FRONTEND](./01_DOCUMENTACION_TECNICA/03_GUIA_INSTALACION_FRONTEND.md) | Instalacion del frontend React |
| [DICCIONARIO DE DATOS](./01_DOCUMENTACION_TECNICA/04_DICCIONARIO_DE_DATOS.md) | Diccionario de datos (18 tablas) |
| [GUIA DESPLIEGUE](./01_DOCUMENTACION_TECNICA/05_GUIA_DESPLIEGUE_PRODUCCION.md) | Despliegue en Railway + Vercel + TiDB |
| [GUIA ON-PREMISE](./01_DOCUMENTACION_TECNICA/06_GUIA_ON_PREMISE.md) | Despliegue en servidor corporativo local |
| [GESTION DE ALERTAS](./01_DOCUMENTACION_TECNICA/11_GESTION_ALERTAS.md) | Diseno del motor de alertas y reglas |
| [API SPEC](./01_DOCUMENTACION_TECNICA/API_SPEC/openapi.yaml) | Especificacion OpenAPI de la API REST |

### Documentacion de Gestion

| Documento | Descripcion |
|---|---|
| [PROPUESTA TECNICA](./02_DOCUMENTACION_GESTION/00_PROPUESTA_TECNICA.md) | Propuesta tecnica original v2.0 |
| [ESPECIFICACION REQUISITOS](./02_DOCUMENTACION_GESTION/01_ESPECIFICACION_REQUISITOS.md) | Requisitos funcionales y roadmap |

### Documentacion de Usuario

| Documento | Descripcion |
|---|---|
| [MANUAL USUARIO TECNICO](./03_DOCUMENTACION_USUARIO/MANUALES/01_MANUAL_USUARIO_TECNICO.md) | Manual para tecnicos de campo |
| [MANUAL ADMINISTRADOR](./03_DOCUMENTACION_USUARIO/MANUALES/02_MANUAL_ADMINISTRADOR.md) | Manual para administradores |
| [HISTORIAS DE USUARIO](./03_DOCUMENTACION_USUARIO/01_HISTORIAS_USUARIO.md) | 24 historias de usuario |

### Documentacion de Calidad y Legal

| Documento | Descripcion |
|---|---|
| [PLAN DE PRUEBAS](./04_CALIDAD_Y_LEGAL/01_PLAN_DE_PRUEBAS.md) | Plan de pruebas completo |
| [INFORME SEGURIDAD](./04_CALIDAD_Y_LEGAL/02_INFORME_SEGURIDAD.md) | Informe de seguridad OWASP Top 10 |

---

> [!TIP]
> **Consejo:** Usa el archivo [`GUIA_ENTREGA_PROFESIONAL.md`](./GUIA_ENTREGA_PROFESIONAL.md) para convertir toda esta documentacion a PDF profesional con Pandoc + LaTeX.

---

<p align="center">
  <img src="https://img.shields.io/badge/Desarrollado%20para-Securitas%20Colombia%20S.A.-0055A4?style=for-the-badge" alt="Desarrollado para Securitas">
  <img src="https://img.shields.io/badge/Unidad-Seguridad%20Electr%C3%B3nica%20(SES)-00A3E0?style=for-the-badge" alt="SES">
</p>

<p align="center">
  <i>Wilson Ortiz -- Pasante SENA . Julio 2026</i>
</p>
