<p align="center">
  <img src="https://img.shields.io/badge/CHANGELOG-SIGAI--SES-0055A4?style=for-the-badge&logo=git" alt="Changelog">
  <img src="https://img.shields.io/badge/Versi%C3%B3n-v1.0.0-blue?style=for-the-badge&logo=semver" alt="Version">
  <img src="https://img.shields.io/badge/Release%20Candidate-Julio%202026-success?style=for-the-badge&logo=github" alt="Release">
  <img src="https://img.shields.io/badge/Sprints-6-FF6B35?style=for-the-badge&logo=agile" alt="Sprints">
</p>

<h1 align="center">
  CHANGELOG - SIGAI-SES
</h1>

<p align="center">
  <i>Sistema Integral de Gestion de Activos e Inventario</i><br>
  <b>Securitas Colombia S.A. - Unidad de Seguridad Electronica (SES)</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/dynamic/json?label=commits&query=%24.total&url=https%3A%2F%2Fapi.github.com%2Frepos%2F&color=brightgreen" alt="Commits">
  <img src="https://img.shields.io/badge/Release-RC1-orange" alt="Release">
  <img src="https://img.shields.io/badge/Estado-Estable-brightgreen" alt="Estado">
</p>

---

## v1.0.0 (Julio 2026)

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-RELEASE%20CANDIDATE-success?style=for-the-badge&logo=checkmarx" alt="RC">
</p>

### Documentacion

> [!NOTE]
> Revision y unificacion completa de toda la documentacion del proyecto.

| Que | Descripcion |
|---|---|
| Fusion | Documentos de `DOCUMENTOS/` y `ENTREGABLES_SIGAI_SES/` unificados |
| README principal | Informacion detallada del stack, modulos y metricas |
| README tecnico | Estructura completa de backend y frontend |
| Arquitectura | ADRs, patrones de diseno y tabla de permisos |
| Diagramas de flujo | 7 flujos detallados (garantias, actas, importacion, autenticacion, usuarios) |
| Requisitos | Unificados: 24 RF (antes 13), 5 RNF, roadmap 6 sprints |
| Estado del proyecto | Hallazgos de auditoria y correcciones aplicadas |
| Manual administrador | Expandido de 57 a ~350 lineas (auditoria, actas, configuracion avanzada) |
| Informe seguridad | Hallazgos reales de auditoria y evaluacion OWASP detallada |
| FAQ tecnico | Docker, pool de BD, CORS, troubleshooting de migraciones |

### Documentos Nuevos

| # | Documento | Proposito |
|---|---|---|
| 1 | `06_GUIA_ON_PREMISE.md` | Despliegue en servidor corporativo local con Nginx + Systemd + Let's Encrypt |
| 2 | `07_PROCEDIMIENTOS_BACKUP.md` | Backup y Disaster Recovery con RPO/RTO, scripts automatizados |
| 3 | `08_CATALOGO_ERRORES_API.md` | Catalogo completo de errores HTTP por endpoint |
| 4 | `09_GUIA_MIGRACION_DATOS.md` | Migracion desde Excel legacy a SIGAI-SES |
| 5 | `10_PLAN_CAPACITACION.md` | Plan de capacitacion con modulos por perfil |

### Correcciones Detectadas y Aplicadas

| Hallazgo | Accion | Estado |
|---|---|---|
| Secretos en repo | `.env` saneados, creados `.env.example` | [CORREGIDO] |
| CORS permisivo | Configurable desde variable de entorno | [CORREGIDO] |
| Credenciales en locustfile | Ahora usa variables de entorno | [CORREGIDO] |
| UX inconsistente | ConfirmModal centralizado en Fusion.tsx | [CORREGIDO] |
| Logs/debug | `console.log` eliminados de Users.tsx | [CORREGIDO] |
| Lazy loading | `selectinload` en crud_deliveries | [CORREGIDO] |

---

## v0.9.0 (Junio 2026)

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PRE--RELEASE-yellow?style=for-the-badge" alt="Pre-release">
</p>

### Features Implementados

