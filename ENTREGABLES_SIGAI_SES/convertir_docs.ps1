# =============================================================================
# SIGAI-SES - Convertir Markdown → Word (APA Profesional)
# =============================================================================
# Genera documentos .docx con formato APA profesional usando python-docx
# Incluye portada, tabla de contenido, formato Times New Roman, interlineado 2.0
#
# Requiere: python, python-docx
# Uso: .\convertir_docs.ps1
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonScript = Join-Path $ScriptDir "generar_word_apa.py"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SIGAI-SES - Generador Word APA" -ForegroundColor Cyan
Write-Host "  SES — Seguridad Electrónica" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python no encontrado" -ForegroundColor Red
    Write-Host "Instala Python desde https://python.org" -ForegroundColor Yellow
    exit 1
}

# Verificar python-docx
try {
    & python -c "import docx; print('python-docx: OK')" 2>&1 | Out-Null
} catch {
    Write-Host "Instalando python-docx..." -ForegroundColor Yellow
    & pip install python-docx 2>&1 | Out-Null
}

# Ejecutar generador
Write-Host ""
& python $PythonScript

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Archivos Word en: Word_Entregables\" -ForegroundColor Cyan
Write-Host ""
Write-Host "  NOTAS:" -ForegroundColor Yellow
Write-Host "  - Para actualizar tablas de contenido:" -ForegroundColor White
Write-Host "    Abrir Word → Ctrl+A → F9" -ForegroundColor White
Write-Host "  - Los diagramas Mermaid quedan como codigo" -ForegroundColor White
Write-Host "    Fuente (usar mermaid.live para renderizar)" -ForegroundColor White
Write-Host ""
