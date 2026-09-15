# =============================================================================
# SIGAI-SES - Generar Documentos Word Completos
# =============================================================================
# Ejecuta todo el proceso:
#   1. Renderiza diagramas Mermaid a imagenes PNG
#   2. Convierte archivos .md a .docx
#
# Uso:
#   .\generar_word.ps1
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SIGAI-SELL - Generador de Documentos Word" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Renderizar Mermaid
Write-Host "PASO 1: Renderizando diagramas Mermaid..." -ForegroundColor Yellow
& "$ScriptDir\render_mermaid.ps1"
Write-Host ""

# Paso 2: Convertir a Word
Write-Host "PASO 2: Convirtiendo Markdown a Word..." -ForegroundColor Yellow
& "$ScriptDir\convertir_docs.ps1"
Write-Host ""

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos Word en: Word_Entregables\" -ForegroundColor Cyan