| Modulo | Descripcion | Progreso |
|---|---|---|
| Autenticacion | JWT completo con refresh token | [OK] 100% |
| Usuarios | CRUD con roles y regionales | [OK] 100% |
| Inventario | CRUD con items y activos serializados | [OK] 100% |
| Importacion Excel | Upsert con validacion | [OK] 100% |
| Dashboard | KPIs basicos | [OK] 100% |
| Garantias | Modulo completo | [OK] 100% |
| Actas de entrega | Firma digital incluida | [OK] 100% |
| Desmontes | Triaje (BUENO, RECUPERABLE, DESECHO) | [OK] 100% |
| Alertas | Motor automatico | [OK] 100% |
| Auditoria | Registro de acciones | [OK] 100% |

### Documentacion Creada

- Estructura completa de `ENTREGABLES_SIGAI_SES`
- Documentos tecnicos: instalacion backend/frontend, diccionario de datos, despliegue
- Documentos de gestion: requisitos, estado, acta de entrega
- Documentos de usuario: 24 HU, FAQ, manuales
- Documentos de calidad: plan de pruebas, seguridad, privacidad, calidad

---

## v0.5.0 (Mayo 2026)

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-MVP%20FUNCIONAL-orange?style=for-the-badge" alt="MVP">
</p>

### Funcionalidades Base

| Componente | Detalle | Progreso |
|---|---|---|
| Backend | FastAPI con SQLAlchemy async | [OK] 100% |
| Frontend | React + Vite + Tailwind | [OK] 100% |
| CRUD basico | Items y activos | [OK] 100% |
| Login | Basico con JWT | [OK] 100% |
| Base de datos | Conexion a MySQL | [OK] 100% |

### Documentacion Inicial

- Propuesta tecnica v2.0 (`PROPUESTA_GESTION_INVENTARIO_SES.md`)
- Especificacion de requisitos inicial
- Historias de usuario iniciales (6 HU)
- Documentos de arquitectura
- Plan de alertas (`gestion_alertas_ses.md`)

---

## v0.1.0 (Abril 2026)

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PROTOTIPO%20INICIAL-red?style=for-the-badge" alt="Prototipo">
</p>

### Base del Proyecto

| Componente | Estado |
|---|---|
| Configuracion del proyecto | [OK] Completo |
| Estructura backend | [OK] Creada |
| Estructura frontend | [OK] Creada |
| Modelos de base de datos | [OK] Primeros modelos |
| Documentacion inicial | [OK] Creada |

> [!NOTE]
> **Inicio del desarrollo.** Abril 2026 marca el nacimiento de SIGAI-SES.

---

## Linea de Tiempo

```mermaid
gantt
    title SIGAI-SES Roadmap
    dateFormat  YYYY-MM
    axisFormat  %b %Y
    
    section Prototipo
    v0.1.0 - Prototipo inicial          :done, 2026-04, 1M
    
    section MVP
    v0.5.0 - MVP Funcional              :done, 2026-05, 1M
    
    section Pre-release
    v0.9.0 - Features + Docs            :done, 2026-06, 1M
    
    section Release
    v1.0.0 - Release Candidate          :done, 2026-07, 1M
    
    section Futuro
    v1.1.0 - Mejoras continuas         :active, 2026-08, 2M
```

---

## Resumen de Versiones

| Version | Fecha | Estado | Cambios |
|---|---|---|---|
| **v1.0.0** | Julio 2026 | Release Candidate | Docs completas, 10 nuevos docs, correcciones de seguridad |
| **v0.9.0** | Junio 2026 | Pre-release | 10 modulos funcionales, documentacion completa |
| **v0.5.0** | Mayo 2026 | MVP Funcional | CRUD base, login, arquitectura inicial |
| **v0.1.0** | Abril 2026 | Prototipo | Configuracion inicial, estructura base |

---

<p align="center">
  <img src="https://img.shields.io/badge/SIGAI--SES-v1.0.0-blue?style=for-the-badge" alt="SIGAI-SES">
  <img src="https://img.shields.io/badge/Desarrollado%20por-Wilson%20Ortiz-success?style=for-the-badge" alt="Wilson Ortiz">
</p>

<p align="center">
  <i>Ultima actualizacion: Julio 2026</i>
</p>
