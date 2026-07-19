# 📋 ESPECIFICACIONES DE REQUERIMIENTOS (VERSION 2.0) — SIGAI-SES

## 1. REQUERIMIENTOS FUNCIONALES (RF)

### 1.1 Módulo de Seguridad y Acceso
- **RF-01: Control de Acceso (RBAC):** Cuatro niveles de acceso: ADMIN (Total), SUPERVISOR (Reportes/Aprobaciones), BODEGUERO (Entradas/Salidas), TÉCNICO (Consulta/Asignación).
- **RF-02: Autenticación JWT:** Sesiones seguras con tokens de expiración y renovación automática.
- **RF-03: Auditoría de Sesiones:** Registro de ingresos y acciones críticas por usuario.

### 1.2 Módulo de Catálogo e Inventario
- **RF-04: Maestro de Items:** Definición de productos con subcategorías, puntos de recompra y códigos SAP/CECO.
- **RF-05: Activos Serializados:** Control individual por número de serie para equipos críticos (Cámaras, NVR, Herramientas).
- **RF-06: Inventario Bulk (Consumibles):** Control de stock por cantidades decimales y alertas de agotamiento.
- **RF-07: Gestión de Laboratorio:** Seguimiento de herramientas propias con placas de activo fijo.

### 1.3 Módulo de Operaciones y Movimientos
- **RF-08: Kardex Digital:** Historial inmutable de cada movimiento (Entrada, Salida, Traslado, Devolución).
- **RF-09: Gestión de Desmontes:** Proceso de triaje para equipos retirados de clientes con evaluación de estado técnico.
- **RF-10: Actas Digitales:** Generación de actas PDF con firma táctil capturada desde dispositivos móviles.
- **RF-11: Asignación de Responsables:** Vinculación de activos a un área específica y un responsable en sitio del cliente.

### 1.4 Módulo de Garantías
- **RF-12: Seguimiento de Casos:** Flujo de estados sincronizado con el proveedor (Registrado -> Enviado -> Recibido -> Resuelto).
- **RF-13: Alertas de Vencimiento:** Notificaciones automáticas cuando un caso de garantía supere el tiempo límite pactado.

---

## 2. REQUERIMIENTOS NO FUNCIONALES (RNF)

- **RNF-01: Disponibilidad (PWA):** El sistema debe ser instalable en móviles y permitir consulta de inventario asignado offline.
- **RNF-02: Escalabilidad:** Backend capaz de manejar hasta 50,000 registros de movimientos sin degradación de rendimiento.
- **RNF-03: Seguridad de Datos:** Encriptación de contraseñas con Argon2 o Bcrypt y uso de HTTPS.
- **RNF-04: Usabilidad:** Interfaz "Mobile-First" optimizada para uso con guantes o en condiciones de baja iluminación.
- **RNF-05: Integridad:** Uso de transacciones SQL para asegurar que una salida de stock siempre genere un movimiento en el Kardex.

---

## 3. PLAN DE EJECUCIÓN (ROADMAP)

### Sprint 1: Cimientos y Auth (Semanas 1-2)
- Configuración de entornos y Base de Datos.
- API de Autenticación y Gestión de Usuarios.
- Estructura base del Frontend.

### Sprint 2: Catálogo y Stock Inicial (Semanas 3-4)
- CRUD de Items y Clientes Corporativos.
- Importador masivo de datos desde Excel.
- Dashboard de stock actual.

### Sprint 3: Operaciones y Kardex (Semanas 5-6)
- Lógica de Entradas y Salidas.
- Registro automático de movimientos (Auditoría).
- Gestión de herramientas de Laboratorio.

### Sprint 4: Actas y Garantías (Semanas 7-8)
- Generación de Actas PDF.
- Captura de Firma Digital.
- Módulo completo de Garantías.

### Sprint 5: Desmontes y Reportes (Semanas 9-10)
- Flujo de triaje para desmontes.
- Dashboard con KPIs de rotación y mermas.
- Pruebas de integración.

### Sprint 6: Despliegue y Cierre (Semanas 11-12)
- Dockerización y despliegue en servidor.
- Capacitación de usuarios.
- Entrega de documentación técnica final.
