Add-Type -AssemblyName System.Drawing

$src = "Frontend\public\icon-512.png"
$resDir = "Frontend\android\app\src\main\res"

$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$img = [System.Drawing.Image]::FromFile((Get-Item $src).FullName)

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $path = Join-Path $resDir $folder
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()

    $bmp.Save((Join-Path $path "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $path "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $path "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Generados icons para $folder ($size`x$size)"
}

$img.Dispose()

$bgColor = "#0A0F0D"
$bgPath = Join-Path $resDir "values\ic_launcher_background.xml"
Set-Content -Path $bgPath -Value "<?xml version=`"1.0`" encoding=`"utf-8`"?>
<resources>
    <color name=`"ic_launcher_background`">$bgColor</color>
</resources>"

Write-Host "`nIcons generados correctamente."
