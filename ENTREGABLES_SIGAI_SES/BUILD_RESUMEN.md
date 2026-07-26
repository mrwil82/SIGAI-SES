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

## Despliegue en Servidor

| Dato | Valor |
|------|-------|
| **Documentacion** | Ver `05_GUIA_DESPLIEGUE_PRODUCCION.md` |
| **Metodo** | Auto-deploy desde `git push` a `main` segun configuracion |

### Variables de entorno requeridas

| Variable | Descripcion |
|----------|-------------|
| `DATABASE_URL` | Conexion asincrona a la BD |
| `DATABASE_URL_SYNC` | Conexion sincrona a la BD |
| `SECRET_KEY` | Clave secreta JWT |
| `ALGORITHM` | Algoritmo JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de expiracion |
| `ADMIN_EMAIL` | Email del admin inicial |
| `ADMIN_PASSWORD` | Password del admin inicial |

---

## CI Pipeline (GitHub Actions)

| Workflow | Estado | Ultima ejecución |
|----------|--------|-----------------|
| **backend-tests** (32 tests) | ✅ Passing | `f603b46` |
| **frontend-lint** (ESLint) | ✅ Passing | `f603b46` |

URL: [https://github.com/mrwil82/SIGAI-SES/actions](https://github.com/mrwil82/SIGAI-SES/actions)
