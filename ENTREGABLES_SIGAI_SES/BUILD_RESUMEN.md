# Build Outputs — SIGAI-SES

> [!TIP]
> Cada build se genera desde su respectivo entorno de desarrollo. Los ejecutables **no se suben a GitHub** (estan en `.gitignore`). Se generan localmente para entrega al cliente.

---

## APK Android (Capacitor 7)

| Dato | Valor |
|------|-------|
| **Ruta** | `Frontend/android/app/build/outputs/apk/debug/app-debug.apk` |
| **Tamaño** | ~4.4 MB |
| **Version minima** | Android 8.0+ (API 26) |
| **Comando** | `npm run cap:apk` (desde `Frontend/`) |
| **Requisito** | Android SDK, Gradle |

## EXE Windows (Portable)

| Dato | Valor |
|------|-------|
| **Ruta** | `Backend/dist/SIGAI-SES.exe` |
| **Tamaño** | ~67 MB |
| **Compatibilidad** | Windows 10/11 |
| **Comando** | `pyinstaller backend.spec` (desde `Backend/`) |
| **Nota** | Incluye Python, FastAPI, y todas las dependencias empaquetadas |

## Instalador Windows (Setup)

| Dato | Valor |
|------|-------|
| **Ruta** | `dist_installer/SIGAI-SES-Setup-1.0.0.exe` |
| **Compatible** | Windows 10/11, 64-bit |
| **Herramienta** | Inno Setup Compiler |
| **Script** | `dist_installer/setup.iss` |

---

## Deploy en Render (Backend)

| Dato | Valor |
|------|-------|
| **URL Produccion** | `https://sigai-ses-api.onrender.com` |
| **Swagger UI** | `https://sigai-ses-api.onrender.com/docs` |
| **Metodo** | Auto-deploy desde `git push` a `main` |
| **Plan** | Gratuito (750h/mes, 512 MB RAM) |

### Variables de entorno en Render

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres.oiyhzbgnhmlrrgxokulu:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres` |
| `DATABASE_URL_SYNC` | `postgresql://postgres.oiyhzbgnhmlrrgxokulu:Sigaises2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres` |
| `SECRET_KEY` | `clave_secreta_super_segura_123` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` |
| `ADMIN_EMAIL` | `admin@securitas.com` |
| `ADMIN_PASSWORD` | `Admin123!` |
| `ADMIN_NAME` | `Administrador SIGAI` |
| `ADMIN_CEDULA` | `0000000000` |
| `ADMIN_CODIGO` | `ADM001` |

---

## CI Pipeline (GitHub Actions)

| Workflow | Estado | Ultima ejecución |
|----------|--------|-----------------|
| **backend-tests** (32 tests) | ✅ Passing | `f603b46` |
| **frontend-lint** (ESLint) | ✅ Passing | `f603b46` |

URL: [https://github.com/mrwil82/SIGAI-SES/actions](https://github.com/mrwil82/SIGAI-SES/actions)
