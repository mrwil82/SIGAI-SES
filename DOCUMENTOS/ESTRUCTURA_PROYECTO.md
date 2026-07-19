# 🏗️ ESTRUCTURA DE ARCHIVOS Y DIRECTORIOS DEFINITIVA

```text
Proyecto_SES/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/          # Rutas del API (auth, stock, garantias)
│   │   │   └── api_router.py       # Agregador de rutas
│   │   ├── core/                   # Configuración global, seguridad, JWT
│   │   ├── crud/                   # Lógica de negocio (Consultas SQL)
│   │   ├── db/                     # Sesión de base de datos y Base Declarativa
│   │   ├── models/                 # Modelos de SQLAlchemy (Tablas)
│   │   ├── schemas/                # Modelos de Pydantic (Validación de datos)
│   │   ├── utils/                  # Generación de PDF, correos, Excel
│   │   └── main.py                 # Punto de entrada FastAPI
│   ├── Base_de_datos/
│   │   └── script_db_v2.sql        # Script SQL de creación
│   ├── tests/                      # Pruebas unitarias y de integración
│   ├── .env                        # Variables de entorno (Secrets)
│   ├── requirements.txt            # Dependencias de Python
│   └── Dockerfile                  # Contenedor del Backend
├── Frontend/
│   ├── src/
│   │   ├── api/                    # Instancia de Axios e Interceptores
│   │   ├── components/
│   │   │   ├── common/             # Botones, Inputs, Modales reutilizables
│   │   │   └── layout/             # Sidebar, Navbar, Footer
│   │   ├── context/                # Estado global (AuthContext, InventoryContext)
│   │   ├── hooks/                  # Custom hooks (useAuth, useInventory)
│   │   ├── pages/                  # Vistas principales (Dashboard, Stock, Actas)
│   │   ├── services/               # Llamadas al API por módulo
│   │   ├── utils/                  # Formateadores de fecha, moneda, etc.
│   │   └── App.tsx                 # Enrutador principal
│   ├── public/                     # Activos estáticos (Logo Securitas)
│   ├── tailwind.config.js          # Configuración de estilos
│   ├── package.json                # Dependencias de React
│   └── Dockerfile                  # Contenedor del Frontend
├── DOCUMENTOS/                     # Archivos de soporte y Excel originales
├── REQUERIMIENTOS.md               # Especificaciones técnicas
├── HISTORIAS_USUARIO.md            # Requerimientos de negocio
├── PROPUESTA_GESTION_INVENTARIO_SES.md # Propuesta técnica v2.0
└── README.md                       # Guía de instalación rápida
```
