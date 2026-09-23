"""
Script de backup automatico de la base de datos.
Se puede ejecutar como cron job o tarea programada.

Uso:
  python -m scripts.backup_db

Cron (Linux/Mac) - diario a las 2 AM:
  0 2 * * * cd /app && python -m scripts.backup_db >> /var/log/sigai-backup.log 2>&1

Windows Task Scheduler:
  schtasks /create /tn "SIGAI-Backup" /tr "python -m scripts.backup_db" /sc daily /st 02:00
"""

import os
import sys
import subprocess
import logging
from datetime import datetime
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/backup.log", mode="a"),
    ],
)
logger = logging.getLogger(__name__)

BACKUP_DIR = os.getenv("BACKUP_DIR", "backups")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "sigai_ses")
DB_USER = os.getenv("DB_USER", "sigai")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sigai_password")

MAX_BACKUPS = int(os.getenv("MAX_BACKUPS", "30"))


def create_backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"sigai_ses_backup_{timestamp}.sql")

    logger.info(f"Inicio de backup: {datetime.now().isoformat()}")
    logger.info(f"Archivo de destino: {backup_file}")

    cmd = [
        "mysqldump",
        f"--host={DB_HOST}",
        f"--port={DB_PORT}",
        f"--user={DB_USER}",
        f"--password={DB_PASSWORD}",
        "--single-transaction",
        "--routines",
        "--triggers",
        DB_NAME,
    ]

    try:
        with open(backup_file, "w") as f:
            result = subprocess.run(
                cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                text=True,
                timeout=600,
            )

        if result.returncode != 0:
            logger.error(f"Error en mysqldump: {result.stderr}")
            if os.path.exists(backup_file):
                os.remove(backup_file)
            return False

        file_size = os.path.getsize(backup_file)
        logger.info(
            f"Backup completado exitosamente: {backup_file} ({file_size / 1024 / 1024:.2f} MB)"
        )

        cleanup_old_backups()
        return True

    except subprocess.TimeoutExpired:
        logger.error("Backup cancelado: timeout de 600 segundos excedido.")
        if os.path.exists(backup_file):
            os.remove(backup_file)
        return False
    except FileNotFoundError:
        logger.error(
            "mysqldump no encontrado. Verifique que MySQL client este instalado."
        )
        return False
    except Exception as e:
        logger.error(f"Error durante el backup: {e}", exc_info=True)
        if os.path.exists(backup_file):
            os.remove(backup_file)
        return False


def cleanup_old_backups():
    backups = sorted(Path(BACKUP_DIR).glob("sigai_ses_backup_*.sql"))

    if len(backups) > MAX_BACKUPS:
        to_remove = backups[: len(backups) - MAX_BACKUPS]
        for backup in to_remove:
            backup.unlink()
            logger.info(f"Backup antiguo eliminado: {backup.name}")


if __name__ == "__main__":
    success = create_backup()
    sys.exit(0 if success else 1)
