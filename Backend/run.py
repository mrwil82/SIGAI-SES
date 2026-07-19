import uvicorn
import os
import sys
import webbrowser
import threading
import subprocess
from pathlib import Path


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
