# =============================================================================
# SIGAI-SES - Renderizar Diagramas Mermaid
# =============================================================================
# Convierte bloques de codigo Mermaid en imagenes PNG para insertar en Word
# Requiere: npm install -g @mermaid-js/mermaid-cli
#
# Uso:
#   .\render_mermaid.ps1
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Renderizando diagramas Mermaid ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si mmdc esta instalado
$mmdcPath = $null
$possiblePaths = @(
    "mmdc",
    "npx mmdc",
    "$env:APPDATA\npm\mmdc.cmd",
    "$env:LOCALAPPDATA\npm\mmdc.cmd"
)

foreach ($cmd in $possiblePaths) {
    try {
        $result = & cmd /c "$cmd --version" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $mmdcPath = $cmd
            break
        }
    } catch {}
}

if (-not $mmdcPath) {
    Write-Host "ADVERTENCIA: mmdc (Mermaid CLI) no encontrado" -ForegroundColor Yellow
    Write-Host "Instala con: npm install -g @mermaid-js/mermaid-cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Los diagramas Mermaid quedaran como codigo fuente en los documentos Word" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "Mermaid CLI encontrado: $mmdcPath" -ForegroundColor Green
Write-Host ""

$mdFiles = Get-ChildItem -Path $ScriptDir -Recurse -Filter "*.md" | Where-Object {
    $_.FullName -notlike "*\Word_Entregables\*" -and
    $_.FullName -notlike "*\PDF_Entregables\*" -and
    $_.FullName -notlike "*\images\*" -and
    $_.FullName -notlike "*\tmp_md\*" -and
    $_.FullName -notlike "*\DOCS_EDITABLES\*"
}

$totalRendered = 0
$totalErrors = 0

foreach ($mdFile in $mdFiles) {
    $content = [System.IO.File]::ReadAllText($mdFile.FullName, [System.Text.Encoding]::UTF8)

    # Buscar bloques Mermaid
    $pattern = '```mermaid\r?\n(.*?)```'
    $matches = [regex]::Matches($content, $pattern, 'Singleline')

    if ($matches.Count -gt 0) {
        Write-Host "Procesando: $($mdFile.Name) ($($matches.Count) diagramas)" -ForegroundColor Yellow

        $fileDir = $mdFile.DirectoryName
        $imagesDir = Join-Path $fileDir "images"
        New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null

        $counter = 1
        foreach ($match in $matches) {
            $mermaidCode = $match.Groups[1].Value.Trim()
            $mmdFile = Join-Path $imagesDir "$($mdFile.BaseName)_diagram_$counter.mmd"
            $pngFile = Join-Path $imagesDir "$($mdFile.BaseName)_diagram_$counter.png"

            # Guardar codigo Mermaid
            [System.IO.File]::WriteAllText($mmdFile, $mermaidCode, [System.Text.Encoding]::UTF8)

            Write-Host "  Diagrama $counter..." -NoNewline

            # Renderizar a PNG
            $output = & cmd /c "$mmdcPath -i `"$mmdFile`" -o `"$pngFile`" -w 1200 -b white 2>&1"

            if (Test-Path $pngFile) {
                Write-Host " OK" -ForegroundColor Green
                $totalRendered++

                # Reemplazar bloque Mermaid con imagen en el contenido
                $imageMd = "`n![Diagrama](images/$($mdFile.BaseName)_diagram_$counter.png)`n"
                $content = $content.Replace($match.Value, $imageMd)
            } else {
                Write-Host " ERROR" -ForegroundColor Red
                $totalErrors++

                # Mostrar error del primer diagrama que falla para depurar
                if ($totalErrors -eq 1) {
                    Write-Host "    Codigo Mermaid con error:" -ForegroundColor Red
                    Write-Host "    ---" -ForegroundColor Gray
                    $lines = $mermaidCode -split "`n"
                    $lineNum = 0
                    foreach ($line in $lines) {
                        $lineNum++
                        if ($lineNum -le 10) {
                            Write-Host "    $lineNum`: $line" -ForegroundColor Gray
                        }
                    }
                    if ($lines.Count -gt 10) {
                        Write-Host "    ... (mas lineas)" -ForegroundColor Gray
                    }
                    Write-Host "    ---" -ForegroundColor Gray
                }
            }

            $counter++
        }

        # Guardar contenido actualizado en el archivo ORIGINAL
        [System.IO.File]::WriteAllText($mdFile.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}

Write-Host ""
Write-Host "=== Resultado ===" -ForegroundColor Cyan
Write-Host "Diagramas renderizados: $totalRendered" -ForegroundColor Green
if ($totalErrors -gt 0) {
    Write-Host "Errores: $totalErrors" -ForegroundColor Red
    Write-Host ""
    Write-Host "Los diagramas con error quedaron como codigo fuente" -ForegroundColor Yellow
}
