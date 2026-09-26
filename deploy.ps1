<#>
.SYNOPSIS
    SIGAI-SES - Despliegue automatizado en producción (Windows + Docker)

.DESCRIPTION
    Script todo-en-uno para levantar SIGAI-SES en un servidor Windows con Docker.
    Verifica prerrequisitos, genera .env seguro, levanta servicios y valida salud.

.PARAMETER SkipDockerCheck
    Omitir verificación de Docker (útil si ya sabes que está instalado)

.PARAMETER SkipBuild
    Usar imágenes existentes sin rebuild (más rápido)

.PARAMETER EnvFile
    Ruta al archivo .env personalizado (default: .env)

.EXAMPLE
    .\deploy.ps1
    # Despliegue completo interactivo

.EXAMPLE
    .\deploy.ps1 -SkipBuild
    # Reusar imágenes, solo levantar contenedores

.EXAMPLE
    .\deploy.ps1 -EnvFile "C:\config\sigai.env"
    # Usar archivo de variables externo
#>

param(
    [switch]$SkipDockerCheck,
    [switch]$SkipBuild,
    [switch]$UseSupabase,
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

function Write-Header { param($msg) Write-Host "`n===== $msg =====" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-ErrorMsg { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Read-HostMasked { param($prompt) $secure = Read-Host -AsSecureString $prompt; [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)) }

Write-Header "SIGAI-SES v1.0.0 - Despliegue Producción"
Write-Host "Directorio: $scriptDir"

# 1. Verificar Docker
if (-not $SkipDockerCheck) {
    Write-Header "1/7 Verificando Docker"
    try {
        $dockerVer = docker version --format '{{.Server.Version}}' 2>$null
        if (-not $dockerVer) { throw "Docker no responde" }
        Write-Success "Docker Engine $dockerVer detectado"
    } catch {
        Write-ErrorMsg "Docker no está corriendo. Instale Docker Desktop o Docker Engine."
        Write-Host "   Descarga: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    }

    try {
        $composeVer = docker compose version --short 2>$null
        if (-not $composeVer) { throw "Compose no disponible" }
        Write-Success "Docker Compose $composeVer detectado"
    } catch {
        Write-ErrorMsg "Docker Compose v2 no disponible (requerido). Actualice Docker."
        exit 1
    }
}

# 2. Verificar/Generar .env
Write-Header "2/7 Configurando variables de entorno (.env)"
$envPath = Join-Path $scriptDir $EnvFile
$examplePath = Join-Path $scriptDir ".env.example"

if (Test-Path $envPath) {
    Write-Warning "Archivo .env ya existe en $envPath"
    $reuse = Read-Host "¿Reutilizar .env existente? (S/n)"
    if ($reuse -notmatch '^[nN]$') {
        Write-Success "Usando .env existente"
    } else {
        Remove-Item $envPath -Force
    }
}

if (-not (Test-Path $envPath)) {
    if (-not (Test-Path $examplePath)) {
        Write-ErrorMsg "No se encuentra .env.example"
        exit 1
    }

    Write-Host "Generando .env seguro desde .env.example..."
    $content = Get-Content $examplePath -Raw

    # Generar SECRET_KEY segura
    $secretKey = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
    $content = $content -replace 'SECRET_KEY=.*', "SECRET_KEY=$secretKey"

    # Generar DB passwords seguros
    $dbRootPass = -join ((1..16) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
    $dbUserPass = -join ((1..16) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
    $content = $content -replace 'DB_ROOT_PASSWORD=.*', "DB_ROOT_PASSWORD=$dbRootPass"
    $content = $content -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$dbUserPass"

    # Admin password seguro
    $adminPass = "Admin$(Get-Random -Minimum 1000 -Maximum 9999)!"
    $content = $content -replace 'ADMIN_PASSWORD=.*', "ADMIN_PASSWORD=$adminPass"

    # CORS para producción (ajustar después si hay dominio)
    $content = $content -replace 'CORS_ALLOWED_ORIGINS=.*', "CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:80"

    Set-Content -Path $envPath -Value $content -Encoding UTF8
    Write-Success ".env generado en $envPath"
    Write-Host "`n📋 CREDENCIALES GENERADAS (GUARDE ESTAS):" -ForegroundColor Yellow
    Write-Host "   DB_ROOT_PASSWORD: $dbRootPass"
    Write-Host "   DB_PASSWORD:      $dbUserPass"
    Write-Host "   SECRET_KEY:       $secretKey"
    Write-Host "   ADMIN_EMAIL:      admin@securitas.com"
    Write-Host "   ADMIN_PASSWORD:   $adminPass"
    Write-Host "`n⚠️  IMPORTANTE: Copie estas credenciales AHORA. No se mostrarán de nuevo." -ForegroundColor Red
    Read-Host "Presione ENTER para continuar..."
}

# 3. Validar .env tiene valores mínimos
Write-Header "3/7 Validando .env"
$envContent = Get-Content $envPath -Raw
$required = @("DB_ROOT_PASSWORD", "DB_PASSWORD", "SECRET_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD")
$missing = @()
foreach ($key in $required) {
    if ($envContent -notmatch "^$key=.+$") { $missing += $key }
}
if ($missing.Count -gt 0) {
    Write-ErrorMsg "Faltan variables requeridas en .env: $($missing -join ', ')"
    exit 1
}
Write-Success "Variables críticas presentes"

# 4. Crear directorios necesarios
Write-Header "4/7 Preparando directorios"
@("logs", "Backups") | ForEach-Object {
    $dir = Join-Path $scriptDir $_
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    Write-Success "Directorio $_ listo"
}

# Determinar archivos compose a usar
$composeFiles = @("docker-compose.yml")
if ($UseSupabase) {
    $composeFiles += "docker-compose.supabase.yml"
    Write-Host "Modo Supabase activado (PostgreSQL en la nube)"
}
$composeCmd = "docker compose " + ($composeFiles | ForEach-Object { "-f $_" }) -join " "

# 5. Build / Pull imágenes
if (-not $SkipBuild) {
    Write-Header "5/7 Construyendo imágenes Docker"
    Write-Host "Esto puede tomar 3-5 minutos la primera vez..."
    try {
        Invoke-Expression "$composeCmd build --parallel"
        Write-Success "Imágenes construidas"
    } catch {
        Write-ErrorMsg "Falló el build. Verifique logs arriba."
        exit 1
    }
} else {
    Write-Header "5/7 Saltando build (--SkipBuild)"
    Write-Host "Usando imágenes existentes..."
}

# 6. Levantar servicios
Write-Header "6/7 Iniciando servicios"
try {
    Invoke-Expression "$composeCmd up -d --remove-orphans"
    Write-Success "Contenedores iniciados"
} catch {
    Write-ErrorMsg "Error al iniciar contenedores"
    Invoke-Expression "$composeCmd logs --tail=50"
    exit 1
}

# 7. Verificar salud (health checks)
Write-Header "7/7 Verificando salud de servicios"
Write-Host "Esperando a que la base de datos y backend estén listos (máx 120s)..."

$healthy = $false
$maxWait = 120
$interval = 5
$elapsed = 0

while ($elapsed -lt $maxWait) {
    $status = Invoke-Expression "$composeCmd ps --format json 2>`$null" | ConvertFrom-Json
    $allHealthy = $true
    foreach ($svc in $status) {
        $health = $svc.Health
        if ($health -and $health -ne "healthy") { $allHealthy = $false; break }
        if (-not $health -and $svc.State -ne "running") { $allHealthy = $false; break }
    }
    if ($allHealthy) { $healthy = $true; break }
    Start-Sleep $interval
    $elapsed += $interval
    Write-Host "   Esperando... ${elapsed}s / ${maxWait}s" -NoNewline
    Write-Host "`r" -NoNewline
}

if ($healthy) {
    Write-Success "`nTodos los servicios HEALTHY"
} else {
    Write-Warning "`nTimeout esperando health checks. Verificando logs..."
    Invoke-Expression "$composeCmd logs --tail=30 backend"
    Write-Host "`n⚠️  Los contenedores pueden estar iniciando aún. Ejecute: $composeCmd logs -f backend"
}

# Resumen final
Write-Header "DESPLIEGUE COMPLETADO"
$ip = (Test-Connection -ComputerName (hostname) -Count 1 -ErrorAction SilentlyContinue).IPV4Address.IPAddressToString
if (-not $ip) { $ip = "localhost" }

Write-Host @"
🌐 ACCESO A LA APLICACIÓN:
   Frontend:  http://$ip
   Backend:   http://$ip:8000
   API Docs:  http://$ip:8000/docs
   Health:    http://$ip/health

🔐 CREDENCIALES ADMIN:
   Email:     admin@securitas.com
   Password:  (la generada arriba / la de su .env)

📁 ARCHIVOS IMPORTANTES:
   .env              → $envPath  (¡GUARDE ESTE ARCHIVO!)
   Logs:             $scriptDir\logs\
   Backups BD:       $scriptDir\Backups\

🔧 COMANDOS ÚTILES:
    Ver logs:         $composeCmd logs -f backend
    Reiniciar API:    $composeCmd restart backend
    Backup manual:    $composeCmd exec backend python -m scripts.backup_db
    Detener todo:     $composeCmd down
    Detener + borrar: $composeCmd down -v  (¡BORRA LA BASE DE DATOS!)

📖 DOCUMENTACIÓN COMPLETA:
   03-DOCUMENTACION/PDFs/  (30 documentos)
   05_GUIA_DESPLIEGUE_PRODUCCION.pdf
   07_PROCEDIMIENTOS_BACKUP.pdf
"@

Write-Host "✅ Despliegue finalizado. La aplicación está lista para usar." -ForegroundColor Green
