# DOCUMENTO 2 – Documento de arquitectura y estructura de carpetas del proyecto

## 1. Introducción y justificación tecnológica
El proyecto SES adopta una arquitectura desacoplada para garantizar escalabilidad y mantenimiento:
- **Backend (FastAPI):** Elegido por su alto rendimiento asíncrono y generación automática de documentación OpenAPI.
- **Frontend (React + Vite):** Proporciona una experiencia de usuario fluida (SPA) con un empaquetado ultra rápido.
- **Base de Datos (MySQL):** Motor robusto para garantizar la persistencia e integridad de los datos de inventario.

## 2. Árbol de directorios

```bash
Proyecto_SES/
├── Backend/                 # Lógica de servidor y API
│   ├── app/
│   │   ├── api/             # Endpoints (auth, inventory, business, analytics)
│   │   ├── core/            # Configuración global y seguridad (JWT)
│   │   ├── crud/            # Operaciones de base de datos (Lógica de negocio)
│   │   ├── db/              # Conexión y sesión asíncrona (SQLAlchemy)
│   │   ├── models/          # Definición de tablas MySQL
│   │   └── schemas/         # Validaciones Pydantic
│   ├── .env                 # Variables de entorno
│   └── main.py              # Punto de entrada de la aplicación
├── Frontend/                # Interfaz de usuario
│   ├── src/
│   │   ├── components/      # Componentes reutilizables (Fusion UI)
│   │   ├── context/         # Manejo de estado global (AuthContext)
│   │   ├── pages/           # Vistas (Dashboard, Inventory, Guarantees)
│   │   ├── services/        # Consumo de API con Axios
│   │   └── App.tsx          # Enrutamiento y estructura principal
│   └── vite.config.ts       # Configuración de compilación
└── DOCUMENTOS/              # Documentación técnica y bitácoras
```

## 3. Convenciones de nomenclatura
- **Archivos:** `snake_case` para Python (Backend) y `PascalCase` para componentes React (Frontend).
- **Variables/Funciones:** `camelCase` en Frontend y `snake_case` en Backend.
- **Tablas BD:** Plural y en minúsculas (ej. `usuarios`, `movimientos_inventario`).

## 4. Descripción de responsabilidades por capa
- **Capa de Presentación (Frontend):** Gestiona la captura de datos y renderizado de tablas/gráficos. No contiene lógica de persistencia.
- **Capa de Lógica de Negocio (CRUD):** Valida reglas como stock mínimo, estados de garantía y permisos de usuario.
- **Capa de Datos (Models/DB):** Define la estructura física y gestiona las transacciones SQL.

## 5. Flujo de comunicación
1. El **Usuario** interactúa con un componente React.
2. El **Frontend** dispara una petición `HTTP (Axios)` al Backend.
3. El **Backend (FastAPI)** valida el token JWT y procesa la solicitud a través del **CRUD**.
4. Se ejecuta la consulta en **MySQL**.
5. El resultado retorna como **JSON** al Frontend para actualizar la vista.

## 6. Conclusiones
Esta estructura organizada permite un desarrollo paralelo entre Frontend y Backend, facilitando la implementación de nuevas funcionalidades para ENEL Colombia sin afectar la estabilidad de los módulos existentes.
