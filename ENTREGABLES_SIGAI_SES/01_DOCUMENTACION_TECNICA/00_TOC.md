---
title: "SIGAI-SES — Tabla de Contenidos Técnicos"
---

# SIGAI-SES — Tabla de Contenidos Técnicos

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Completo-2ea44f?style=for-the-badge&logo=markdown" alt="Estado">
  <img src="https://img.shields.io/badge/Documentos-29%20archivos-0078D4?style=for-the-badge&logo=readthedocs" alt="Documentos">
  <img src="https://img.shields.io/badge/Actualizado-Julio%202026-FF6F00?style=for-the-badge&logo=calendar" alt="Actualizado">
  <img src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-FF0000?style=for-the-badge&logo=googletranslate" alt="Idioma">
</p>

---

## Acceso Rápido a la Documentación

> [!TIP]
> Usa los enlaces de navegación rápida para saltar directamente a la sección que necesites.

---

### 1. Información General

| Documento | Descripción | Enlace |
|---|---|---|
| `README Principal` | Índice general del repositorio | [Leer](../README.md) |
| `README Técnico` | Resumen tecnológico y stack completo | [Leer](00_README_TECNICO.md) |
| `CHANGELOG` | Historial de versiones del sistema | [Leer](../CHANGELOG.md) |
| `Acceso Cliente` | Credenciales de prueba para el cliente | [Leer](../ACCESO_CLIENTE.md) |
| `Guía Entrega Profesional` | Guía para formatear documentación | [Leer](../GUIA_ENTREGA_PROFESIONAL.md) |

---

### 2. Instalación

| Documento | Descripción | Enlace |
|---|---|---|
| `Guía Instalación Backend` | FastAPI + MySQL/MariaDB | [Leer](02_GUIA_INSTALACION_BACKEND.md) |
| `Guía Instalación Frontend` | React + Vite + TypeScript | [Leer](03_GUIA_INSTALACION_FRONTEND.md) |

---

### 3. Base de Datos

| Documento | Descripción | Enlace |
|---|---|---|
| `Diccionario de Datos` | **18 tablas** documentadas con campos, tipos y relaciones | [Leer](04_DICCIONARIO_DE_DATOS.md) |

---

### 4. Despliegue

| Documento | Descripción | Enlace |
|---|---|---|
| `Guía Despliegue Producción (Cloud)` | Railway + Vercel + TiDB Cloud | [Leer](05_GUIA_DESPLIEGUE_PRODUCCION.md) |
| `Guía Despliegue On-Premise` | Nginx + Systemd + Let's Encrypt | [Leer](06_GUIA_ON_PREMISE.md) |

---

### 5. Arquitectura

| Documento | Descripción | Enlace |
|---|---|---|
| `Arquitectura del Sistema` | Capas, componentes, ADRs, patrones | [Leer](ARQUITECTURA/01_ARQUITECTURA_SISTEMA.md) |
| `Diagramas de Flujo` | **7 flujos** de negocio detallados | [Leer](ARQUITECTURA/02_DIAGRAMAS_FLUJO_Y_PROCESOS.md) |

---

### 6. API

| Documento | Descripción | Enlace |
|---|---|---|
| `Especificación OpenAPI` | **60+ endpoints** REST documentados | [Leer](API_SPEC/openapi.yaml) |
| `Catálogo de Errores` | Códigos HTTP y mensajes de error por endpoint | [Leer](08_CATALOGO_ERRORES_API.md) |

---

### 7. Manuales Técnicos

| Documento | Descripción | Enlace |
|---|---|---|
| `Manual Técnico` | Manual completo del sistema | [Leer](MANUALES/01_MANUAL_TECNICO.md) |

---

### 8. FAQ

| Documento | Descripción | Enlace |
|---|---|---|
| `FAQ Técnica` | **30+ preguntas** frecuentes técnicas | [Leer](FAQ/01_FAQ_TECNICA.md) |

---

### 9. Operaciones

