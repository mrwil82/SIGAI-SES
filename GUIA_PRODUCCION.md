# Guía de Producción — SIGAI-SES

## Índice

1. [Base de datos en Supabase (PostgreSQL gratuito)](#1-base-de-datos-en-supabase)
2. [Configurar el backend para producción](#2-configurar-el-backend)
3. [PWA — App instalable en móvil](#3-pwa-app-instalable-en-móvil)
4. [Generar .exe único (con acceso directo en escritorio)](#4-generar-exe-único-con-acceso-directo-en-escritorio)
5. [APK — App nativa Android (Capacitor)](#5-apk--app-nativa-android-capacitor)
6. [Arquitectura del proyecto](#6-arquitectura)
7. [Solución de problemas](#7-solución-de-problemas)

---

## 1. Base de datos en Supabase

Supabase te da una base de datos **PostgreSQL gratuita** con 500 MB de almacenamiento, accesible desde cualquier lugar.

### 1.1 Crear el proyecto

1. Ve a [https://supabase.com](https://supabase.com) y regístrate
2. Haz clic en **"New project"**
3. Completa:
   - **Name:** `sigai-ses` (o el nombre que quieras)
   - **Database Password:** Crea una contraseña segura y **guárdala**
   - **Region:** Elige la más cercana (US East si estás en Colombia/Sudamérica)
   - **Pricing Plan:** **Free** (gratuito de por vida)
4. Espera a que se cree el proyecto (~1-2 minutos)

### 1.2 Obtener la cadena de conexión

1. En el panel de Supabase, ve a **Project Settings → Database**
2. Busca la sección **Connection string**
3. Haz clic en **URI** (no en PSQL ni en los otros)
4. Verás algo como:
   ```
   postgresql://postgres:xxxxxx@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Cópiala completa

### 1.3 Actualizar Backend/.env

Abre `Backend/.env` y reemplaza la línea `DATABASE_URL`:

```env
# ANTES (MySQL local):
DATABASE_URL=mysql+aiomysql://root:@localhost:3306/sigai_ses_db

# DESPUÉS (Supabase PostgreSQL):
DATABASE_URL=postgresql+asyncpg://postgres:TU_CONTRASEÑA@db.TU_PROYECTO.supabase.co:5432/postgres
```

**Importante:** Cambia `postgresql://` por `postgresql+asyncpg://` (el `+asyncpg` es necesario para que funcione con el driver asíncrono).

### 1.4 Las tablas se crean solas

Al iniciar el backend, el archivo `Backend/scripts/init_db.py` se ejecuta automáticamente y:

1. Conecta a la base de datos
2. Crea **todas las tablas** con `Base.metadata.create_all`
3. Crea el usuario administrador por defecto si no existe:
   - Email: `admin@securitas.com`
   - Contraseña: `Admin123!`

No necesitas ejecutar migraciones manuales ni scripts SQL.

### 1.5 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `Backend/.env` | `DATABASE_URL` apuntando a Supabase |
| `Backend/requirements.txt` | Se agregó `asyncpg` |
| `.venv` | Se instaló `asyncpg` (paquete Python) |

---

## 2. Configurar el backend

### 2.1 Variables de entorno necesarias

`Backend/.env` completo:

```env
# Base de datos (Supabase PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:TU_CONTRASEÑA@db.TU_PROYECTO.supabase.co:5432/postgres

# Seguridad (cambiar en producción)
SECRET_KEY=una_clave_segura_aleatoria_123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# CORS (orígenes permitidos)
CORS_ALLOWED_ORIGINS=*
```

### 2.2 Probar la conexión

```bash
cd Backend

# Activar entorno virtual
.venv\Scripts\activate

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Si todo está bien, verás en la terminal:
```
SIGAI-SES - Inicializacion de Base de Datos
Base de datos conectada exitosamente.
Tablas creadas exitosamente.
```

---

## 3. PWA — App instalable en móvil

La PWA ya está configurada. No necesitas hacer nada más.

### 3.1 Cómo instalarla en el móvil

| Dispositivo | Pasos |
|-------------|-------|
| **Android (Chrome)** | Abre la app → Menú (3 puntos) → "Instalar aplicación" |
| **iOS (Safari)** | Abre la app → Icono de compartir → "Agregar a pantalla de inicio" |

### 3.2 Archivos de configuración

| Archivo | Función |
|---------|---------|
| `Frontend/vite.config.ts` | Plugin `vite-plugin-pwa` con manifest + service worker |
| `Frontend/index.html` | Meta tags para móvil (theme-color, apple-touch-icon) |
| `Frontend/public/icon-512.png` | Icono para la PWA |

### 3.3 Características

- **Offline:** Usa Workbox para cachear archivos estáticos
- **Actualización automática:** Cuando hay una nueva versión, se actualiza sola
- **API cache:** Las peticiones a la API se cachean con estrategia NetworkFirst

---

## 4. Generar .exe único (Frontend + Backend en un solo archivo)

El script `build_all.py` compila todo en un solo `backend.exe`.

### Comportamiento del .exe

- **Primera ejecución:** Crea automáticamente un acceso directo en el escritorio llamado "SIGAI-SES"
- **Siempre:** Al iniciar, abre el navegador en `http://localhost:8000` (página de login)
- El usuario solo da doble clic al icono del escritorio y la app se abre sola

### 4.1 Requisitos (para compilar)

```bash
node --version        # >= 18
python --version      # >= 3.11
```

### 4.2 Configurar la base de datos

Antes de compilar, asegúrate de que `Backend/.env` tenga tu conexión a Supabase:

```env
DATABASE_URL=postgresql+asyncpg://postgres:TU_PASS@db.TU_PROYECTO.supabase.co:5432/postgres
SECRET_KEY=una_clave_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ALLOWED_ORIGINS=*
```

### 4.3 Compilar el .exe

```bash
python build_all.py
```

**Tiempo estimado:** 3-8 minutos.

### 4.4 Archivos involucrados

| Archivo | Función |
|---------|---------|
| `build_all.py` (raíz) | Script único para compilar todo |
| `Backend/run.py` | Punto de entrada — crea shortcut + abre navegador |
| `Backend/backend.spec` | Configuración de empaquetado PyInstaller |
| `Backend/app/main.py` | Sirve el frontend compilado como archivos estáticos |

### 4.5 Compartir

Copia `Backend/dist/backend.exe` a cualquier PC con Windows.
**No necesita** Node.js, Python ni nada instalado. Solo internet para Supabase.

---

## 5. APK — App nativa Android (Capacitor)

Capacitor envuelve la web en una app Android nativa y genera un `.apk` real.

### 5.1 Requisitos

- **Android Studio** — descárgalo de https://developer.android.com/studio
  - Durante la instalación, **marca "Android Virtual Device"** si quieres probar en emulador
  - Asegúrate de que instala el **SDK de Android (API 34+)**
- **Node.js 18+** instalado

### 5.2 PASO 1 — Desplegar el backend en Railway

El APK se conecta a un **backend en la nube** (no al localhost de tu PC).

1. Ve a https://railway.app, crea cuenta (gratis, 500h/mes)
2. **New Project → Deploy from GitHub**
3. Conecta tu repositorio, selecciona la carpeta `Backend/`
4. Railway detecta Python y usará:
   - `Start Command`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. En **Variables** agrega:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:xxxx@db.xxxx.supabase.co:5432/postgres
   SECRET_KEY=una_clave_segura_aqui
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=480
   CORS_ALLOWED_ORIGINS=*
   ```
6. Railway te dará una URL como: `https://sigai-ses-backend.railway.app`
7. **Guarda esa URL**, la necesitas en el paso siguiente

### 5.3 PASO 2 — Configurar la URL del backend

Abre `Frontend/.env.production` y pon la URL de Railway:

```env
VITE_API_BASE_URL=https://sigai-ses-backend.railway.app/api/v1
```

### 5.4 PASO 3 — Compilar frontend y sincronizar con Capacitor

```bash
cd Frontend

# 1. Compila el frontend (React → static) y lo copia a Capacitor
npm run cap:build
```

Este comando ejecuta: `npm run build` → `npx cap copy` → `npx cap sync`

### 5.5 PASO 4 — Abrir el proyecto en Android Studio

```bash
cd Frontend
npx cap open android
```

Esto abre Android Studio automáticamente con el proyecto.

### 5.6 PASO 5 — Generar el APK desde Android Studio

Una vez abierto Android Studio:

1. **Espera** a que Gradle termine de sincronizar (barra de progreso abajo)
2. Ve al menú: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Espera a que termine la compilación (1-5 minutos)
4. Al finalizar, aparece un **popup** con un link "locate" — haz clic
5. Se abre el explorador en:
   ```
   Frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Alternativa — Generar desde terminal:**

```bash
cd Frontend/android
.\gradlew assembleDebug
```

Esto genera: `Frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### 5.7 PASO 6 — Probar el APK

**Opción A — En un celular real:**
1. Copia `app-debug.apk` al celular (WhatsApp, Drive, cable USB)
2. En el celular: **Ajustes → Seguridad → Instalar apps desconocidas** → permite tu origen
3. Abre el archivo .apk y presiona "Instalar"

**Opción B — En el emulador de Android Studio:**
1. En Android Studio, busca el botón ▶️ **Run** (triángulo verde) en la barra superior
2. Selecciona un dispositivo virtual o crea uno nuevo (recomendado: Pixel 6, API 34)
3. Presiona **OK** y espera a que se instale en el emulador

### 5.8 Archivos del APK

| Archivo | Función |
|---------|---------|
| `Frontend/capacitor.config.json` | Configuración de Capacitor (appId, appName, splash) |
| `Frontend/android/` | Proyecto nativo de Android (generado por Capacitor) |
| `Frontend/.env.production` | URL del backend en producción |
| `Frontend/package.json` | Scripts `cap:build` y `cap:apk` |
| `Frontend/android/app/build/outputs/apk/debug/app-debug.apk` | APK final

---

## 6. Arquitectura

```
┌──────────────────────────────────────┐    ┌──────────────────────────────┐
│  APK (Android)                       │    │  backend.exe (Windows)       │
│  Capacitor + WebView                 │    │  PyInstaller + Uvicorn       │
│  Se conecta a Railway                │    │  Se conecta a Supabase       │
│  Abre directo al login               │    │  Crea icono escritorio       │
└─────────┬────────────────────────────┘    │  Abre navegador en login     │
          │                                 └──────────┬───────────────────┘
          ▼                                            ▼
┌──────────────────────────────────────────────────────────────┐
│              RAILWAY o LOCAL (según el caso)                  │
│  Opción A: Railway (para APK) → https://sigai-ses.railway.app│
│  Opción B: Localhost (para .exe) → http://localhost:8000     │
│           FastAPI + Uvicorn                                   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   SUPABASE (PostgreSQL) │
              │   En la nube            │
              └─────────────────────────┘
```

### Flujo de uso (.exe)

1. El usuario da doble clic al icono "SIGAI-SES" en el escritorio
2. Se inicia el servidor y se abre el navegador en la pantalla de login
3. La app se conecta a Supabase para los datos
4. Para cerrar, solo cierra la ventana de la terminal

### Flujo de uso (APK)

1. El usuario abre la app desde el menú de aplicaciones
2. La app carga directamente el login (conectada a Railway)
3. La app se conecta a Supabase para los datos

---

## 7. Solución de problemas

### Error: Módulo faltante en PyInstaller

Abre `Backend/backend.spec` y agrega el módulo en `hiddenimports`:

```python
hiddenimports=[
    ...
    'nombre_del_modulo_faltante',
],
```

### Error de conexión a Supabase

1. Verifica que la contraseña no tenga caracteres especiales (`%` → `%25`, `@` → `%40`)
2. En Supabase, ve a **Database → Connection pooling** y verifica el puerto
3. En **Authentication → Settings** desactiva "Enable email confirmations" si no quieres confirmación

### El .exe no se abre o se cierra inmediatamente

Ejecútalo desde una terminal para ver los logs:

```bash
cd Backend\dist
backend.exe
```

### La app no carga en el navegador

1. Verifica que el .exe se esté ejecutando (Administrador de Tareas)
2. Abre `http://127.0.0.1:8000`
3. Revisa que el puerto 8000 no esté ocupado

### "La aplicación no se instaló" en Android

1. Ve a **Ajustes → Seguridad → Instalar apps desconocidas** y permite la instalación desde el origen (WhatsApp, Drive, etc.)
2. Asegúrate de tener al menos Android 8.0+
3. Si usas el APK de depuración, algunos dispositivos pueden bloquearlo; usa un APK firmado en su lugar

---

> **¿Problemas?** Revisa los logs en la terminal, o abre un issue en el repositorio.
