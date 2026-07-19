<p align="center">
  <img src="https://img.shields.io/badge/Guia-Entrega%20Profesional-0055A4?style=for-the-badge&logo=readthedocs" alt="Guia">
  <img src="https://img.shields.io/badge/Formato-Markdown%20to%20PDF-success?style=for-the-badge&logo=markdown" alt="Formato">
  <img src="https://img.shields.io/badge/Herramienta-Pandoc%20+%20LaTeX-blue?style=for-the-badge&logo=latex" alt="Pandoc">
  <img src="https://img.shields.io/badge/Julio-2026-FF6B35?style=for-the-badge&logo=calendar" alt="Fecha">
</p>

<h1 align="center">
  GUIA PARA FORMATEAR Y ENTREGAR LOS DOCUMENTOS
</h1>

<p align="center">
  <b>Transforma tu documentacion Markdown en entregables profesionales</b><br>
  <i>SIGAI-SES - Securitas Colombia S.A.</i>
</p>

---

> [!TIP]
> **Recomendacion:** Usa **Pandoc + LaTeX** (Opcion 1) para obtener los resultados mas profesionales con encabezados, pies de pagina, colores corporativos y tabla de contenidos automatica.

---

## OPCION 1: Convertir Markdown a PDF profesional (Recomendado)

### Instalacion de Pandoc

<details open>
<summary><b>Instalacion por sistema operativo</b></summary>

| Sistema | Comando |
|---|---|
| **Windows** (Chocolatey) | `choco install pandoc` |
| **Windows** (Scoop) | `scoop install pandoc` |
| **macOS** (Homebrew) | `brew install pandoc` |
| **Linux** (Debian/Ubuntu) | `sudo apt install pandoc` |
| **Linux** (Fedora) | `sudo dnf install pandoc` |

</details>

### Instalacion de plantilla LaTeX profesional

```bash
# Descargar plantilla eisvogel (la mas profesional para documentacion tecnica)
# Repositorio: https://github.com/Wandmalfarbe/pandoc-latex-template

# Opcion rapida: descargar directamente
wget https://raw.githubusercontent.com/Wandmalfarbe/pandoc-latex-template/master/eisvogel.tex

# O instalar globalmente
mkdir -p ~/.local/share/pandoc/templates/
mv eisvogel.tex ~/.local/share/pandoc/templates/
```

### Convertir un documento individual

```bash
pandoc "01_ESPECIFICACION_REQUISITOS.md" \
  -o "01_ESPECIFICACION_REQUISITOS.pdf" \
  --pdf-engine=xelatex \
  --template=eisvogel \
  --variable=mainfont:"Segoe UI" \
  --variable=geometry:margin=2.5cm \
  --variable=colorlinks:blue
```

---

## Script automatico para TODOS los documentos

> [!NOTE]
> Guarda el siguiente script como `convertir_docs.sh` y ejecutalo desde la raiz de `ENTREGABLES_SIGAI_SES/`.

```bash
#!/bin/bash
# ============================================
# Script automatico de conversion masiva
# SIGAI-SES a PDF Profesional
# ============================================

OUTPUT="PDF_Entregables"
mkdir -p "$OUTPUT"

echo "[INFO] Iniciando conversion de todos los documentos..."
echo ""

count=0
total=$(find . -name "*.md" -not -path "./PDF_Entregables/*" | wc -l)

find . -name "*.md" -not -path "./PDF_Entregables/*" | while read file; do
    count=$((count + 1))
    name=$(basename "$file" .md)
    echo "[$count/$total] Convirtiendo: $name..."
    pandoc "$file" \
      -o "$OUTPUT/$name.pdf" \
      --pdf-engine=xelatex \
      --template=eisvogel \
      --variable=mainfont:"Segoe UI" \
      --variable=sansfont:"Segoe UI" \
      --variable=monofont:"Consolas" \
      --variable=colorlinks:blue \
      2>/dev/null

    if [ $? -eq 0 ]; then
        echo "   [OK] Convertido exitosamente"
    else
        echo "   [ERROR] Error en la conversion"
    fi
done

echo ""
echo "[INFO] Conversion completada. PDFs generados en: $OUTPUT/"
echo "[INFO] Total: $total documentos convertidos"
```

---

## OPCION 2: Herramientas online (Sin instalacion)

> [!WARNING]
> Las herramientas online **no soportan** diagramas Mermaid ni plantillas personalizadas. Usalas solo para documentos simples.