| Documento | Descripción | Enlace |
|---|---|---|
| `Procedimientos de Backup` | Backup, restauración y DRP | [Leer](07_PROCEDIMIENTOS_BACKUP.md) |
| `Guía de Migración de Datos` | Migración desde Excel legacy | [Leer](09_GUIA_MIGRACION_DATOS.md) |
| `Plan de Capacitación` | Capacitación por perfil de usuario | [Leer](10_PLAN_CAPACITACION.md) |
| `Gestión de Alertas` | Diseño detallado del motor de alertas y reglas | [Leer](11_GESTION_ALERTAS.md) |

> [!NOTE]
> Los datos legacy para migración se encuentran en la carpeta [`datos_migracion/`](datos_migracion/) con **3 archivos Excel**.

---

### 10. Gestión

| Documento | Descripción | Enlace |
|---|---|---|
| `Propuesta Técnica` | Propuesta original v2.0 (documento fundacional) | [Leer](../02_DOCUMENTACION_GESTION/00_PROPUESTA_TECNICA.md) |
| `Especificación de Requisitos` | **24 RF**, 5 RNF, roadmap | [Leer](../02_DOCUMENTACION_GESTION/01_ESPECIFICACION_REQUISITOS.md) |
| `Estado Final del Proyecto` | Auditoría y deuda técnica | [Leer](../02_DOCUMENTACION_GESTION/02_ESTADO_FINAL_PROYECTO.md) |

---

### 11. Usuario

| Documento | Descripción | Enlace |
|---|---|---|
| `Historias de Usuario` | **24 HU** con criterios de aceptación | [Leer](../03_DOCUMENTACION_USUARIO/01_HISTORIAS_USUARIO.md) |
| `FAQ de Usuario` | Preguntas frecuentes para usuarios finales | [Leer](../03_DOCUMENTACION_USUARIO/FAQ/01_FAQ_USUARIO.md) |
| `Manual Usuario Técnico` | Manual paso a paso para técnicos | [Leer](../03_DOCUMENTACION_USUARIO/MANUALES/01_MANUAL_USUARIO_TECNICO.md) |
| `Manual Administrador` | Manual para administradores del sistema | [Leer](../03_DOCUMENTACION_USUARIO/MANUALES/02_MANUAL_ADMINISTRADOR.md) |

---

### 12. Calidad y Legal

| Documento | Descripción | Enlace |
|---|---|---|
| `Plan de Pruebas` | Unitarias, integración, E2E, rendimiento, seguridad | [Leer](../04_CALIDAD_Y_LEGAL/01_PLAN_DE_PRUEBAS.md) |
| `Informe de Seguridad` | OWASP Top 10, vulnerabilidades, recomendaciones | [Leer](../04_CALIDAD_Y_LEGAL/02_INFORME_SEGURIDAD.md) |
| `Aviso de Privacidad` | Ley 1581 de 2012 Colombia | [Leer](../04_CALIDAD_Y_LEGAL/03_AVISO_DE_PRIVACIDAD.md) |
| `Políticas de Calidad` | Objetivos, métricas, procesos | [Leer](../04_CALIDAD_Y_LEGAL/POLITICAS_DE_CALIDAD.md) |

---

## Resumen del Repositorio

<details>
<summary><b>Click para ver estadísticas del proyecto</b></summary>

<br>

| Métrica | Valor |
|---|---|
| **Total de documentos** | **29 archivos** |
| **Módulos del sistema** | 12 secciones |
| **Endpoints API** | 60+ REST |
| **Tablas BD** | 18 |
| **Historias de Usuario** | 24 |
| **Requisitos Funcionales** | 24 |
| **Preguntas FAQ** | 30+ |
| **Flujos de negocio** | 7 |

</details>

---

<p align="center">
  <b>SIGAI-SES</b> — <i>Sistema Integral de Gestión de Activos e Inventario</i><br>
   <b>Securitas Colombia S.A.</b> — Unidad de Seguridad Electrónica (SES)<br>
   v1.0.0 — Julio 2026
</p>



