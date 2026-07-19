---
title: "Plan de Capacitacion -- SIGAI-SES"
---


# Plan de Capacitacion -- SIGAI-SES

![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Activo-brightgreen?style=for-the-badge)
![Duration](https://img.shields.io/badge/Duracion-3%20semanas-orange?style=for-the-badge)
![Profiles](https://img.shields.io/badge/Perfiles-3-6DB33F?style=for-the-badge)
![Modules](https://img.shields.io/badge/Modulos-7-ff69b4?style=for-the-badge)

---

## Objetivo

> [!TIP]
> Este plan describe la estrategia de capacitacion para los **usuarios finales** del sistema SIGAI-SES, asegurando que cada perfil de usuario adquiera las **competencias necesarias** para operar el sistema de manera efectiva.

---

## Perfiles de Capacitacion

| Perfil | Usuarios | Duracion Total | Modalidad |
|------------|-------------|-------------------|--------------|
| **ADMIN** | Personal TI, Supervisores | **4 horas** | Presencial + practica |
| **TECNICO** | Instalacion y mantenimiento | **3 horas** | Presencial + demostracion |
| **TECNICO_LAB** | Laboratorio y garantias | **3 horas** | Presencial + practica |

---

## Modulos de Capacitacion

### Modulo 1: Introduccion al Sistema -- 1h -- *Todos los perfiles*

| Objetivo | Comprender la arquitectura y proposito del sistema |
|-------------|-----------------------------------------------------|

**Contenido:**

| Tema | Duracion |
|------|-------------|
| ?Que es SIGAI-SES y que problema resuelve? | 10 min |
| Arquitectura general (Frontend, Backend, BD) | 10 min |
| Modulos del sistema | 10 min |
| Beneficios respecto al proceso actual (Excel) | 10 min |
| Demo general del sistema | 20 min |

**Material:** Presentacion, Manual de Usuario, FAQ

---

### Modulo 2: Acceso y Navegacion -- 1h -- *Todos los perfiles*

| Objetivo | Aprender a ingresar al sistema y navegar por los modulos |
|-------------|-----------------------------------------------------------|

**Contenido:**
1. Ingreso al sistema (URL, credenciales)
2. Interfaz general: Barra lateral (11 modulos) + Barra superior (busqueda, notificaciones, perfil)
3. Cierre de sesion
4. Solucion de problemas comunes de acceso

> [!TIP]
> **Ejercicio practico:** Cada usuario inicia sesion, navega por 3 modulos y cierra sesion.

---

### Modulo 3: Gestion de Inventario -- 1.5h -- *TECNICOS y LAB*

| Objetivo | Aprender a consultar, crear y modificar equipos en el inventario |
|-------------|------------------------------------------------------------------|

**Contenido:**

| Tema | Duracion |
|------|-------------|
| Consultar inventario (filtros: busqueda, categoria, estado) | 20 min |
| Ver detalle de un activo (informacion, historial, ubicacion) | 15 min |
| Registrar nuevo equipo | 20 min |
| Importar desde Excel (formato, validacion, resumen) | 20 min |
| Exportar inventario a Excel/PDF | 15 min |

> [!TIP]
> **Ejercicio practico:**
> - Buscar un equipo por serial
> - Registrar 3 equipos nuevos
> - Importar un archivo Excel de ejemplo

---

### Modulo 4: Gestion de Garantias -- 1.5h -- *TECNICOS y LAB*

| Objetivo | Aprender el flujo completo de garantias |
|-------------|------------------------------------------|

**Contenido:**
1. Reportar una garantia (seleccionar equipo, describir falla, asignar proveedor)
2. Seguimiento de casos (tabla de estados, filtros)
3. Actualizar estado de garantia
4. Interpretacion de alertas de estancamiento

> [!TIP]
> **Ejercicio practico:**
> - Crear un caso de garantia
> - Avanzar el caso a traves de 3 estados
> - Identificar una garantia estancada

---

### Modulo 5: Actas de Entrega y Desmontes -- 1.5h -- *ADMIN y LAB*

| Objetivo | Aprender a generar actas digitales y registrar desmontes |
|-------------|----------------------------------------------------------|

**Contenido:**
1. Tipos de acta (EPP, Herramienta, Proyecto, Devolucion, Desmonte)
2. Crear un acta paso a paso
3. Captura de firma digital
4. Generacion de PDF
5. Registro de desmontes
6. Evaluacion tecnica (triaje)

> [!TIP]
> **Ejercicio practico:**
> - Crear un acta de entrega de herramienta
> - Firmar digitalmente
> - Descargar el PDF
> - Registrar un desmonte y realizar triaje

---

### Modulo 6: Centro de Alertas -- 1h -- *ADMIN*

| Objetivo | Aprender a gestionar alertas |
|-------------|-------------------------------|

**Contenido:**

| Tema | Duracion |
|------|-------------|
| Visualizar alertas activas | 15 min |
| Tipos de alerta (stock bajo, garantia estancada) | 15 min |
| Gestionar alertas (reconocer, resolver, ignorar) | 20 min |
| Configurar umbrales de alerta | 10 min |

> [!TIP]
> **Ejercicio practico:**
> - Reconocer una alerta
> - Resolver una alerta
> - Ver resumen de alertas

---

### Modulo 7: Administracion del Sistema -- 2h -- *Solo ADMIN*

| Objetivo | Aprender la gestion avanzada del sistema |
|-------------|------------------------------------------|

**Contenido:**

| Tema | Duracion |
|------|-------------|
| Gestion de usuarios (crear, editar, desactivar, roles) | 30 min |
| Gestion de regionales | 15 min |
| Auditoria (consultar bitacora, interpretar cambios) | 30 min |
| Respaldo y mantenimiento (conceptos, frecuencia) | 25 min |
| Configuracion de alertas automaticas | 20 min |

> [!TIP]
> **Ejercicio practico:**
> - Crear un usuario TECNICO
> - Consultar la bitacora de auditoria
> - Exportar un reporte

---

## Cronograma de Capacitacion

### Semana 1: Preparacion

| Dia | Actividad |
|-----|--------------|
| **Lunes** | Preparar materiales y entorno de pruebas |
| **Martes** | Configurar usuarios de prueba para capacitacion |
| **Miercoles** | Validar que el entorno de pruebas funciona |
| **Jueves** | Enviar invitaciones con horarios y ubicacion |
| **Viernes** | Cargar datos de ejemplo en el sistema |

### Semana 2: Capacitacion

| Dia | Horario | Perfil | Modulos |
|-----|------------|-----------|-------------|
| **Lunes (AM)** | 8:00-12:00 | ADMIN | M1, M2, M7 |
| **Lunes (PM)** | 14:00-17:00 | TECNICO | M1, M2, M3, M4 |
| **Martes (AM)** | 8:00-12:00 | TECNICO_LAB | M1, M2, M3, M4 |
| **Martes (PM)** | 14:00-17:00 | TECNICO_LAB | M5, M6 |
| **Miercoles** | 14:00-16:00 | ADMIN | Refuerzo M7, preguntas |

### Semana 3: Acompanamiento

| Dia | Actividad |
|-----|--------------|
| **Lunes-Viernes** | Soporte en linea para dudas operativas |
| **Viernes** | Sesion de preguntas y respuestas (1 hora) |

---

## Materiales de Capacitacion

### Documentacion Entregada

| Documento | Formato | Destino |
|-------------|---------|------|
| Manual del Usuario Tecnico | PDF | Para todos |
| Manual del Administrador | PDF | Solo ADMIN |
| FAQ de Usuario | PDF | Para todos |
| Guia rapida de referencia (1 pagina, ambos lados) | Impreso | Para todos |

### Entorno de Pruebas

| Recurso | Detalle |
|---------|------------|
| URL del entorno | `https://sigai-ses-pruebas.vercel.app` |
| Usuarios de prueba | Por perfil (ADMIN, TECNICO, TECNICO_LAB) |
| Datos de ejemplo | 50 items, 10 activos, 5 clientes, 3 garantias |

### Evaluacion

- Cuestionario de **10 preguntas** al finalizar
- Ejercicio practico calificado (crear un acta completa)
- Encuesta de satisfaccion

---

## Evaluacion y Seguimiento

### Criterios de Aprobacion

| Perfil | Minimo Aprobatorio |
|-----------|-----------------------|
| **ADMIN** | **80%** en cuestionario + acta completa creada |
| **TECNICO** | **70%** en cuestionario + equipo registrado correctamente |
| **TECNICO_LAB** | **70%** en cuestionario + triaje completado |

### Indicadores de Exito

| Indicador | Meta | Como se mide |
|-------------|---------|-----------------|
| Usuarios capacitados | **100%** del personal operativo | Registro de asistencia |
| Satisfaccion con capacitacion | **>= 4.0 / 5.0** | Encuesta anonima |
| Tiempo promedio primer login exitoso | **< 5 min** sin asistencia | Logs del sistema |
| Reduccion de errores en primer mes | **>= 50%** | Tickets de soporte |

### Seguimiento Post-Capacitacion

| Periodo | Soporte | Respuesta |
|---------|------------|--------------|
| **Semana 1-2** | Intensivo | < 2 horas |
| **Semana 3-4** | Normal | < 24 horas |
| **Mes 2** | Revision de adopcion + encuesta | -- |
| **Mes 3** | Capacitacion de refuerzo si necesaria | -- |

---

## Checklist del Capacitador

### Antes de la capacitacion

- [ ] Verificar entorno de pruebas funcionando
- [ ] Crear usuarios de prueba para cada asistente
- [ ] Imprimir manuales y guias rapidas
- [ ] Preparar presentacion (diapositivas + demo)
- [ ] Verificar proyector, audio e internet
- [ ] Tener lista la URL del sistema

### Durante la capacitacion

- [ ] Iniciar con vision general del sistema (15 min)
- [ ] Demostrar cada modulo antes del ejercicio practico
- [ ] Supervisar ejercicios practicos uno a uno
- [ ] Recoger preguntas para la sesion de cierre
- [ ] Tomar asistencia

### Despues de la capacitacion

- [ ] Enviar encuesta de satisfaccion
- [ ] Enviar materiales digitales (PDFs)
- [ ] Programar sesiones de refuerzo si es necesario
- [ ] Documentar lecciones aprendidas

---

## Preguntas Frecuentes de Capacitacion

<details>
<summary>?Que hago si olvido mi contrasena?</summary>

> Contacte a su **administrador del sistema** para que restablezca su contrasena. Actualmente no hay opcion de autorecuperacion.
</details>

<details>
<summary>?Puedo usar el sistema en mi celular?</summary>

> **Si.** El sistema esta disenado con enfoque **"Mobile-First"** y funciona correctamente en navegadores moviles (Chrome, Safari, Edge).
</details>

<details>
<summary>?Que hago si el sistema no carga?</summary>

> 1. Verifique su conexion a internet
> 2. Intente con otro navegador
> 3. Contacte a soporte tecnico si el problema persiste
</details>

<details>
<summary>?Los datos que ingreso son seguros?</summary>

> **Si.** El sistema utiliza autenticacion JWT, encriptacion de contrasenas con **bcrypt**, y todas las acciones quedan registradas en la **bitacora de auditoria**.
</details>

---

## Progreso de Capacitacion

```
Semana 1: Preparacion        [============    ] 75% [PENDING]
Semana 2: Capacitacion       [================] 100% [COMPLETED]
Semana 3: Acompanamiento     [================] 100% [COMPLETED]
Evaluacion Final             [==========      ] 50% [PENDING]
```

---

> [!TIP]
> **Recomendacion:** Graba las sesiones de capacitacion para que los usuarios puedan repasar los conceptos posteriormente.

---

*Documento actualizado: Julio 2026 -- v1.0*
*Repositorio: [github.com/TU_USUARIO/proyecto-sigai-ses](https://github.com/TU_USUARIO/proyecto-sigai-ses)*
