---
title: "Diagramas de Procesos y Ciclo de Vida — SIGAI-SES"
---

# Diagramas de Procesos y Ciclo de Vida — SIGAI-SES

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge&logo=github)
![Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge&logo=checkmarx)
![Flows](https://img.shields.io/badge/Flows-7%20diagramados-ff69b4?style=for-the-badge&logo=diagramsdotnet)
![Last Update](https://img.shields.io/badge/Last%20Update-Julio%202026-orange?style=for-the-badge&logo=calendar)

</div>

---

> [!TIP]
> Navegación rápida: [1. Garantías](#1-ciclo-de-vida-de-una-garantia) · [2. Perfiles](#2-diagrama-de-funciones-por-perfil-de-usuario) · [3. Alertas Stock](#3-proceso-automatico-de-alerta-por-existencias-criticas) · [4. Actas](#4-flujo-de-creacion-de-acta-de-entrega) · [5. Excel](#5-flujo-de-importacion-excel) · [6. Auth](#6-flujo-de-autenticacion) · [7. Registro](#7-flujo-de-registro-de-usuario-admin)

---

## 1. Ciclo de Vida de una Garantía {#1-ciclo-de-vida-de-una-garantia}

<div align="center">

![Ciclo de Vida de Garantia](images/flow_1.png)

</div>

### Estados del Ciclo

| Estado | Descripcion | Accion Requerida |
|:---:|---|---|
| **REGISTRADO** | Caso registrado, esperando recepción | Técnico entrega equipo en laboratorio |
| **ENVIADO_PROVEEDOR** | Equipo enviado a reparación | Registrar RMA, fecha envío, factura |
| **RECIBIDO_PROVEEDOR** | Proveedor devolvió equipo reparado | Verificar reparación, actualizar estado |
| **RESUELTO_REEMPLAZADO** | Caso resuelto (reparado o reemplazado) | Registrar resolución |
| **ENTREGADO_CLIENTE** | Equipo instalado y entregado | Generar acta de entrega, cerrar caso |
| **ALERTA_ESTANCADA** | Sin movimiento > 15 días | Acción correctiva requerida |

**Pasos del proceso:**

| # | Paso | Detalle |
|:---:|---|---|
| 1 | Reporte de falla | Técnico reporta equipo dañado en campo |
| 2 | Generación de caso | Sistema crea número único `GSES-XXX` |
| 3 | Envío a proveedor | Se envía con RMA si aplica |
| 4 | Devolución | Proveedor repara/reemplaza y devuelve |
| 5 | Resolución | Caso marcado como `RESUELTO_REEMPLAZADO` |
| 6 | Entrega y cierre | Equipo entregado al cliente, caso cerrado |
| 7 | Alerta de estancamiento | Si > 15 días sin movimiento → `ALERTA_ESTANCADA` |

> [!WARNING]
> Si un caso permanece en `ENVIADO_PROVEEDOR` por más de **15 días**, el sistema automáticamente genera una alerta de `garantia_vencida` (prioridad **alta**).

---

## 2. Diagrama de Funciones por Perfil de Usuario {#2-diagrama-de-funciones-por-perfil-de-usuario}

<div align="center">

![Funciones por Perfil](images/flow_2.png)

</div>

### Roles del Sistema

| Rol | Funciones Asignadas |
|:---|---|
| **ADMIN** | Gestión usuarios · Carga masiva · Auditoría · Configuración global · Todos los módulos |
| **TECNICO** | Control existencias · Alertas · Informes · Garantías · Entregas · Consulta inventario |
| **TECNICO_LABORATORIO** | Garantías · Inventario · Informes · Triage desmontes · Evaluación técnica |

### Matriz de Permisos Detallada

| Funcion | ADMIN | TECNICO | TECNICO_LAB |
|:---|---:|:---:|:---:|
| Dashboard | **SI** | **SI** | **SI** |
| Ver inventario | **SI** | **SI** | **SI** |
| Crear/Editar items | **SI** | **SI** | **SI** |
| Importar Excel | **SI** | **SI** | **SI** |
| Gestionar garantías | **SI** | **SI** | **SI** |
| Crear alertas | **SI** | **SI** | **NO** |
| Gestionar alertas | **SI** | **SI** | **SI** |
| Crear actas entrega | **SI** | **NO** | **NO** |
| Gestionar usuarios | **SI** | **NO** | **NO** |
| Ver auditoría | **SI** | **NO** | **NO** |
| Realizar triaje | **SI** | **NO** | **SI** |
| Registrar desmontes | **SI** | **NO** | **SI** |
| Gestionar clientes | **SI** | **SI** | **NO** |
| Gestionar proyectos | **SI** | **SI** | **NO** |
| Exportar reportes | **SI** | **SI** | **SI** |

> [!NOTE]
> La creación de **actas de entrega** y **gestión de usuarios** son funciones exclusivas del rol `ADMIN`.

---

## 3. Proceso Automático de Alerta por Existencias Críticas {#3-proceso-automatico-de-alerta-por-existencias-criticas}

<div align="center">

![Proceso de Alerta por Stock](images/flow_3.png)

</div>

### Flujo Detallado


![Diagrama](images/02_DIAGRAMAS_FLUJO_Y_PROCESOS_diagram_1.png)


**Secuencia de eventos:**

| # | Evento | Actor | Descripción |
|:---:|---|---|---|
| 1 | Salida de inventario | Técnico | Registra movimiento de salida |
| 2 | Descuento de stock | Sistema | Actualiza kardex y stock actual |
| 3 | Evaluación de regla | Motor | ¿Stock ≤ stock_minimo? |
| 4 | Creación de alerta | Sistema | Alerta con prioridad **CRÍTICA** |
| 5 | Reconocimiento | Admin | Marca como "En Revisión" |
| 6 | Resolución | Admin | Ingresa nuevo stock |
| 7 | Escalamiento | Sistema | Si > 2h sin reconocer → Supervisor |

> [!TIP]
> El motor de reglas (`evaluar_alertas`) genera la alerta crítica de stock bajo y el centro de alertas permite **reconocer, resolver e ignorar**. El **escalamiento automático por SLA** (críticas sin reconocer > 2 horas hacia el supervisor) está **pendiente para una versión futura**.

---

## 4. Flujo de Creación de Acta de Entrega {#4-flujo-de-creacion-de-acta-de-entrega}

<div align="center">

![Flujo de Acta de Entrega](images/flow_4.png)

*Diagrama de flujo de creación de actas de entrega*

</div>


![Diagrama](images/02_DIAGRAMAS_FLUJO_Y_PROCESOS_diagram_2.png)


> [!IMPORTANT]
> La generación de actas crea un **PDF** con los datos del acta, sus items y los datos del técnico y representante.

---

## 5. Flujo de Importación Excel {#5-flujo-de-importacion-excel}

<div align="center">

![Flujo de Importacion Excel](images/flow_5.png)

*Diagrama de flujo del proceso de importación de datos desde Excel*

</div>


![Diagrama](images/02_DIAGRAMAS_FLUJO_Y_PROCESOS_diagram_3.png)


> [!NOTE]
> El proceso es **transaccional**: si falla alguna fila, **todo** se revierte (rollback). No hay importaciones parciales.

---

## 6. Flujo de Autenticación {#6-flujo-de-autenticacion}

<div align="center">

![Flujo de Autenticacion](images/flow_6.png)

*Diagrama de secuencia del flujo de autenticación JWT*

</div>


![Diagrama](images/02_DIAGRAMAS_FLUJO_Y_PROCESOS_diagram_4.png)


> [!TIP]
> El flujo de **refresco automático** está implementado en el **interceptor Axios**. No requiere acción del usuario.

---

## 7. Flujo de Registro de Usuario (Admin) {#7-flujo-de-registro-de-usuario-admin}

<div align="center">

![Flujo de Registro de Usuario](images/flow_7.png)

*Diagrama de flujo del proceso de registro de usuario por parte del administrador*

</div>


![Diagrama](images/02_DIAGRAMAS_FLUJO_Y_PROCESOS_diagram_5.png)


> [!WARNING]
> El envío de credenciales por **email** está **pendiente para v1.1.0**. Actualmente, el ADMIN debe entregar las credenciales manualmente al nuevo usuario.

---

<div align="center">

![Separator](https://img.shields.io/badge/---Documento%20actualizado%20al%20Julio%202026%20--%20v1.0.0-lightgrey?style=for-the-badge)

</div>

> [!IMPORTANT]
> ¿Sugerencias o mejoras para estos diagramas? Abre un issue en el repositorio con la etiqueta `documentacion`.
