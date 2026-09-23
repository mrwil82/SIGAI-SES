# 🧪 GUÍA DE PRUEBA LOCAL CON XAMPP

> **Para validar que la aplicación funciona correctamente antes de entregar al cliente**

---

## ✅ PRERREQUISITOS

| Software | Versión | Verificar |
|----------|---------|-----------|
| **XAMPP** | 8.2+ (MariaDB 10.4+) | Panel: MySQL "Running" puerto 3306 |
| **Python** | 3.12+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **Git** | - | `git --version` |

---

## 🗄️ PASO 1: CONFIGURAR XAMPP / MARIADB

### 1.1 Iniciar MySQL en XAMPP
```
Abrir XAMPP Control Panel → [Start] MySQL
Verificar: Puerto 3306 activo (netstat -an | findstr 3306)
```

### 1.2 Crear base de datos (Opcional - la app la crea automáticamente)
```bash
# Opción A: Desde XAMPP phpMyAdmin
# http://localhost/phpmyadmin → New → sigai_ses → utf8mb4_unicode_ci

# Opción B: Línea de comandos
C:\xampp\mysql\bin\mysql.exe -u root
CREATE DATABASE sigai_ses CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 1.3 Verificar conexión
```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "SHOW DATABASES;"
# Debe aparecer: sigai_ses
```

---

## ⚙️ PASO 2: BACKEND (FastAPI)

```powershell
# 1. Ir a la carpeta del backend
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\01-CODIGO-FUENTE\Backend

# 2. Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate

# 3. Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configurar variables de entorno
copy .env.example .env

# 5. Editar .env si XAMPP tiene contraseña root:
# Si XAMPP MySQL tiene password: DATABASE_URL=mysql+aiomysql://root:TU_PASSWORD@localhost:3306/sigai_ses
# Si NO tiene password (default): DATABASE_URL=mysql+aiomysql://root:@localhost:3306/sigai_ses

# 6. Generar SECRET_KEY segura (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
# Copiar el resultado y pegar en .env → SECRET_KEY=...

# 7. Ejecutar migraciones (crea tablas automáticamente)
alembic upgrade head

# 8. Crear usuario admin inicial
python -m scripts.seed_admin
# Debe mostrar: "Usuario admin creado: admin@securitas.com"

# 9. INICIAR BACKEND
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### ✅ Verificar Backend
| URL | Debe mostrar |
|-----|--------------|
| http://localhost:8000/health | `{"status":"ok"}` |
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8000/api/v1/auth/login | POST endpoint |

---

## 🌐 PASO 3: FRONTEND (React + Vite)

```powershell
# 1. Nueva terminal → ir a frontend
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\01-CODIGO-FUENTE\Frontend

# 2. Configurar variables
copy .env.example .env
# Verificar: VITE_API_BASE_URL=http://localhost:8000/api/v1

# 3. Instalar dependencias (PRIMERA VEZ OBLIGATORIO)
npm install

# 4. INICIAR FRONTEND (desarrollo)
npm run dev
```

### ✅ Verificar Frontend
| URL | Debe mostrar |
|-----|--------------|
| http://localhost:5173 | Login page de SIGAI-SES |

---

## 🔐 PASO 4: PROBAR LOGIN Y FUNCIONALIDAD

### Credenciales por defecto
```
Email:    admin@securitas.com
Password: CambiarEst3nProduccion!  (o Admin123! si usaste seed_admin directo)
```

### Checklist de prueba rápida
- [ ] Login exitoso → Redirige a Dashboard
- [ ] Dashboard muestra métricas (vacías al inicio)
- [ ] Menú lateral: Inventario, Garantías, Clientes, Proyectos, Usuarios
- [ ] Inventario → "Importar Excel" → Modal abre
- [ ] Usuarios → "Nuevo usuario" → Formulario funciona
- [ ] Configuración → Perfil → Editar avatar
- [ ] Backend logs: `INFO - Inicialización completada exitosamente`

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| `Access denied for user 'root'@'localhost'` | XAMPP MySQL tiene password | Editar `.env`: `DATABASE_URL=mysql+aiomysql://root:TU_PASS@localhost:3306/sigai_ses` |
| `Can't connect to MySQL server on 'localhost:3306'` | MySQL no corriendo | XAMPP Control Panel → Start MySQL |
| `vite: command not found` | `npm install` no ejecutado | `cd Frontend && npm install` |
| `ModuleNotFoundError: No module named 'pymysql'` | Deps no instaladas | `cd Backend && .venv\Scripts\activate && pip install -r requirements.txt` |
| `CORS error` en navegador | Origen no permitido | Verificar `.env` backend: `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost` |
| `Table 'sigai_ses.usuarios' doesn't exist` | Migraciones no ejecutadas | `alembic upgrade head` en Backend |
| Puerto 8000/5173 en uso | Otra app corriendo | Cambiar puerto: `uvicorn ... --port 8001` o `npm run dev -- --port 3000` |

---

## 📋 CHECKLIST FINAL DE ENTREGA

- [ ] XAMPP MySQL corriendo
- [ ] Backend: `alembic upgrade head` OK
- [ ] Backend: `python -m scripts.seed_admin` OK
- [ ] Backend: `uvicorn` corriendo en puerto 8000
- [ ] Frontend: `npm install` OK
- [ ] Frontend: `npm run dev` corriendo en puerto 5173
- [ ] Login con admin@securitas.com funciona
- [ ] Dashboard carga sin errores
- [ ] Navegación entre módulos OK
- [ ] No hay errores en consola del navegador (F12)
- [ ] No hay errores en terminal del backend

---

## 📝 NOTAS IMPORTANTES

1. **La BD se crea automáticamente** con `alembic upgrade head` - no necesitas ejecutar el SQL manualmente
2. **Usuario admin** se crea con `scripts.seed_admin` (idempotente - seguro ejecutar varias veces)
3. **Para producción**: Cambiar `SECRET_KEY`, `ADMIN_PASSWORD`, y usar HTTPS
4. **Puertos por defecto**: Backend 8000, Frontend 5173, MySQL 3306

---

## 🚀 COMANDOS RÁPIDOS (COPY-PASTE)

```powershell
# === BACKEND ===
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\01-CODIGO-FUENTE\Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Editar .env si needed
alembic upgrade head
python -m scripts.seed_admin
uvicorn app.main:app --reload

# === FRONTEND (nueva terminal) ===
cd C:\Users\ASUS\Desktop\PASANTIA\Proyecto_SES\SIGAI-SES-ENTREGA\01-CODIGO-FUENTE\Frontend
copy .env.example .env
npm install
npm run dev
```

---

**¡Si todo esto funciona, la entrega está lista para el cliente!** ✅