| Herramienta | URL | Gratis | Caracteristicas |
|---|---|---|---|
| **Markdown Nice** | [markdownnice.com](https://markdownnice.com) | Si | Temas modernos, preview en vivo |
| **Dillinger** | [dillinger.io](https://dillinger.io) | Si | Editor online, multiples formatos |
| **MD2PDF** | [md2pdf.netlify.app](https://md2pdf.netlify.app) | Si | Simple y rapido |
| **HackMD** | [hackmd.io](https://hackmd.io) | Si | Colaborativo, exporta a PDF |

**Proceso rapido:**
1. Copia el contenido del archivo `.md`
2. Pega en la herramienta
3. Ajusta el tema si es necesario
4. Exporta / descarga como PDF

---

## OPCION 3: Visual Studio Code (Escritorio)

> [!TIP]
> **Recomendado** si ya usas VS Code. No necesitas instalar nada adicional.

**Pasos:**
1. Instala la extension **Markdown PDF** en VS Code
2. Abre el archivo `.md`
3. `Ctrl+Shift+P` y busca "Markdown PDF: Export (pdf)"
4. Se genera el PDF automaticamente en la misma carpeta

---

## OPCION 4: Generar HTML profesional

```bash
# Convertir a HTML auto-contenido con estilos personalizados
pandoc "documento.md" \
  -o "documento.html" \
  --standalone \
  --self-contained \
  --css=estilo.css \
  --metadata title="SIGAI-SES - Documento"
```

> [!NOTE]
> Ideal para compartir por web o intranet corporativa.

---

## OPCION 5: Documento compilado unico (PDF Maestro)

### Crear un unico PDF con TODA la documentacion

```bash
pandoc README.md \
  01_DOCUMENTACION_TECNICA/00_README_TECNICO.md \
  01_DOCUMENTACION_TECNICA/02_GUIA_INSTALACION_BACKEND.md \
  01_DOCUMENTACION_TECNICA/03_GUIA_INSTALACION_FRONTEND.md \
  01_DOCUMENTACION_TECNICA/04_DICCIONARIO_DE_DATOS.md \
  01_DOCUMENTACION_TECNICA/05_GUIA_DESPLIEGUE_PRODUCCION.md \
  02_DOCUMENTACION_GESTION/01_ESPECIFICACION_REQUISITOS.md \
  02_DOCUMENTACION_GESTION/02_ESTADO_FINAL_PROYECTO.md \
  03_DOCUMENTACION_USUARIO/MANUALES/01_MANUAL_USUARIO_TECNICO.md \
  03_DOCUMENTACION_USUARIO/MANUALES/02_MANUAL_ADMINISTRADOR.md \
  04_CALIDAD_Y_LEGAL/01_PLAN_DE_PRUEBAS.md \
  04_CALIDAD_Y_LEGAL/02_INFORME_SEGURIDAD.md \
  04_CALIDAD_Y_LEGAL/03_AVISO_DE_PRIVACIDAD.md \
  -o "SIGAI-SES_Documentacion_Completa.pdf" \
  --pdf-engine=xelatex \
  --template=eisvogel \
  --variable=geometry:margin=2cm \
  --toc
```

> [!TIP]
> Esto genera un **unico PDF** con tabla de contenido automatica y todas las secciones numeradas. Perfecto para impresion o envio por correo.

---

## OPCION 6: Entrega profesional via GitHub/GitLab

> [!SUCCESS]
> Si el cliente tiene acceso a un repositorio, esta es la opcion mas profesional y moderna.

1. Crea un repositorio **privado**
2. Sube la carpeta `ENTREGABLES_SIGAI_SES`
3. GitHub renderiza automaticamente los `.md` con formato bonito
4. Los diagramas Mermaid se renderizan solos
5. Puedes exportar a PDF desde la interfaz de GitHub
6. El historial de commits sirve como auditoria de cambios

---

## RECOMENDACIONES PARA QUE SE VEA PROFESIONAL

### 1. Portada
Crea una portada para cada PDF con:
- Logo de Securitas
- **Nombre del proyecto:** SIGAI-SES
- **Titulo del documento**
- **Version y fecha**
- **Clasificacion:** `CONFIDENCIAL`

### 2. Encabezados y pies de pagina

```latex
--variable=header-includes:'
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{SIGAI-SES}
\fancyhead[R]{v1.0.0}
\fancyfoot[C]{\thepage}
\fancyfoot[R]{Confidencial - Securitas Colombia}
'
```

### 3. Colores corporativos

```latex
--variable=colorlinks:blue \
--variable=linkcolor:blue \
--variable=urlcolor:blue
```

### 4. Fuentes profesionales

```latex
--variable=mainfont:"Segoe UI" \
--variable=sansfont:"Segoe UI" \
--variable=monofont:"Consolas"
```

### 5. Organizacion de archivos para entregar

<details>
<summary><b>Click para ver la estructura de entrega recomendada</b></summary>

```
SIGAI-SES_Entrega_Final/
├── 00_PORTADA.pdf                    # Portada general
├── 01_Documentacion_Tecnica/
│   ├── 01_Arquitectura_Sistema.pdf
│   ├── 02_Instalacion_Backend.pdf
│   ├── 03_Instalacion_Frontend.pdf
│   ├── 04_Diccionario_Datos.pdf
│   ├── 05_Despliegue_Produccion.pdf
│   ├── 06_API_Spec.pdf
│   ├── 07_FAQ_Tecnica.pdf
│   └── 08_Manual_Tecnico.pdf
├── 02_Documentacion_Gestion/
│   ├── 01_Especificacion_Requisitos.pdf
│   ├── 02_Estado_Final_Proyecto.pdf
│   └── 03_Acta_de_Entrega.pdf
├── 03_Documentacion_Usuario/
│   ├── 01_Manual_Usuario_Tecnico.pdf
│   ├── 02_Manual_Administrador.pdf
│   └── 03_FAQ_Usuario.pdf
├── 04_Calidad_y_Legal/
│   ├── 01_Plan_de_Pruebas.pdf
│   ├── 02_Informe_Seguridad.pdf
│   ├── 03_Aviso_de_Privacidad.pdf
│   └── 04_Politicas_de_Calidad.pdf
├── 05_Codigo_Fuente/               # USB o enlace
│   ├── Backend/
│   └── Frontend/
└── README.txt                       # Instrucciones de acceso
```

</details>

---

## CHECKLIST ANTES DE ENTREGAR

| # | Item | Estado |
|---|---|---|
| 1 | Todos los PDF generados correctamente | `[ ]` |
| 2 | Portada incluida en cada documento | `[ ]` |
| 3 | Numeros de pagina visibles | `[ ]` |
| 4 | Tabla de contenido funcional | `[ ]` |
| 5 | Diagramas Mermaid renderizados | `[ ]` |
| 6 | Codigo fuente incluido (USB o enlace) | `[ ]` |
| 7 | Credenciales de prueba en documento seguro | `[ ]` |
| 8 | Acta de entrega firmada | `[ ]` |
| 9 | USB/Disco con copia de seguridad | `[ ]` |
| 10 | Revision de ortografia y formato | `[ ]` |
| 11 | Documentos marcados como CONFIDENCIAL | `[ ]` |

---

## COMANDO RAPIDO PARA GENERAR TODO

<details>
<summary><b>Click para ver el script completo</b></summary>

```bash
#!/bin/bash
# ============================================
# GENERAR ENTREGA PROFESIONAL - SIGAI-SES
# ============================================

echo "[INFO] Generando entrega profesional SIGAI-SES..."
echo ""

# Crear estructura de entrega
echo "[INFO] Creando estructura de carpetas..."
mkdir -p SIGAI-SES_Entrega
cd SIGAI-SES_Entrega

# Copiar fuente
echo "[INFO] Copiando codigo fuente..."
cp -r ../Proyecto_SES/Backend .
cp -r ../Proyecto_SES/Frontend .
cp -r ../Proyecto_SES/ENTREGABLES_SIGAI_SES .

# Generar PDFs
echo "[INFO] Generando PDFs desde Markdown..."
cd ENTREGABLES_SIGAI_SES
mkdir -p PDF_Entregables

for file in $(find . -name "*.md" -not -path "./PDF_Entregables/*"); do
    name=$(basename "$file" .md)
    echo "   [INFO] $name.pdf"
    pandoc "$file" \
      -o "PDF_Entregables/$name.pdf" \
      --pdf-engine=xelatex \
      --template=eisvogel \
      --variable=mainfont:"Segoe UI" \
      --variable=colorlinks:blue
done

echo ""
echo "[INFO] Entrega generada exitosamente en: SIGAI-SES_Entrega/"
echo "[INFO] Total PDFs: $(ls PDF_Entregables/*.pdf | wc -l)"
```

</details>

---

<p align="center">
  <img src="https://img.shields.io/badge/Ultima%20actualizacion-Julio%202026-0055A4?style=for-the-badge" alt="Actualizacion">
  <img src="https://img.shields.io/badge/SIGAI--SES-Securitas%20Colombia-success?style=for-the-badge" alt="SIGAI-SES">
</p>

<p align="center">
  <i>Wilson Ortiz - Pasante SENA - Julio 2026</i>
</p>
