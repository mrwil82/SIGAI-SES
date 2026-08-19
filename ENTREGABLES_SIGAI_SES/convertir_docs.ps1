$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$MiktexBin = "$env:LOCALAPPDATA\Programs\MiKTeX\miktex\bin\x64"
if (Test-Path $MiktexBin) { $env:Path = "$MiktexBin;" + $env:Path }

$TemplatePath = "$env:APPDATA\pandoc\templates\eisvogel.latex"
if (-not (Test-Path $TemplatePath)) {
    $TemplatePath = Join-Path $ScriptDir "..\Eisvogel-3.5.1\eisvogel.latex"
}
if (-not (Test-Path $TemplatePath)) { throw "Plantilla eisvogel no encontrada en: $TemplatePath" }

$LogoPath = (Join-Path $ScriptDir "images/logo.pdf") -replace '\\', '/'
$MetaFile = Join-Path $ScriptDir "images\metadata.yaml"
$TempDir = Join-Path $ScriptDir "tmp_md"
$Output = Join-Path $ScriptDir "PDF_Entregables"

New-Item -ItemType Directory -Path $Output -Force | Out-Null

Get-ChildItem -Path $ScriptDir -Recurse -Filter "*.md" | Where-Object {
    $_.FullName -notlike "*\PDF_Entregables\*" -and
    $_.FullName -notlike "*\images\*" -and
    $_.FullName -notlike "*\tmp_md\*"
} | ForEach-Object {
    $file = $_.FullName
    $name = $_.BaseName
    $relPath = $file.Substring($ScriptDir.Length).TrimStart('\', '/')
    Write-Host "---"
    Write-Host "Procesando: $relPath"

    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    $tempFile = Join-Path $TempDir "$($_.Name)"
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText($tempFile, $content, (New-Object System.Text.UTF8Encoding($false)))

    $titleOpts = @()
    $firstLine = ($content -split "`n" | Select-Object -First 1).Trim()
    if ($firstLine -ne '---') {
        $m = [regex]::Match($content, '(?m)^#\s+(.+?)\s*$')
        if ($m.Success) {
            $t = $m.Groups[1].Value
            $titleOpts += "-M", "title=$t"
        } else {
            $t = $name -replace '^[0-9]*_', '' -replace '_', ' '
            $titleOpts += "-M", "title=$t"
        }
        Write-Host "  Titulo: $t"
    }

    $pandocArgs = @(
        $tempFile,
        "-o", "$Output\$name.pdf",
        "--pdf-engine=xelatex",
        "--template=$TemplatePath",
        "-M", "titlepage=true",
        "-M", "titlepage-logo=$LogoPath",
        "-M", "logo-width=40mm",
        "-M", "titlepage-color=0055A4",
        "-M", "titlepage-text-color=FFFFFF",
        "-M", "titlepage-rule-color=FF6B35",
        "--metadata-file=$MetaFile",
        "-V", "sansfont=Segoe UI",
        "-V", "monofont=Consolas"
    ) + $titleOpts

    & pandoc $pandocArgs 2>&1 | Select-String -NotMatch "WARNING|rsvg|major issue|MiKTeX updates|log4cxx|No appender" | ForEach-Object { "$_" }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK $name.pdf"
    } else {
        Write-Host "  ERROR: $name"
    }
}

Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
Write-Host "=== Fin. PDFs en: $Output ==="