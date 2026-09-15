# =============================================================================
# SIGAI-SES - Generador Unificado de Documentos Word
# =============================================================================
# Ejecuta todo el proceso de generacion de documentacion Word:
#   1. Renderiza diagramas Mermaid a imagenes PNG
#   2. Genera documentos Word con formato APA profesional (python-docx)
#
# Uso: .\generar_documentos.ps1
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SIGAI-SES - Generador de Documentos Word" -ForegroundColor Cyan
Write-Host "  SES — Seguridad Electrónica" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Renderizar diagramas Mermaid
Write-Host "PASO 1/2: Renderizando diagramas Mermaid..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
& "$ScriptDir\render_mermaid.ps1"
Write-Host ""

# Paso 2: Generar documentos Word con formato APA
Write-Host "PASO 2/2: Generando documentos Word APA..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
& "$ScriptDir\convertir_docs.ps1"
Write-Host ""

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Documentos Word en: Word_Entregables\" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Formato APA incluido:" -ForegroundColor Yellow
Write-Host "    - Portada corporativa SIGAI-SES" -ForegroundColor White
Write-Host "    - Tabla de contenido (actualizar con F9)" -ForegroundColor White
Write-Host "    - Times New Roman 12pt" -ForegroundColor White
Write-Host "    - Interlineado 2.0" -ForegroundColor White
Write-Host "    - Margenes 2.54 cm" -ForegroundColor White
Write-Host "    - Numeracion de paginas" -ForegroundColor White
Write-Host "    - Encabezado con titulo" -ForegroundColor White
Write-Host "    - Tablas con formato profesional" -ForegroundColor White
Write-Host ""
