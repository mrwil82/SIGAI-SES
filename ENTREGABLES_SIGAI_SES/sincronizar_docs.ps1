# =============================================================================
# SIGAI-SES - Sincronizar Documentos Editables
# =============================================================================
# Copia los archivos .md editados en DOCS_EDITABLES/ a las carpetas originales
# para que convertir_docs.ps1 pueda generar los PDFs actualizados.
#
# Uso:
#   .\sincronizar_docs.ps1
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceBase = Join-Path $ScriptDir "DOCS_EDITABLES"

if (-not (Test-Path $SourceBase)) {
    throw "No se encontro la carpeta DOCS_EDITABLES en: $SourceBase"
}

Write-Host "=== Sincronizando documentos editables ===" -ForegroundColor Cyan
Write-Host ""

# Mapeo de carpetas: DOCS_EDITABLES -> carpetas originales
$mappings = @(
    @{ Source = "01_DOCUMENTACION_TECNICA"; Dest = "01_DOCUMENTACION_TECNICA" },
    @{ Source = "01_DOCUMENTACION_TECNICA\ARQUITECTURA"; Dest = "01_DOCUMENTACION_TECNICA\ARQUITECTURA" },
    @{ Source = "01_DOCUMENTACION_TECNICA\FAQ"; Dest = "01_DOCUMENTACION_TECNICA\FAQ" },
    @{ Source = "01_DOCUMENTACION_TECNICA\MANUALES"; Dest = "01_DOCUMENTACION_TECNICA\MANUALES" },
    @{ Source = "02_DOCUMENTACION_GESTION"; Dest = "02_DOCUMENTACION_GESTION" },
    @{ Source = "03_DOCUMENTACION_USUARIO"; Dest = "03_DOCUMENTACION_USUARIO" },
    @{ Source = "03_DOCUMENTACION_USUARIO\FAQ"; Dest = "03_DOCUMENTACION_USUARIO\FAQ" },
    @{ Source = "03_DOCUMENTACION_USUARIO\MANUALES"; Dest = "03_DOCUMENTACION_USUARIO\MANUALES" },
    @{ Source = "04_CALIDAD_Y_LEGAL"; Dest = "04_CALIDAD_Y_LEGAL" }
)

# Archivos en la raiz de DOCS_EDITABLES que van a la raiz de ENTREGABLES_SIGAI_SES
$rootFiles = @("ACCESO_CLIENTE.md")

$totalCopied = 0

foreach ($mapping in $mappings) {
    $sourcePath = Join-Path $SourceBase $mapping.Source
    $destPath = Join-Path $ScriptDir $mapping.Dest

    if (Test-Path $sourcePath) {
        Get-ChildItem -Path $sourcePath -Filter "*.md" -File | ForEach-Object {
            $destFile = Join-Path $destPath $_.Name
            Copy-Item -Path $_.FullName -Destination $destFile -Force
            Write-Host "  OK: $($mapping.Dest)\$($_.Name)" -ForegroundColor Green
            $totalCopied++
        }
    }
}

# Copiar archivos de la raiz
foreach ($fileName in $rootFiles) {
    $sourceFile = Join-Path $SourceBase $fileName
    if (Test-Path $sourceFile) {
        $destFile = Join-Path $ScriptDir $fileName
        Copy-Item -Path $sourceFile -Destination $destFile -Force
        Write-Host "  OK: $fileName" -ForegroundColor Green
        $totalCopied++
    }
}

Write-Host ""
Write-Host "=== Sincronizacion completada: $totalCopied archivos copiados ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta .\convertir_docs.ps1 para generar los PDFs actualizados." -ForegroundColor Yellow
