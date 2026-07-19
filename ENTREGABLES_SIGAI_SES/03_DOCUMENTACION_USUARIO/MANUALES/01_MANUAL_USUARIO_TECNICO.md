---
title: "Manual del Usuario Tecnico — SIGAI-SES"
---

# Manual del Usuario Tecnico — SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Role](https://img.shields.io/badge/Rol-T%C3%A9cnico-success?style=for-the-badge)
![Project](https://img.shields.io/badge/Proyecto-SIGAI--SES-important?style=for-the-badge)
![Sections](https://img.shields.io/badge/Secciones-11-ff69b4?style=for-the-badge)
![Date](https://img.shields.io/badge/Julio-2026-lightgrey?style=for-the-badge)

> [!NOTE]
> Este manual esta dirigido al **personal tecnico y usuarios operativos** del Sistema Integral de Gestion de Activos e Inventario (SIGAI-SES) de Securitas Colombia.

---

<details>
<summary><b>Indice de Contenidos</b></summary>

| # | Seccion | Descripcion |
|---|---------|-------------|
| 1 | [Introduccion](#1-introduccion) | Descripcion general del sistema |
| 2 | [Acceso al Sistema](#2-acceso-al-sistema) | Inicio y cierre de sesion |
| 3 | [Interfaz General](#3-interfaz-general) | Barra lateral y barra superior |
| 4 | [Modulo de Inventario](#4-modulo-de-inventario) | Consulta, detalle, registro, importacion |
| 5 | [Modulo de Garantias](#5-modulo-de-garantias) | Reporte, seguimiento, estados |
| 6 | [Modulo de Entregas](#6-modulo-de-entregas) | Creacion de actas |
| 7 | [Modulo de Desmontes](#7-modulo-de-desmontes) | Registro y triaje |
| 8 | [Centro de Alertas](#8-centro-de-alertas) | Visualizacion y gestion |
| 9 | [Clientes y Proyectos](#9-consulta-de-clientes-y-proyectos) | Consulta de datos |
| 10 | [Solucion de Problemas](#10-solucion-de-problemas-comunes) | Troubleshooting |
| 11 | [Buenas Practicas](#11-buenas-practicas) | Recomendaciones |

</details>

---

## 1. Introduccion

**SIGAI-SES** es el Sistema Integral de Gestion de Activos e Inventario de **Securitas Colombia**, disenado para:

| Funcion | Descripcion |
|---------|-------------|
| **Inventario** | Gestion de equipos, stock y catalogo |
| **Garantias** | Seguimiento de casos RMA |
| **Entregas** | Actas digitales con firma |
| **Desmontes** | Evaluacion y triaje de equipos |
| **Alertas** | Notificaciones automaticas |
| **Reportes** | Exportacion a Excel y PDF |

---

## 2. Acceso al Sistema

### 2.1 Inicio de Sesion

1. Abra su navegador web (**Chrome**, **Edge**, **Firefox**)
2. Ingrese la **URL del sistema** proporcionada por su administrador
3. En la pantalla de login, ingrese su **correo electronico** y **contrasena**
4. Haga clic en **"Iniciar Sesion"**

> [!TIP]
> Si es su **primer ingreso**, use la **contrasena temporal** enviada a su correo. El sistema le pedira cambiarla.

### 2.2 Cierre de Sesion

Haga clic en su **nombre** (esquina superior derecha) y seleccione **"Cerrar Sesion"**.

> [!WARNING]
> Siempre cierre sesion en **equipos compartidos** para proteger su cuenta.

---

## 3. Interfaz General

### 3.1 Barra Lateral (Menu Principal)

| Icono | Seccion | Descripcion |
|:-----:|---------|-------------|
| G | **Dashboard** | Panel principal con indicadores y KPIs |
| I | **Inventario** | Gestion de equipos y stock |
| G | **Garantias** | Seguimiento de casos RMA |
| E | **Entregas** | Actas de entrega de equipos |
| D | **Desmontes** | Registro de equipos retirados |
| A | **Alertas** | Notificaciones del sistema |
| C | **Clientes** | Informacion de clientes |
| P | **Proyectos** | Proyectos activos |
| U | **Usuarios** | Gestion de usuarios *(solo Admin)* |
| L | **Auditoria** | Historial de cambios *(solo Admin)* |

### 3.2 Barra Superior

| Elemento | Descripcion |
|----------|-------------|
| **Busqueda Global** | Busque equipos por **serial**, **referencia** o **nombre** |
| **Notificaciones** | Icono de campana con **alertas activas** |
| **Perfil** | Su **nombre**, **rol** y opcion de **cerrar sesion** |

---

## 4. Modulo de Inventario

### 4.1 Consultar Inventario

1. Haga clic en **"Inventario"** en el menu lateral
2. Use los **filtros disponibles**:

| Filtro | Descripcion |
|--------|-------------|
| **Buscar** | Por nombre, referencia o serial |
| **Categoria** | Filtre por tipo de equipo |
| **Estado** | Disponibles, instalados, en garantia, etc. |

3. Los resultados se muestran en una **tabla paginada**

### 4.2 Ver Detalle de un Activo

1. En la tabla de inventario, haga clic en el **serial** del equipo
2. Podra ver:

> [!TIP]
> El detalle del activo incluye informacion completa de trazabilidad.

| Campo | Descripcion |
|-------|-------------|
| **Informacion general** | Marca, modelo, referencia |
| **Ubicacion fisica** | Bodega y estante actual |
| **Historial de movimientos** | Todos los cambios registrados |
| **Estado de garantia** | Vigente, vencida, en proceso |
| **Asignaciones EPP** | Si aplica |

### 4.3 Registrar Nuevo Equipo

1. Vaya a **Inventario** > **"Nuevo Activo"**
2. Complete los campos obligatorios:

| Campo | Descripcion |
|-------|-------------|
| **Item** | Seleccione del catalogo el tipo de equipo |
| **Serial** | Numero de serie del equipo **(unico)** |
| **Estado** | Seleccione *"Disponible"* para nuevo ingreso |
| **Ubicacion** | Bodega y estante donde se almacena |

3. **Campos opcionales:** placa de activo fijo, factura de compra, proveedor
4. Haga clic en **"Guardar"**

### 4.4 Importar desde Excel

Para **cargas masivas**:

1. Vaya a **Inventario** > **"Importar Excel"**
2. Seleccione el archivo Excel con la **plantilla oficial**
3. El sistema validara y procesara los datos automaticamente
4. Recibira un **resumen** con:

| Indicador | Descripcion |
|-----------|-------------|
| **Registros nuevos** | Creados exitosamente |
| **Registros actualizados** | Existian y fueron modificados |
| **Errores** | Problemas de formato o datos invalidos |

> [!WARNING]
> **Formato requerido:** `Serial | Referencia | Marca | Equipo | Ubicacion` — Use la plantilla oficial para evitar errores.

---

## 5. Modulo de Garantias

### 5.1 Reportar una Garantia

1. Vaya a **Garantias** > **"Nuevo Caso"**
2. Seleccione el equipo (por **serial**) que presenta la falla
3. Complete la informacion:

| Campo | Descripcion |
|-------|-------------|
| **Falla reportada** | Descripcion detallada del problema |
| **Fotos** | Adjunte imagenes de la falla *(opcional)* |
| **Proveedor** | Seleccione el proveedor del equipo |

4. Haga clic en **"Crear Caso"**
5. El sistema generara un numero de caso unico: **`GSES-XXX`**

### 5.2 Seguimiento de Garantias

En la tabla de garantias puede ver el flujo de estados:

| Estado | Significado |
|:-----:|-------------|
| **Registrado** | Caso creado, pendiente de envio |
| **Enviado a Proveedor** | Equipo remitido al proveedor |
| **Recibido del Proveedor** | Equipo retornado, pendiente de entrega |
| **Resuelto/Reemplazado** | Garantia finalizada |
| **Entregado al Cliente** | Equipo instalado y entregado |

### 5.3 Actualizar Estado de Garantia

1. Busque el caso por numero **`GSES-XXX`**
2. Haga clic en **"Editar"**
3. Actualice el **estado** y agregue **comentarios**
4. Guarde los cambios

> [!WARNING]
> Si un caso permanece mas de **15 dias** en *"Enviado a Proveedor"*, el sistema generara una **alerta de estancamiento**.

---

## 6. Modulo de Entregas

### 6.1 Crear Acta de Entrega

1. Vaya a **Entregas** > **"Nueva Acta"**
2. Seleccione el **tipo de acta**:

| Tipo | Descripcion |
|:----:|-------------|
| **Entrega de EPP** | Elementos de proteccion personal |
| **Entrega de Herramienta** | Equipos para tecnicos |
| **Despacho a Proyecto** | Equipos para instalacion en cliente |
| **Devolucion** | Equipos retornados a bodega |

3. Agregue los **items** (equipos) incluidos en la entrega
4. Seleccione el **tecnico responsable** y el **proyecto** (si aplica)
5. Capture la **firma digital** del receptor
6. Haga clic en **"Generar Acta"**
7. El sistema creara un **PDF** del acta para descargar e imprimir

> [!TIP]
> El PDF generado es **inviolable** e incluye todas las firmas digitales como evidencia.

---

## 7. Modulo de Desmontes

### 7.1 Registrar Equipo Desmontado

1. Vaya a **Desmontes** > **"Nuevo Desmonte"**
2. Ingrese los **seriales** de los equipos retirados del cliente
3. Seleccione el **cliente** y **proyecto** de origen
4. Haga clic en **"Registrar Desmonte"**

### 7.2 Evaluacion Tecnica (Triaje)

Para equipos en **laboratorio**:

1. Vaya a **Desmontes** y vea la lista de equipos pendientes de evaluacion
2. Para cada equipo, seleccione la **calificacion tecnica**:

| Clasificacion | Icono | Descripcion |
|:-------------:|:-----:|-------------|
| **Bueno** | G | Puede reutilizarse directamente |
| **Recuperable** | Y | Requiere reparacion |
| **Desecho** | R | No apto para uso |

3. Agregue **observaciones** sobre la condicion fisica
4. Guarde la evaluacion

> [!NOTE]
> El **triaje** actualiza automaticamente el estado del activo en el inventario.

---

## 8. Centro de Alertas

### 8.1 Visualizar Alertas

En **Alertas** puede ver las siguientes notificaciones:

| Tipo | Prioridad | Descripcion |
|:----:|:---------:|-------------|
| **Stock Bajo** | Critica | Items por debajo del minimo configurado |
| **Garantia Estancada** | Alta | Casos sin avance por mas de 15 dias |
| **Movimiento No Autorizado** | Media | Cambios de ubicacion sin registro |

### 8.2 Gestionar Alertas

| Accion | Icono | Descripcion |
|--------|:-----:|-------------|
| **Reconocer** | O | Indica que esta al tanto de la alerta |
| **Resolver** | X | Marca la alerta como solucionada |
| **Ignorar** | - | Descarta la alerta *(no recomendado)* |

> [!WARNING]
> No se recomienda **ignorar** alertas sin antes haber solucionado la causa raiz.

---

## 9. Consulta de Clientes y Proyectos

### 9.1 Clientes

| Dato | Descripcion |
|------|-------------|
| **Nombre** | Razon social del cliente |
| **NIT** | Numero de identificacion tributaria |
| **Proyectos** | Proyectos asociados al cliente |

### 9.2 Proyectos

| Dato | Descripcion |
|------|-------------|
| **Nombre** | Nombre del proyecto |
| **Estado** | Activo, Finalizado, Pausado |
| **Cliente** | Cliente asociado |
| **Ubicacion** | Ciudad o region |

---

## 10. Solucion de Problemas Comunes

<details>
<summary><b>No puedo iniciar sesion</b></summary>

| Causa posible | Solucion |
|---------------|----------|
| Correo mal escrito | Verifique que su correo este escrito correctamente |
| Contrasena incorrecta | Use la opcion *"Olvido su contrasena?"* para restablecerla |
| Cuenta bloqueada | Contacte a su administrador si el problema persiste |

</details>

<details>
<summary><b>No encuentro un equipo en el inventario</b></summary>

| Causa posible | Solucion |
|---------------|----------|
| Busqueda incorrecta | Use la **busqueda por serial exacto** |
| Filtros activos | Verifique los filtros de **categoria** y **estado** |
| No registrado | Confirme que el equipo fue **registrado previamente** |

</details>

<details>
<summary><b>Error al cargar un archivo Excel</b></summary>

| Causa posible | Solucion |
|---------------|----------|
| Plantilla incorrecta | Asegurese de usar la **plantilla oficial** |
| Columnas incorrectas | Verifique que los nombres de columna sean **exactos** |
| Archivo muy grande | El archivo **no debe exceder 50 MB** |

</details>

<details>
<summary><b>El PDF de acta no se descarga</b></summary>

| Causa posible | Solucion |
|---------------|----------|
| Sin conexion | Verifique su **conexion a internet** |
| Navegador incompatible | Pruebe con **otro navegador** |
| Error del servidor | Contacte a **soporte tecnico** si persiste |

</details>

---

## 11. Buenas Practicas

| # | Recomendacion |
|:-:|---------------|
| 1 | **Siempre** verifique el **serial** antes de registrar un equipo |
| 2 | **Mantenga** su sesion cerrada en **equipos compartidos** |
| 3 | **Reporte** fallas tecnicas al **administrador** del sistema |
| 4 | **Use** la **busqueda global** para localizar equipos rapidamente |
| 5 | **No comparta** su **contrasena** con otros usuarios |
| 6 | **Realice** el **triaje** de equipos desmontados a la brevedad |
| 7 | **Adjunte fotos** al reportar garantias para mejor seguimiento |

> [!TIP]
> Seguir estas buenas practicas garantiza la **integridad de los datos** y la **eficiencia operativa** del sistema.

---

| Resumen del Manual |
|:---------------------:|
| **Secciones:** 11 |
| **Modulos cubiertos:** 7 |
| **Problemas comunes resueltos:** 4 |
| **Buenas practicas:** 7 |

---

*Documento actualizado: Julio 2026 — SIGAI-SES v1.0.0*

> [!NOTE]
> Para soporte adicional, consulte el **FAQ de Usuario** o contacte a su administrador del sistema.
