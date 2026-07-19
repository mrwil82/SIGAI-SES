# SIGAI-SES

Sistema Integral de Gestión de Activos e Inventario para el área de Seguridad Electrónica de Securitas Colombia.

## Descripción

Plataforma empresarial para la gestión, control y trazabilidad de activos tecnológicos, inventarios y procesos de garantías. Unifica operaciones de bodegas, laboratorios y técnicos en campo con visión 360° del ciclo de vida de cada equipo.

## Características Principales

- **Gestión de Inventario:** Control multiregional con trazabilidad individual por serial y placa
- **Ciclo de Garantías:** Seguimiento de estados con alertas automáticas de estancamiento
- **Importación Inteligente:** Procesamiento de Excel con normalización automática y lógica upsert
- **Reportes Masivos:** Generación de PDF/Excel con streaming para +30k registros
- **Seguridad:** Autenticación JWT, roles por regional, auditoría completa de cambios

## Stack Tecnológico

**Backend:** FastAPI (Python 3.12+) • SQLAlchemy asíncrono • MySQL/MariaDB • Alembic  
**Frontend:** React + TypeScript • Vite • Tailwind CSS • Context API  
**Despliegue:** Docker Compose • Nginx

## Instalación Rápida

### Con Docker (Recomendado)
```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 2. Iniciar servicios
docker-compose up -d

# 3. Acceder
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Documentación API: http://localhost:8000/docs
```

### Desarrollo Local

**Requisitos:** Python 3.12+ • Node.js 18+ • MySQL 8.0+

**Backend:**
```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Configurar .env con credenciales de BD
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd Frontend
npm install
# Configurar .env con URL del API
npm run dev
```

## Estructura del Proyecto

```
SIGAI-SES/
├── Backend/                # API FastAPI
│   ├── app/               # Aplicación principal
│   ├── migrations/        # Migraciones Alembic
│   └── requirements.txt
├── Frontend/              # Aplicación React
│   ├── src/
│   └── package.json
├── DOCUMENTOS/            # Documentación técnica
├── ENTREGABLES_SIGAI_SES/ # Entregables del proyecto
├── docker-compose.yml     # Configuración Docker
└── .env.example           # Variables de entorno ejemplo
```

## Configuración

### Variables de Entorno Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sigai_ses
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
SECRET_KEY=tu_clave_secreta_jwt
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Endpoints Principales del API

- `POST /api/v1/auth/login` - Autenticación
- `GET /api/v1/inventory/` - Consulta de inventario
- `POST /api/v1/inventory/import` - Importación masiva Excel
- `GET /api/v1/warranties/` - Gestión de garantías
- `GET /api/v1/reports/` - Generación de reportes

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia

Proyecto privado - Securitas Colombia S.A.

---

**Securitas Colombia S.A.** • Unidad de Seguridad Electrónica (SES)
