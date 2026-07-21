import uvicorn
import os
import sys
import webbrowser
import threading
import subprocess
import io
from pathlib import Path


ENV_CONTENT = """# SIGAI-SES Backend - Variables de Entorno
DATABASE_URL=postgresql+asyncpg://postgres.ifzbrwmprefcjrvyscys:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres
DATABASE_URL_SYNC=postgresql://postgres.ifzbrwmprefcjrvyscys:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres
SECRET_KEY=clave_secreta_super_segura_123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:8000,http://localhost:5173,http://127.0.0.1,http://127.0.0.1:8000,http://127.0.0.1:5173
ADMIN_EMAIL=admin@securitas.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administrador SIGAI
ADMIN_CEDULA=0000000000
ADMIN_CODIGO=ADM001
"""


def get_app_dir():
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).parent


def ensure_env():
    app_dir = get_app_dir()
    env_path = app_dir / '.env'
    if not env_path.exists():
        env_path.write_text(ENV_CONTENT, encoding='utf-8')


def get_exe_path():
    if getattr(sys, 'frozen', False):
        return Path(sys.executable)
    return None


def create_desktop_shortcut():
    exe_path = get_exe_path()
    if not exe_path:
        return

    desktop = Path(os.path.expanduser("~/Desktop"))
    name = "SIGAI-SES"
    exe_path = exe_path.resolve()

    shortcut_path = desktop / f"{name}.lnk"

    if shortcut_path.exists():
        return

    ps_script = f"""
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{exe_path}"
$Shortcut.WorkingDirectory = "{exe_path.parent}"
$Shortcut.Description = "SIGAI-SES - Sistema de Seguridad"
$Shortcut.Save()
"""
    try:
        subprocess.run(["powershell", "-Command", ps_script], capture_output=True, timeout=10)
    except Exception:
        pass


def open_browser():
    port = int(os.environ.get("PORT", "8000"))
    webbrowser.open(f"http://localhost:{port}")


if __name__ == "__main__":
    app_dir = get_app_dir()
    os.chdir(app_dir)
    sys.path.insert(0, str(app_dir))

    ensure_env()

    if sys.stderr is None:
        sys.stderr = io.TextIOWrapper(io.BytesIO(), encoding='utf-8')
    if sys.stdout is None:
        sys.stdout = io.TextIOWrapper(io.BytesIO(), encoding='utf-8')

    port = int(os.environ.get("PORT", "8000"))

    create_desktop_shortcut()

    timer = threading.Timer(2.0, open_browser)
    timer.daemon = True
    timer.start()

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=port,
        log_level="info",
        reload=False,
    )
