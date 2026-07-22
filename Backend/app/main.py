from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
try:
    from app.core.scheduler import start_scheduler, stop_scheduler
    _scheduler_available = True
except ModuleNotFoundError:
    _scheduler_available = False

    def start_scheduler():
        logger.warning("APScheduler no instalado - tareas programadas desactivadas")

    def stop_scheduler():
        pass
from app.api.endpoints import (
    auth, users, inventory, business, analytics, 
    reports, alerts, regionales, import_data, monitoring
)
import sys
import logging
import logging.config
import os
from pathlib import Path
import time
import json
import uuid
from datetime import datetime, timezone
from app.core.logger import set_request_id, set_user_id

if getattr(sys, 'frozen', False):
    APP_DIR = Path(sys.executable).parent
else:
    APP_DIR = Path(__file__).parent.parent

LOG_DIR = os.getenv("LOG_DIR", str(APP_DIR / "logs"))
os.makedirs(LOG_DIR, exist_ok=True)

_has_console = sys.stderr is not None

_handlers = {
    "file": {
        "class": "logging.handlers.RotatingFileHandler",
        "filename": os.path.join(LOG_DIR, "app.log"),
        "maxBytes": 10485760,
        "backupCount": 5,
        "formatter": "standard",
        "level": "INFO",
    },
    "error_file": {
        "class": "logging.handlers.RotatingFileHandler",
        "filename": os.path.join(LOG_DIR, "error.log"),
        "maxBytes": 10485760,
        "backupCount": 5,
        "formatter": "standard",
        "level": "ERROR",
    },
    "access_file": {
        "class": "logging.handlers.RotatingFileHandler",
        "filename": os.path.join(LOG_DIR, "access.log"),
        "maxBytes": 10485760,
        "backupCount": 5,
        "formatter": "standard",
        "level": "INFO",
    },
}

if _has_console:
    _handlers["console"] = {
        "class": "logging.StreamHandler",
        "formatter": "standard",
        "level": "INFO",
    }

_main_handlers = list(_handlers.keys())

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": "%(message)s",
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
        },
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        },
    },
    "handlers": _handlers,
    "loggers": {
        "": {
            "handlers": _main_handlers,
            "level": "INFO",
            "propagate": True,
        },
        "uvicorn.access": {
            "handlers": ["access_file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Maneja el ciclo de vida de la aplicacion."""
    logger.info("Iniciando SIGAI-SES API...")

    try:
        from scripts.init_db import init_database
        await init_database()
    except Exception as e:
        logger.warning(f"No se pudo ejecutar init_db automaticamente: {e}")
        logger.info("Puede ejecutar manualmente: python -m scripts.init_db")

    start_scheduler()

    yield

    stop_scheduler()
    logger.info("Deteniendo SIGAI-SES API...")

app = FastAPI(
    title="SIGAI-SES API",
    description="Sistema Integral de Gestion de Activos e Inventario - Seguridad Electronica Securitas",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

static_dir = os.path.join(os.getcwd(), 'app', 'static')
if not os.path.exists(static_dir):
    os.makedirs(os.path.join(static_dir, 'avatars'), exist_ok=True)
    os.makedirs(os.path.join(static_dir, 'web'), exist_ok=True)
app.mount('/static', StaticFiles(directory=static_dir), name='static')

app.add_middleware(GZipMiddleware, minimum_size=500)

try:
    cors_env = getattr(settings, "CORS_ALLOWED_ORIGINS", None)
    if cors_env and cors_env.strip():
        allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    else:
        allowed_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost",
            "capacitor://localhost",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1",
            "https://sigai-ses-api.onrender.com",
        ]
except Exception:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())[:8]
    set_request_id(request_id)
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path

    # Extraer user_id del header si está autenticado
    user_id = None
    auth_header = request.headers.get("authorization", "")
    if auth_header:
        try:
            from jose import jwt
            from app.core.config import settings
            payload = jwt.decode(auth_header.replace("Bearer ", ""), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_email = payload.get("sub")
            if user_email:
                logger.debug(f"Request from user {user_email}")
        except Exception:
            pass

    logger.info(
        f"REQUEST START | {method} {path} | IP: {client_ip} | req_id: {request_id}"
    )

    response = await call_next(request)

    duration = time.time() - start_time
    status_code = response.status_code
    level = "WARNING" if status_code >= 400 else "INFO"

    logger.log(
        getattr(logging, level),
        f"REQUEST END | {method} {path} | Status: {status_code} | Duration: {duration:.3f}s | IP: {client_ip} | req_id: {request_id}"
    )

    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    msg = str(exc) or type(exc).__name__
    logger.error(
        f"GLOBAL ERROR | {request.method} {request.url.path} | Error: {msg}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "message": msg},
    )


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["inventory"])
app.include_router(business.router, prefix="/api/v1/business", tags=["business"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(regionales.router, prefix="/api/v1/regionales", tags=["regionales"])
app.include_router(import_data.router, prefix="/api/v1/import", tags=["import"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ── Servir frontend compilado (cuando existe la carpeta web/) ──
web_dir = os.path.join(static_dir, 'web')
index_path = os.path.join(web_dir, 'index.html')
if os.path.exists(index_path):
    from fastapi.responses import FileResponse as FR

    assets_dir = os.path.join(web_dir, 'assets')
    if os.path.exists(assets_dir):
        app.mount('/assets', StaticFiles(directory=assets_dir), name='web_assets')

    @app.get('/', include_in_schema=False)
    async def serve_root():
        return FR(index_path)

    @app.get('/{full_path:path}', include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith(('api/', 'static/', 'docs', 'openapi')):
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        fp = os.path.join(web_dir, full_path)
        if os.path.isfile(fp):
            return FR(fp)
        return FR(index_path)
else:
    @app.get("/")
    async def root():
        return {
            "message": "Bienvenido al API de SIGAI-SES",
            "status": "Running",
            "version": "1.0.0"
        }
