#!/bin/bash
# Script para convertir documentos .md a PDF con logo y portada profesional
# Usa Pandoc + Eisvogel template

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_DIR="$HOME/.local/share/pandoc/templates"
if [ ! -f "$TEMPLATE_DIR/eisvogel.latex" ]; then
  TEMPLATE_DIR="$SCRIPT_DIR/../Eisvogel-3.5.1"
fi

LOGO_PATH="$SCRIPT_DIR/images/logo.pdf"
META_FILE="$SCRIPT_DIR/images/metadata.yaml"
TEMP_DIR="$SCRIPT_DIR/tmp_md"

OUTPUT="PDF_Entregables"
mkdir -p "$OUTPUT"

# Limpiar temp previo
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Función para sanitizar .md: remover badges SVG que requieren rsvg-convert
sanitize_md() {
    local src="$1" dst="$2"
    sed -E 's|<img[^>]*img\.shields\.io[^>]*>||g' "$src" > "$dst"
}

find . -name "*.md" \
  -not -path "./PDF_Entregables/*" \
  -not -path "./images/*" \
  -not -path "./tmp_md/*" \
  -not -path "./node_modules/*" | while read file; do

    name=$(basename "$file" .md)
    echo "---"
    echo "Procesando: $name"

    # Sanitizar (remover shields.io badges)
    sanitize_md "$file" "$TEMP_DIR/$name.md"

    # Chequear si ya tiene YAML front matter
    first=$(head -1 "$file")
    if [ "$first" = "---" ]; then
        echo "  (usa YAML propio)"
        TITLE_OPTS=""
    else
        title=$(head -30 "$file" | grep -E '^#[[:space:]]+' | head -1 | sed 's/^# *//')
        if [ -z "$title" ]; then
            title="$(echo "$name" | sed 's/^[0-9]*_//; s/_/ /g')"
        fi
        TITLE_OPTS="-M title=\"$title\""
        echo "  Título: $title"
    fi

    eval pandoc "$TEMP_DIR/$name.md" \
      -o "$OUTPUT/$name.pdf" \
      --pdf-engine=lualatex \
      --template="$TEMPLATE_DIR/eisvogel.latex" \
      $TITLE_OPTS \
      --metadata-file="$META_FILE" \
      -V 'sansfont:Arial' \
      -V 'monofont:Courier New'

    if [ $? -eq 0 ]; then
        echo "  ✓ $name.pdf"
    else
        echo "  ✗ Error: $name"
    fi
done

# Limpiar temporales
rm -rf "$TEMP_DIR"

echo "---"
echo "Proceso completado. PDFs en: $OUTPUT/"
