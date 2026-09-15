# DOCS_EDITABLES - Documentos Editables SIGAI-SES

Esta carpeta contiene todos los documentos `.md` del proyecto organizados para facilitar su edición.

## Estructura

```
DOCS_EDITABLES/
├── 01_DOCUMENTACION_TECNICA/     # Documentación para equipo de desarrollo
│   ├── 00_README_TECNICO.md
│   ├── 00_TOC.md
│   ├── 02_GUIA_INSTALACION_BACKEND.md
│   ├── 03_GUIA_INSTALACION_FRONTEND.md
│   ├── 04_DICCIONARIO_DE_DATOS.md
│   ├── 05_GUIA_DESPLIEGUE_PRODUCCION.md
│   ├── 06_GUIA_ON_PREMISE.md
│   ├── 07_PROCEDIMIENTOS_BACKUP.md
│   ├── 08_CATALOGO_ERRORES_API.md
│   ├── 09_GUIA_MIGRACION_DATOS.md
│   ├── 10_PLAN_CAPACITACION.md
│   ├── 11_GESTION_ALERTAS.md
│   ├── ARQUITECTURA/
│   │   ├── 01_ARQUITECTURA_SISTEMA.md
│   │   └── 02_DIAGRAMAS_FLUJO_Y_PROCESOS.md
│   ├── FAQ/
│   │   └── 01_FAQ_TECNICA.md
│   └── MANUALES/
│       └── 01_MANUAL_TECNICO.md
│
├── 02_DOCUMENTACION_GESTION/     # Documentación de gestión del proyecto
│   ├── 00_PROPUESTA_TECNICA.md
│   ├── 01_ESPECIFICACION_REQUISITOS.md
│   └── 02_ESTADO_FINAL_PROYECTO.md
│
├── 03_DOCUMENTACION_USUARIO/     # Documentación para usuarios finales
│   ├── 01_HISTORIAS_USUARIO.md
│   ├── FAQ/
│   │   └── 01_FAQ_USUARIO.md
│   └── MANUALES/
│       ├── 01_MANUAL_USUARIO_TECNICO.md
│       └── 02_MANUAL_ADMINISTRADOR.md
│
└── 04_CALIDAD_Y_LEGAL/           # Documentos de calidad y legales
    ├── 01_PLAN_DE_PRUEBAS.md
    ├── 02_INFORME_SEGURIDAD.md
    ├── 03_AVISO_DE_PRIVACIDAD.md
    └── POLITICAS_DE_CALIDAD.md
```

## Flujo de Trabajo

### 1. Editar documentos
Edita cualquier archivo `.md` en esta carpeta con tu editor favorito (VS Code, Notepad++, etc.)

### 2. Sincronizar cambios
Después de editar, ejecuta el script para copiar los cambios a las carpetas originales:

```powershell
.\sincronizar_docs.ps1
```

### 3. Generar PDFs
Ejecuta el script de conversión para generar los PDFs actualizados:

```powershell
.\convertir_docs.ps1
```

## Notas

- Los archivos en esta carpeta son la **fuente primaria** para edición
- Los PDFs generados están en `PDF_Entregables/`
- Los originales en `01_DOCUMENTACION_TECNICA/`, `02_DOCUMENTACION_GESTION/`, etc. se actualizan con el script de sincronización
