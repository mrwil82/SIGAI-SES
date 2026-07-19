#!/usr/bin/env python3
"""Agrega YAML front matter a archivos .md que no tengan uno."""
import os
import re
import glob

BASE = os.path.dirname(os.path.abspath(__file__))

IGNORE_DIRS = {"PDF_Entregables", "images", "node_modules", ".git"}
EXCLUDE_FILES = {"README.md", "CHANGELOG.md", "ACCESO_CLIENTE.md", "GUIA_ENTREGA_PROFESIONAL.md"}

def generate_title(filename):
    """Genera un título legible a partir del nombre del archivo."""
    name = filename.replace(".md", "")
    name = re.sub(r'^[0-9]+_', '', name)
    name = name.replace('_', ' ').replace('-', ' ')
    return name.strip().title()

for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
    for file in files:
        if not file.endswith(".md"):
            continue
        if file in EXCLUDE_FILES:
            continue
        fpath = os.path.join(root, file)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        if content.startswith("---"):
            continue

        title = generate_title(file)
        first_h1 = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        if first_h1:
            title = first_h1.group(1).strip()

        front = f"---\ntitle: \"{title}\"\n---\n\n"
        new_content = front + content
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"✓ {os.path.relpath(fpath, BASE)}")

print("Front matter agregado a todos los archivos.")
