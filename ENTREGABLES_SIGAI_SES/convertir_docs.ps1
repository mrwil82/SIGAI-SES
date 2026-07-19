$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplatePath = "$env:USERPROFILE\.local\share\pandoc\templates\eisvogel.latex"
if (-not (Test-Path $TemplatePath)) {
    $TemplatePath = Join-Path $ScriptDir "..\Eisvogel-3.5.1\eisvogel.latex"
}
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
    $relPath = [System.IO.Path]::GetRelativePath($ScriptDir, $file)
    Write-Host "---"
    Write-Host "Procesando: $relPath"

    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    $tempFile = Join-Path $TempDir "$($_.Name)"
    $content = Get-Content $file -Raw
    $clean = $content -replace '!\[.*?\]\(https?://img\.shields\.io[^)]*\)', '' -replace '<img[^>]*img\.shields\.io[^>]*>', ''
    Set-Content -Path $tempFile -Value $clean -Encoding UTF8

    $firstLine = Get-Content $tempFile -TotalCount 1
    $titleOpts = @()
    if ($firstLine -ne '---') {
        $title = Select-String -Path $tempFile -Pattern '^#\s+(.+)' | Select-Object -First 1
        if ($title) {
            $t = $title.Matches.Groups[1].Value
            $titleOpts += "-M", "title=$t"
        } else {
            $t = $name -replace '^[0-9]*_', '' -replace '_', ' '
            $titleOpts += "-M", "title=$t"
        }
        Write-Host "  Título: $t"
    }

        $env:MIKTEX_AUTOINSTALL = "0"
    $env:Path = "C:\Program Files\kdenlive\bin;$env:USERPROFILE\AppData\Local;$env:Path"

    $pandocArgs = @(
        $tempFile,
        "-o", "$Output\$name.pdf",
        "--pdf-engine=lualatex",
        "--template=$TemplatePath",
        "-M", "titlepage=true",
        "-M", "titlepage-logo=$LogoPath",
        "-M", "logo-width=40mm",
        "-M", "titlepage-color=0d1a12",
        "-M", "titlepage-text-color=10b981",
        "-M", "titlepage-rule-color=10b981",
        "--metadata-file=$MetaFile",
        "-V", "sansfont=Arial",
        "-V", "monofont=Courier New"
    ) + $titleOpts

    & pandoc $pandocArgs 2>&1 | Select-String -NotMatch "WARNING|rsvg" | ForEach-Object { "$_" }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $name.pdf"
    } else {
        Write-Host "  ✗ Error: $name"
    }
}

Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
Write-Host "---"
Write-Host "Proceso completado. PDFs en: $Output/"
