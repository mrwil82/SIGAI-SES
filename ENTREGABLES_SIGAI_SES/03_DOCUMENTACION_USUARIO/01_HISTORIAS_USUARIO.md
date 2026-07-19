---
title: "Historias de Usuario — SIGAI-SES"
---

# Historias de Usuario — SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Approved-success?style=for-the-badge)
![Total](https://img.shields.io/badge/Total-24%20Historias-ff69b4?style=for-the-badge)
![Project](https://img.shields.io/badge/Proyecto-SIGAI--SES-important?style=for-the-badge)
![Date](https://img.shields.io/badge/Julio-2026-lightgrey?style=for-the-badge)

> [!NOTE]
> Este documento contiene **24 historias de usuario** organizadas por modulo funcional del sistema SIGAI-SES. Cada historia sigue el formato estandar **"Como... quiero... para..."** e incluye sus criterios de aceptacion correspondientes.

---

## Modulo de Seguridad y Acceso

### HU-01 — Inicio de Sesion

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Iniciar sesion con mi correo y contrasena |
| **Beneficio** | Acceder al sistema de forma segura |

**Criterios de Aceptacion:**
- El sistema debe validar credenciales contra la base de datos
- Debe generar un token **JWT** valido por **8 horas**
- Debe redirigir al **dashboard** tras autenticarse

---

### HU-02 — Creacion de Usuarios

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Crear usuarios con diferentes roles |
| **Beneficio** | Controlar los permisos de cada persona |

**Criterios de Aceptacion:**
- Debe permitir seleccionar rol (`ADMIN`, `TECNICO`, `TECNICO_LABORATORIO`)
- Debe asignar una **contrasena temporal**
- Debe enviar un correo con las credenciales *(integracion futura)*

---

### HU-03 — Historial de Cambios

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Ver el historial de cambios del sistema |
| **Beneficio** | Auditar las acciones de los usuarios |

**Criterios de Aceptacion:**
- Debe mostrar **fecha**, **usuario**, **tabla afectada**, y valores **anterior/nuevo**
- Debe permitir filtrar por **usuario** y **rango de fechas**
- Debe tener **paginacion** para grandes volumenes

---

## Modulo de Inventario

### HU-04 — Registro de Entrada

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Registrar la entrada de equipos nuevos |
| **Beneficio** | Que esten disponibles en el stock |

**Criterios de Aceptacion:**
- El sistema debe pedir **Serial** y **Referencia**
- Debe actualizar el **stock total** automaticamente
- Debe validar que el **serial no exista** previamente

---

### HU-05 — Importacion desde Excel

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Importar equipos desde un archivo Excel |
| **Beneficio** | Agilizar la carga masiva de inventario |

**Criterios de Aceptacion:**
- Debe aceptar archivos **.xlsx** con formato definido
- Debe detectar **duplicados** por serial y actualizarlos (*upsert*)
- Debe mostrar **resumen** de registros creados, actualizados y errores

---

### HU-06 — Inventario Asignado

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Ver mi inventario asignado |
| **Beneficio** | Saber que herramientas y equipos tengo bajo mi responsabilidad |

**Criterios de Aceptacion:**
- Debe mostrar una lista con **seriales** y **fechas de entrega**
- Debe estar disponible en el **movil**
- Debe permitir filtrar por **estado** y **ubicacion**

---

### HU-07 — Historial de Ubicaciones

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Consultar el historial de ubicaciones de un activo |
| **Beneficio** | Conocer su trayectoria |

**Criterios de Aceptacion:**
- Debe mostrar cambios de ubicacion con **fechas**
- Debe indicar **quien** realizo cada cambio
- Debe mostrar la **ubicacion actual** primero

---

### HU-08 — Stock General

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Ver el stock actual de todos los items |
| **Beneficio** | Tomar decisiones de reabastecimiento |

**Criterios de Aceptacion:**
- Debe mostrar items con **cantidad actual** y **stock minimo**
- Debe **resaltar en rojo** los items por debajo del minimo
- Debe permitir **exportar** el listado a Excel

---

### HU-09 — Gestion del Catalogo

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Gestionar el catalogo de items (CRUD) |
| **Beneficio** | Mantener actualizados los equipos |

**Criterios de Aceptacion:**
- Debe permitir **crear**, **editar** y **desactivar** items
- Debe validar que la **referencia no se duplique**
- Debe aplicar **soft delete** para no perder historial

---

## Modulo de Garantias

### HU-10 — Reporte Rapido de Garantia

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Reportar una garantia de forma rapida |
| **Beneficio** | Que el proceso con el proveedor inicie de inmediato |

**Criterios de Aceptacion:**
- Debe permitir asociar el equipo por **serial**
- Debe generar un numero de caso **`GSES-XXX`** unico
- Debe permitir agregar **descripcion** de la falla

---

### HU-11 — Seguimiento de Casos

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Hacer seguimiento a los casos de garantia |
| **Beneficio** | Asegurar que se resuelvan a tiempo |

**Criterios de Aceptacion:**
- Debe mostrar el estado actual del flujo: `Registrado -> Enviado -> Recibido -> Resuelto -> Entregado`
- Debe **alertar** si un caso supera los **15 dias** sin avance
- Debe permitir actualizar el estado y agregar **comentarios**

---

### HU-12 — Alertas de Garantias

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Recibir alertas de garantias estancadas |
| **Beneficio** | Tomar acciones correctivas |

**Criterios de Aceptacion:**
- La alerta debe activarse automaticamente a los **15 dias**
- Debe aparecer en el **centro de alertas** y en el **dashboard**
- Debe mostrar el **tiempo transcurrido** y el **responsable**

---

## Modulo de Entregas y Desmontes

### HU-13 — Aprobacion de Actas

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Aprobar un acta de entrega digital |
| **Beneficio** | Formalizar la salida de equipos a un proyecto |

**Criterios de Aceptacion:**
- El acta debe incluir **firma** del tecnico y del representante
- Debe generar un **PDF inviolable**
- Debe quedar registrada en el **kardex de movimientos**

---

### HU-14 — Registro de Desmonte

| | |
|---|---|
| **Rol** | Tecnico de Laboratorio |
| **Solicitud** | Registrar un equipo de desmonte |
| **Beneficio** | Evaluar si se puede reutilizar |

**Criterios de Aceptacion:**
- Debe permitir marcar estado (`Funcional`, `Dañado`, `Chatarra`)
- Debe quedar vinculado al **cliente de origen**
- Debe generar un movimiento de **ingreso a laboratorio**

---

### HU-15 — Triage de Equipos

| | |
|---|---|
| **Rol** | Tecnico de Laboratorio |
| **Solicitud** | Realizar el triaje de equipos desmontados |
| **Beneficio** | Clasificarlos tecnicamente |

**Criterios de Aceptacion:**
- Debe permitir calificar como `BUENO`, `RECUPERABLE` o `DESECHO`
- Debe permitir agregar **observaciones tecnicas**
- Debe actualizar el **estado del activo** automaticamente

---

### HU-16 — Actas de EPP

| | |
|---|---|
| **Rol** | Tecnico |
| **Solicitud** | Generar actas de entrega de EPP |
| **Beneficio** | Llevar control de los elementos asignados a cada tecnico |

**Criterios de Aceptacion:**
- Debe permitir seleccionar el **tecnico** y los **EPP** a entregar
- Debe registrar **talla** y **fecha de vencimiento**
- Debe generar **PDF** para firma

---

## Modulo de Alertas

### HU-17 — Alerta de Stock Bajo

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Recibir una alerta de stock bajo |
| **Beneficio** | Iniciar el proceso de recompra a tiempo |

**Criterios de Aceptacion:**
- Se debe configurar un **umbral** por item
- La alerta debe aparecer en el **dashboard principal**
- Debe poder **reconocerse** y marcarse como **resuelta**

---

### HU-18 — Resumen de Alertas

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Ver un resumen de todas las alertas activas |
| **Beneficio** | Priorizar mi trabajo |

**Criterios de Aceptacion:**
- Debe mostrar **conteo** por tipo y prioridad
- Debe permitir filtrar por estado (`activa`, `reconocida`, `resuelta`)
- Debe mostrar las **mas criticas** primero

---

## Modulo de Reportes

### HU-19 — Exportacion a Excel

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Exportar el inventario a Excel |
| **Beneficio** | Enviarlo a la gerencia |

**Criterios de Aceptacion:**
- Debe soportar **+30,000 registros** sin degradacion
- Debe mantener el **formato de columnas** consistente
- Debe permitir seleccionar el **modulo** a exportar

---

### HU-20 — Reporte PDF de Garantias

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Generar un reporte PDF de garantias activas |
| **Beneficio** | Presentar en reunion |

**Criterios de Aceptacion:**
- Debe incluir **numero de caso**, **estado**, **proveedor** y **tiempo transcurrido**
- Debe estar formateado **profesionalmente**
- Debe poder **descargarse** directamente

---

## Modulo de Clientes y Proyectos

### HU-21 — Gestion de Clientes

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Gestionar los clientes de Securitas |
| **Beneficio** | Asociarlos a proyectos y activos |

**Criterios de Aceptacion:**
- Debe permitir **crear**, **editar** y **desactivar** clientes
- Debe validar **NIT unico**
- Debe mostrar **proyectos asociados** a cada cliente

---

### HU-22 — Gestion de Proyectos

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Crear proyectos asociados a un cliente |
| **Beneficio** | Organizar las entregas de equipos |

**Criterios de Aceptacion:**
- Debe permitir definir **fechas de inicio** y **fin estimado**
- Debe tener estado (`Activo`, `Finalizado`, `Pausado`)
- Debe mostrar los **activos asignados** al proyecto

---

## Modulo de Administracion

### HU-23 — Gestion de Regionales

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Gestionar las regionales |
| **Beneficio** | Aislar los datos por ciudad |

**Criterios de Aceptacion:**
- Un usuario solo ve **datos de su regional**
- Debe permitir **crear** y **editar** regionales
- Los administradores pueden ver **todas las regionales**

---

### HU-24 — Busquedas Globales

| | |
|---|---|
| **Rol** | Administrador |
| **Solicitud** | Realizar busquedas globales en el sistema |
| **Beneficio** | Encontrar informacion rapidamente |

**Criterios de Aceptacion:**
- Debe buscar en **items, activos, clientes y proyectos**
- Debe responder con minimo **2 caracteres**
- Debe mostrar resultados **agrupados por categoria**

---

> [!TIP]
> **Resumen rapido:** 24 historias distribuidas en 8 modulos del sistema. Cada historia describe una necesidad de negocio validada con criterios de aceptacion medibles.

| Metrica | Valor |
|---|---|
| Total de Historias | **24** |
| Modulo Seguridad | **3** (HU-01 a HU-03) |
| Modulo Inventario | **6** (HU-04 a HU-09) |
| Modulo Garantias | **3** (HU-10 a HU-12) |
| Modulo Entregas/Desmontes | **4** (HU-13 a HU-16) |
| Modulo Alertas | **2** (HU-17 a HU-18) |
| Modulo Reportes | **2** (HU-19 a HU-20) |
| Modulo Clientes/Proyectos | **2** (HU-21 a HU-22) |
| Modulo Administracion | **2** (HU-23 a HU-24) |

---

*Documento actualizado: Julio 2026 — SIGAI-SES v1.0.0*
