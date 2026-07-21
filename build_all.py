"""
Script único para construir el .exe completo (frontend + backend en uno).

Uso:
    python build_all.py

Requisitos:
    - Node.js 18+ instalado
    - Python 3.11+ con el .venv activado
    - Backend/.env configurado con DATABASE_URL de Supabase

Qué hace:
    1. Compila el frontend (React → static files)
    2. Copia los archivos al backend
    3. Compila todo en un solo .exe con PyInstaller
"""

import os
import sys
import subprocess
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT, "Frontend")
BACKEND_DIR = os.path.join(ROOT, "Backend")
WEB_DEST = os.path.join(BACKEND_DIR, "app", "static", "web")


def step(msg):
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}")


def run(cmd, cwd):
    result = subprocess.run(cmd, cwd=cwd, shell=True)
    if result.returncode != 0:
        print(f"❌ Error ejecutando: {cmd}")
        sys.exit(result.returncode)
    return result


# ── Paso 1: Compilar frontend ──
step("1/3: Compilando frontend (React → static files)...")
run("npm install", FRONTEND_DIR)
run("npm run build", FRONTEND_DIR)

# ── Paso 2: Copiar frontend al backend ──
step("2/3: Copiando frontend compilado al backend...")
if os.path.exists(WEB_DEST):
    shutil.rmtree(WEB_DEST)
shutil.copytree(os.path.join(FRONTEND_DIR, "dist"), WEB_DEST)
print(f"  ✅ Frontend copiado a: {WEB_DEST}")

# ── Paso 3: Compilar backend.exe ──
step("3/3: Compilando backend.exe (PyInstaller)...")

# Usar el entorno virtual de Python
python_exe = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(python_exe):
    python_exe = sys.executable

run(f'"{python_exe}" -m PyInstaller backend.spec --clean --noconfirm', BACKEND_DIR)

# ── Resultado ──
exe_name = "SIGAI-SES.exe"
exe_path = os.path.join(BACKEND_DIR, "dist", exe_name)
if os.path.exists(exe_path):
    print(f"\n{'='*60}")
    print(f"  ✅ BACKEND COMPILADO: {exe_path}")
    print(f"  Tamaño: {os.path.getsize(exe_path) / 1024 / 1024:.1f} MB")
    print(f"{'='*60}")
else:
    alt = os.path.join(BACKEND_DIR, "dist", "backend", exe_name)
    if os.path.exists(alt):
        exe_path = alt
        print(f"\n✅ BACKEND COMPILADO: {exe_path}")
    else:
        print(f"\n⚠️  No se encontró {exe_name} en dist/")
        print("   Revisa la carpeta Backend/dist/ para el ejecutable.")
        sys.exit(1)

# ── Paso 4: Generar instalador con Inno Setup (si está instalado) ──
step("4/4: Generando instalador con Inno Setup...")
for ver in ["Inno Setup 7", "Inno Setup 6", "Inno Setup 5"]:
    iscc = os.path.join(os.environ.get("PROGRAMFILES(x86)", "C:\\Program Files (x86)"), ver, "ISCC.exe")
    if os.path.exists(iscc):
        break
    iscc = os.path.join(os.environ.get("PROGRAMFILES", "C:\\Program Files"), ver, "ISCC.exe")
    if os.path.exists(iscc):
        break

if os.path.exists(iscc):
    run(f'"{iscc}" installer.iss', ROOT)
    installer = os.path.join(ROOT, "dist_installer", "SIGAI-SES-Setup-1.0.0.exe")
    if os.path.exists(installer):
        print(f"\n{'='*60}")
        print(f"  ✅ INSTALADOR LISTO: {installer}")
        print(f"{'='*60}")
else:
    print("\n⚠️  Inno Setup no instalado. Saltando generacion del instalador.")
    print("   Descarga Inno Setup desde: https://jrsoftware.org/isdl.php")
    print(f"\n  El .exe portable esta en: {exe_path}")
    print("  Para ejecutarlo directamente, haz doble clic en el archivo.")
