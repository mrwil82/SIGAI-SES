# DOCUMENTO 1 – Informe técnico de especificación de requisitos y modelo de base de datos

## 1. Introducción y objetivo
El presente documento detalla la especificación de requisitos y el diseño lógico de datos para el **Sistema de Gestión de Inventarios SES**, desarrollado para la optimización del control de activos en las subestaciones eléctricas de **ENEL Colombia** en la región de Cundinamarca. El objetivo es centralizar la información que actualmente se gestiona de forma dispersa en libros de cálculo manuales.

## 2. Descripción del proceso actual
Actualmente, el control de inventarios se realiza mediante archivos de Microsoft Excel independientes:
- **Inventario Laboratorio:** Registro manual de marcas, modelos y cantidades por estante (A1, A2, H6).
- **Proceso de Garantías:** Seguimiento en hojas de cálculo de casos RMA, números de factura y estados de reparación.
- **Inventario Clientes:** Formatos específicos para proyectos como Procafecol, ISIMO y Alsea.
Este proceso carece de trazabilidad en tiempo real, integridad referencial y alertas automáticas de stock crítico.

## 3. Requisitos funcionales
El sistema SES se divide en los siguientes módulos con sus respectivos requisitos:

### Módulo de Inventario y Catálogo
- **RF01:** Registro de ítems en catálogo maestro (nombre, marca, referencia, categoría).
- **RF02:** Gestión de activos serializados con asignación de ubicación física (estantes, pasillos).
- **RF03:** Control de stock mínimo con generación de alertas visuales.

### Módulo de Operaciones y Movimientos
- **RF04:** Registro de movimientos de inventario (Entradas por compra, traslados y salidas por instalación).
- **RF05:** Generación de actas de entrega en formato PDF con firma digital del técnico.

### Módulo de Garantías y Clientes
- **RF06:** Seguimiento de procesos RMA con proveedores, incluyendo fechas límite y fallas reportadas.
- **RF07:** Gestión de clientes corporativos y asociación de proyectos con centros de costos (CECO).

### Módulo de Seguridad y Auditoría
- **RF08:** Registro de logs de auditoría para cada creación, edición o eliminación de registros.

## 4. Requisitos no funcionales
- **Seguridad:** Autenticación mediante JWT (JSON Web Tokens) y encriptación de contraseñas con Passlib/Bcrypt.
- **Rendimiento:** Tiempos de respuesta menores a 2 segundos para consultas de inventario mediante SQLAlchemy asíncrono.
- **Usabilidad:** Interfaz "Fusion Design System" responsiva y de alto contraste para uso en campo (subestaciones).

## 5. Matriz de funcionalidades por módulo

| Módulo | Funcionalidad | Prioridad |
| :--- | :--- | :--- |
| Inventario | CRUD de Catálogo e Ítems | Alta |
| Inventario | Trazabilidad de Seriales y Ubicaciones | Alta |
| Movimientos | Registro de Kardex (Entradas/Salidas) | Alta |
| Garantías | Control de RMA y Casos Internos | Media |
| Reportes | Dashboard con indicadores de stock | Media |

## 6. Diagrama entidad-relación (Descripción textual)
El modelo se basa en una base de datos relacional MySQL:
- **usuarios:** ID, nombre, email, password_hash, rol (ADMIN, TECNICO, etc.).
- **items:** Catálogo maestro. Relación 1:N con **activos** y 1:1 con **stock_bulk**.
- **activos:** Registro individual por serial. Relación N:1 con **proyectos**.
- **movimientos_inventario:** Registro de transacciones. Relación con **usuarios**, **items** y **activos**.
- **garantias:** Control de RMA. Relación con **activos** y **proveedores**.
- **clientes/proyectos:** Estructura jerárquica para la asignación de activos por sede o contrato.

## 7. Conclusiones
La especificación de estos requisitos asegura que el sistema SES cubra las brechas operativas identificadas en ENEL Colombia, garantizando que el paso de Excel a una plataforma web proporcione la integridad y agilidad necesaria para la gestión de infraestructura crítica.
