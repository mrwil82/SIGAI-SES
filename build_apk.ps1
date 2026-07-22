param(
    [switch]$SkipInstall
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendEnv = Join-Path $Root "Frontend" ".env"
$FrontendEnvLocal = Join-Path $Root "Frontend" ".env.local"

Write-Host "=== Build APK (producción → Render) ===" -ForegroundColor Cyan

# 0. Verificar JAVA_HOME
$jdkCandidates = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot",
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.*-hotspot",
    "C:\Program Files\Java\jdk-17*",
    $env:JAVA_HOME
)
$jdkHome = $null
foreach ($candidate in $jdkCandidates) {
    $resolved = Resolve-Path $candidate -ErrorAction SilentlyContinue
    if ($resolved) {
        $javaExe = Join-Path $resolved "bin\java.exe"
        if (Test-Path $javaExe) {
            $jdkHome = $resolved.Path
            break
        }
    }
}
if (-not $jdkHome) {
    Write-Host "ERROR: No se encontró JDK 17. Instálalo desde:" -ForegroundColor Red
    Write-Host "  https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    exit 1
}
$env:JAVA_HOME = $jdkHome
Write-Host "  JAVA_HOME = $jdkHome" -ForegroundColor Green

# 0. Generar iconos desde icon-512.png
Write-Host "[0/5] Generando iconos SIGAI-SES..." -ForegroundColor Yellow
try {
    & "$Root\generate_icons.ps1"
    # Verificar que se generaron los iconos
    $testIcon = "$Root\Frontend\android\app\src\main\res\mipmap-mdpi\ic_launcher.png"
    if (-not (Test-Path $testIcon)) {
        throw "No se generaron los iconos correctamente"
    }
    Write-Host "  ✅ Iconos SIGAI-SES generados" -ForegroundColor Green
} catch {
    Write-Host "ERROR: generate_icons.ps1 falló: $_" -ForegroundColor Red
    exit 1
}

# 1. Asegurar .env con URL de Render
Write-Host "[1/5] Configurando entorno para APK..." -ForegroundColor Yellow
Set-Content $FrontendEnv "VITE_API_BASE_URL=https://sigai-ses-api.onrender.com/api/v1"

# 2. Eliminar .env.local para que no sobrescriba
if (Test-Path $FrontendEnvLocal) {
    Write-Host "  Eliminando .env.local para evitar conflictos" -ForegroundColor Yellow
    Remove-Item $FrontendEnvLocal -Force
}

# 3. Build frontend + Capacitor sync
Write-Host "[2/5] Compilando frontend..." -ForegroundColor Yellow
Push-Location "$Root\Frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "ERROR: npm run build falló" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "[3/5] Sincronizando con Capacitor..." -ForegroundColor Yellow
npx cap copy
npx cap sync
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "ERROR: npx cap sync falló" -ForegroundColor Red
    exit $LASTEXITCODE
}
Pop-Location

# 4. Build APK
Write-Host "[4/5] Compilando APK..." -ForegroundColor Yellow
Push-Location "$Root\Frontend\android"
./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "ERROR: gradlew assembleDebug falló" -ForegroundColor Red
    exit $LASTEXITCODE
}
Pop-Location

Write-Host "[5/5] ¡APK compilado exitosamente!" -ForegroundColor Green
$apk = Get-ChildItem "$Root\Frontend\android\app\build\outputs\apk\debug\*.apk" | Select-Object -First 1
if ($apk) {
    Write-Host "APK: $($apk.FullName)" -ForegroundColor Green
    $size = [math]::Round($apk.Length / 1MB, 1)
    Write-Host "Tamaño: ${size} MB" -ForegroundColor Green
}
