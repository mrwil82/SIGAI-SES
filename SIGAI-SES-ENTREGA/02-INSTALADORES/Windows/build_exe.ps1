param(
    [switch]$SkipInstall
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendEnv = Join-Path $Root "Frontend" ".env"
$FrontendEnvLocal = Join-Path $Root "Frontend" ".env.local"
$Backup = "$FrontendEnv.build_backup"

Write-Host "=== Build EXE (local) ===" -ForegroundColor Cyan

# 1. Guardar .env original y poner URL local
Write-Host "[1/4] Configurando entorno para EXE local..." -ForegroundColor Yellow
Copy-Item $FrontendEnv $Backup -Force
Set-Content $FrontendEnv "VITE_API_BASE_URL=http://localhost:8000/api/v1"

# 2. Eliminar .env.local si existe para evitar conflictos
if (Test-Path $FrontendEnvLocal) {
    Remove-Item $FrontendEnvLocal -Force
}

# 3. Ejecutar build_all.py
Write-Host "[2/4] Compilando..." -ForegroundColor Yellow
python "$Root\build_all.py"
if ($LASTEXITCODE -ne 0) {
    Copy-Item $Backup $FrontendEnv -Force
    Remove-Item $Backup -Force
    Write-Host "ERROR: build_all.py falló" -ForegroundColor Red
    exit $LASTEXITCODE
}

# 4. Restaurar .env original
Write-Host "[3/4] Restaurando .env original..." -ForegroundColor Yellow
Copy-Item $Backup $FrontendEnv -Force
Remove-Item $Backup -Force

# 5. Mostrar resultados
Write-Host "[4/4] ¡Compilación exitosa!" -ForegroundColor Green

# Buscar EXE
$exe = Get-ChildItem "$Root\Backend\dist\SIGAI-SES.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($exe) {
    $size = [math]::Round($exe.Length / 1MB, 1)
    Write-Host "  📦 EXE: $($exe.FullName) (${size} MB)" -ForegroundColor Cyan
}

# Buscar instalador (generado por Inno Setup en build_all.py paso 4)
$installer = Get-ChildItem "$Root\dist_installer\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($installer) {
    $size = [math]::Round($installer.Length / 1MB, 1)
    Write-Host "  📦 Instalador: $($installer.FullName) (${size} MB)" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  Instalador no generado. Descarga Inno Setup desde https://jrsoftware.org/isdl.php" -ForegroundColor Yellow
    Write-Host "     Luego ejecuta: `"C:\Program Files (x86)\Inno Setup 6\ISCC.exe`" installer.iss" -ForegroundColor Yellow
}
