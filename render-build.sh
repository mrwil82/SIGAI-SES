#!/usr/bin/env bash
set -e

echo "=== Instalando dependencias Python ==="
pip install -r Backend/requirements.txt

echo "=== Compilando Frontend ==="
cd Frontend
npm install
npm run build
cd ..

echo "=== Copiando Frontend al Backend ==="
rm -rf Backend/app/static/web
cp -r Frontend/dist Backend/app/static/web

echo "=== Build completo ==="
