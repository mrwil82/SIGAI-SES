---
title: "FAQ de Usuario — SIGAI-SES"
---

# FAQ de Usuario — SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Category](https://img.shields.io/badge/Category-Usuario-success?style=for-the-badge)
![Questions](https://img.shields.io/badge/Total-21%20Preguntas-ff69b4?style=for-the-badge)
![Project](https://img.shields.io/badge/Proyecto-SIGAI--SES-important?style=for-the-badge)

> [!TIP]
> Encuentre respuestas rapidas a las preguntas mas frecuentes sobre el sistema SIGAI-SES. Use los enlaces de navegacion para ir directamente a la seccion que necesita.

---

## Navegacion Rapida

| # | Seccion | Temas |
|---|---------|-------|
| 1 | [Acceso al Sistema](#acceso-al-sistema) | Ingreso, contrasena, sesion, movil |
| 2 | [Inventario](#inventario) | Busqueda, duplicados, importacion Excel |
| 3 | [Garantias](#garantias) | Reporte, seguimiento, estados |
| 4 | [Entregas y Desmontes](#entregas-y-desmontes) | Actas, tipos, triaje |
| 5 | [Alertas](#alertas) | Dashboard, gestion |
| 6 | [Reportes](#reportes) | Exportacion, volumen |
| 7 | [Soporte Tecnico](#soporte-tecnico) | Contacto, auditoria |

---

## Acceso al Sistema

> [!NOTE]
> Todos los usuarios deben tener un **correo corporativo** valido y credenciales asignadas por un administrador.

### Como ingreso al sistema?

<details>
<summary><b>Ver respuesta</b></summary>

Abra su navegador web (Chrome, Edge o Firefox), ingrese la **URL** que le proporciono su administrador, y use su **correo electronico corporativo** y **contrasena**.

| Paso | Accion |
|------|--------|
| 1 | Abra su navegador |
| 2 | Ingrese la URL del sistema |
| 3 | Digite su **correo** y **contrasena** |
| 4 | Haga clic en *"Iniciar Sesion"* |

</details>

---

### Que hago si olvide mi contrasena?

<details>
<summary><b>Ver respuesta</b></summary>

Contacte a su **administrador del sistema** para que restablezca su contrasena.

> [!WARNING]
> Actualmente **no hay opcion de autorecuperacion** disponible. Esta funcionalidad esta planificada para una version futura.

</details>

---

### Por que me aparece "Sesion Expirada"?

<details>
<summary><b>Ver respuesta</b></summary>

Su sesion tiene una duracion maxima de **8 horas** por seguridad. Simplemente **vuelva a iniciar sesion** para continuar trabajando.

> [!NOTE]
> Esta medida protege la informacion del sistema en caso de que olvide cerrar sesion en un equipo compartido.

</details>

---

### Puedo usar el sistema en mi celular?

<details>
<summary><b>Ver respuesta</b></summary>

**Si!** El sistema esta disenado con un enfoque **Mobile-First** y funciona correctamente en navegadores moviles.

| Dispositivo | Compatibilidad |
|-------------|:--------------:|
| Smartphone | Total |
| Tablet | Total |
| Escritorio | Total |

</details>

---

## Inventario

### Como busco un equipo en el inventario?

<details>
<summary><b>Ver respuesta</b></summary>

Use la **barra de busqueda global** en la parte superior, o vaya a **Inventario** y use los filtros disponibles:

- **Nombre** del equipo
- **Serial** exacto
- **Categoria**
- **Estado**

</details>

---

### Que hago si el serial de un equipo ya existe?

<details>
<summary><b>Ver respuesta</b></summary>

El sistema **no permite duplicar seriales**. Si el equipo ya esta registrado, use la opcion de **editar** para actualizar sus datos.

> [!TIP]
Si necesita corregir un serial mal ingresado, contacte al administrador para que realice el ajuste en la base de datos.

</details>

---

### Como importo varios equipos a la vez?

<details>
<summary><b>Ver respuesta</b></summary>

Use la opcion **"Importar Excel"** en el modulo de **Inventario**:

1. Descargue la **plantilla oficial**
2. Llenela con los datos de los equipos
3. Carguela en el sistema

> [!WARNING]
> Asegurese de usar **exactamente** la plantilla oficial proporcionada por el sistema para evitar errores de formato.

</details>

---

### Que columnas debe tener el archivo Excel?

<details>
<summary><b>Ver respuesta</b></summary>

| Columna | Descripcion | Obligatorio |
|---------|-------------|:-----------:|
| Serial | Numero de serie del equipo | Si |
| Referencia | Codigo de referencia del catalogo | Si |
| Marca | Fabricante del equipo | Si |
| Equipo | Nombre del equipo | Si |
| Ubicacion | Bodega o ubicacion fisica | Si |
| Estado | Estado del equipo | Si |

> [!TIP]
Use la **plantilla oficial** descargable desde el modulo de Inventario para garantizar el formato correcto.

</details>

---

## Garantias

### Como reporto una garantia?

<details>
<summary><b>Ver respuesta</b></summary>

1. Vaya a **Garantias** > **"Nuevo Caso"**
2. Seleccione el equipo por **serial**
3. Describa la **falla** en detalle
4. Seleccione el **proveedor**
5. Listo! El sistema generara un numero de caso **`GSES-XXX`**

</details>

---

### Cuanto tiempo tengo para hacer seguimiento?

<details>
<summary><b>Ver respuesta</b></summary>

Se recomienda hacer seguimiento **cada 15 dias**. Si un caso supera este tiempo sin avance, el sistema generara una **alerta automatica** de garantia estancada.

> [!WARNING]
Un caso estancado por mas de 15 dias genera una **alerta critica** que escala al administrador.

</details>

---

### Que significa cada estado de garantia?

<details>
<summary><b>Ver respuesta</b></summary>

| Estado | Significado |
|--------|-------------|
| **Registrado** | Caso creado, pendiente de envio |
| **Enviado a Proveedor** | Equipo remitido al proveedor |
| **Recibido del Proveedor** | Equipo retornado, pendiente de entrega |
| **Resuelto/Reemplazado** | Garantia finalizada |
| **Entregado al Cliente** | Equipo instalado y entregado |

**Flujo completo:** `Registrado -> Enviado -> Recibido -> Resuelto -> Entregado`

</details>

---

## Entregas y Desmontes

### Como creo un acta de entrega?

<details>
<summary><b>Ver respuesta</b></summary>

1. Vaya a **Entregas** > **"Nueva Acta"**
2. Seleccione el **tipo de acta**
3. Agregue los **equipos** a entregar
4. Seleccione el **tecnico** responsable
5. Capture la **firma digital**
6. El sistema generara un **PDF** del acta

</details>

---

### Que tipos de acta existen?

<details>
<summary><b>Ver respuesta</b></summary>

| Tipo | Descripcion |
|------|-------------|
| **Entrega de EPP** | Elementos de proteccion personal |
| **Entrega de Herramienta** | Equipos para tecnicos |
| **Despacho a Proyecto** | Equipos para instalacion en cliente |
| **Devolucion** | Equipos retornados a bodega |
| **Ingreso de Desmonte** | Equipos retirados de clientes |

</details>

---

### Como registro un equipo desmontado?

<details>
<summary><b>Ver respuesta</b></summary>

1. Vaya a **Desmontes**
2. Ingrese los **seriales** de los equipos retirados
3. Seleccione el **cliente/proyecto** de origen
4. Guarde el registro

> [!NOTE]
El equipo pasara automaticamente a estado **"En Laboratorio"** para su evaluacion tecnica.

</details>

---

### Que significa "Triaje"?

<details>
<summary><b>Ver respuesta</b></summary>

Es la **evaluacion tecnica** de un equipo desmontado para determinar su estado:

| Clasificacion | Significado |
|:-------------:|-------------|
| **BUENO** | Puede reutilizarse directamente |
| **RECUPERABLE** | Requiere reparacion |
| **DESECHO** | No apto para uso |

</details>

---

## Alertas

### Por que veo una alerta roja en el dashboard?

<details>
<summary><b>Ver respuesta</b></summary>

Indica que hay un **problema critico** que requiere atencion inmediata:

| Causa comun | Descripcion |
|-------------|-------------|
| **Stock agotado** | Item con cantidad en cero |
| **Garantia estancada** | Caso sin avance > 15 dias |
| **Movimiento no autorizado** | Cambio de ubicacion sin registro |

</details>

---

### Como elimino una alerta?

<details>
<summary><b>Ver respuesta</b></summary>

> [!WARNING]
No se recomienda **eliminar** alertas. En su lugar, use estas opciones:

| Accion | Descripcion |
|--------|-------------|
| **Reconocer** | Indica que esta al tanto del problema |
| **Resolver** | Marca que el problema fue solucionado |
| **Ignorar** | Descarta la alerta *(no recomendado)* |

</details>

---

## Reportes

### Como descargo un reporte?

<details>
<summary><b>Ver respuesta</b></summary>

1. Vaya a la **seccion** que desea exportar
2. Use el boton de **exportacion**
3. Seleccione el formato:

| Formato | Uso recomendado |
|:-------:|-----------------|
| **Excel** | Analisis de datos y edicion |
| **PDF** | Presentaciones y reportes formales |

</details>

---

### Puedo exportar mas de 30,000 registros?

<details>
<summary><b>Ver respuesta</b></summary>

**Si!** El sistema usa tecnologia de **streaming** que permite manejar grandes volumenes de datos sin problemas de rendimiento.

> [!NOTE]
Para exportaciones masivas, se recomienda usar formato **Excel** para mejor manejo de los datos.

</details>

---

## Soporte Tecnico

### A quien contacto si tengo problemas?

<details>
<summary><b>Ver respuesta</b></summary>

Comuniquese con:

| Contacto | Via |
|----------|-----|
| **Administrador del sistema** | Interno |
| **Equipo de soporte tecnico** | Securitas Colombia |

> [!TIP]
Para problemas tecnicos recurrentes, consulte el **Manual de Usuario Tecnico** o la seccion de **Solucion de Problemas**.

</details>

---

### El sistema guarda lo que hago?

<details>
<summary><b>Ver respuesta</b></summary>

**Si.** Todas las acciones importantes (`CREAR`, `EDITAR`, `ELIMINAR`) quedan registradas en la **bitacora de auditoria** con:

| Dato registrado | Descripcion |
|----------------|-------------|
| **Fecha** | Marca de tiempo exacta |
| **Usuario** | Quien realizo la accion |
| **Tabla** | Que registro fue afectado |
| **Valores** | Anterior y nuevo (formato JSON) |

</details>

---

> [!TIP]
> **No encontro lo que busca?** Contacte a su administrador del sistema o consulte el Manual de Usuario Tecnico para informacion mas detallada.

---

| Metrica | Valor |
|---|---|
| Total de preguntas | **21** |
| Secciones cubiertas | **7** |
| Acceso al Sistema | 4 preguntas |
| Inventario | 4 preguntas |
| Garantias | 3 preguntas |
| Entregas y Desmontes | 4 preguntas |
| Alertas | 2 preguntas |
| Reportes | 2 preguntas |
| Soporte Tecnico | 2 preguntas |

---

*Documento actualizado: Julio 2026 — SIGAI-SES v1.0.0*
