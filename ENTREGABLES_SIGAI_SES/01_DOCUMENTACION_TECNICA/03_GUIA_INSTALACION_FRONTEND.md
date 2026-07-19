---
title: "GUÍA DE INSTALACIÓN DEL FRONTEND — React + TypeScript + Vite"
---

# GUÍA DE INSTALACIÓN DEL FRONTEND — React + TypeScript + Vite

<p align="center">
  <img src="https://img.shields.io/badge/Componente-Frontend-61DAFB?style=for-the-badge&logo=react" alt="Frontend">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Estado-Probado-2ea44f?style=for-the-badge&logo=checkmarx" alt="Estado">
</p>

---

## 1. Objetivo

> [!NOTE]
> Documentar la configuración del **cliente web** de **SIGAI-SES**, construido con **React**, **TypeScript** y **Tailwind CSS**.

---

## 2. Requisitos Previos

> [!WARNING]
> Requisito indispensable antes de comenzar:

| Componente | Versión Mínima | Verificación |
|---|---|---|
| **Node.js** | `18+` | `node --version` |
| **npm** | (incluido) | `npm --version` |
| **yarn** (opcional) | — | `yarn --version` |

---

## 3. Instalación Paso a Paso

### 3.1 Instalar dependencias

```bash
cd Frontend
npm install
```

> [!TIP]
> La instalación puede tomar entre **30 segundos y 2 minutos** dependiendo de la conexión.

### 3.2 Configurar variables de entorno

Cree un archivo `.env` en la carpeta `Frontend/`:

```env
# ───> URL del API Backend ────────────────────────────────
# Si usa Docker: /api/v1
# Si ejecuta directamente: http://localhost:8000/api/v1
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

| Configuración | Valor de `VITE_API_BASE_URL` |
|---|---|
| **Desarrollo local** | `http://localhost:8000/api/v1` |
| **Docker** | `/api/v1` |
| **Producción** | `https://tu-dominio.com/api/v1` |

### 3.3 Iniciar en desarrollo

```bash
npm run dev
```

> [!IMPORTANT]
> El frontend estará disponible en **http://localhost:5173** 

### 3.4 Generar versión de producción

```bash
npm run build
```

> [!TIP]
> Los archivos optimizados se generarán en la carpeta ` dist/`.

| Comando | | Descripción |
|---|---|---|
| `npm run dev` | | Inicia servidor de desarrollo con HMR |
| `npm run build` | | Genera build de producción optimizado |
| `npm run preview` | | Previsualiza el build de producción |
| `npm run lint` | | Ejecuta linter de código |

---

## 4. Estructura del Proyecto

```
Frontend/src/
├── components/     # Componentes reutilizables (Card, Button, Table, Badge)
├── context/        # AuthContext (estado de autenticación)
├── hooks/          # Custom hooks (useInventory)
├── pages/          #  11 páginas de la aplicación
├── services/       # API services (auth, inventory, business, alerts)
├── App.tsx         # Rutas principales
└── main.tsx        # Punto de entrada
```

<details>
<summary><b>Click para ver estructura completa de componentes</b></summary>

<br>

| Componente | Ruta | Propósito |
|---|---|---|
| `Fusion.tsx` | `components/` | Design System (Sidebar, Card, Modal, Button, Table, NeoInput) |
| `ProtectedRoute.tsx` | `components/` | Ruta protegida (requiere token) |
| `RoleProtectedRoute.tsx` | `components/` | Ruta protegida por rol |
| `Toaster.tsx` | `components/` | Portal de notificaciones toast |
| `ExportMenu.tsx` | `components/` | Exportación PDF/Excel |
| `UserSettingsModal.tsx` | `components/` | Modal de preferencias |
| `AuthContext.tsx` | `context/` | Contexto de autenticación JWT |
| `useInventory.ts` | `hooks/` | Hook personalizado (React Query) |

</details>

---

## 5. Páginas Disponibles

| Ruta | Página | Descripción | Acceso |
|---|---|---|---|
| `/login` | **Inicio de sesión** | Pantalla de login con credenciales | Público |
| `/` | **Dashboard** | Panel principal con KPIs y gráficos | Autenticados |
| `/inventory` | **Inventario** | CRUD + importación de inventario | Autenticados |
| `/clients` | **Clientes** | Directorio de clientes | Autenticados |
| `/projects` | **Proyectos** | Gestión de proyectos | Autenticados |
| `/guarantees` | **Garantías** | Seguimiento de garantías | Autenticados |
| `/alerts` | **Alertas** | Centro de alertas del sistema | Autenticados |
| `/desmontes` | **Desmontes** | Triage de equipos desmontados | Autenticados |
| `/users` | **Usuarios** | Administración de usuarios | Solo ADMIN |
| `/audit` | **Auditoría** | Bitácora de auditoría | Solo ADMIN |
| `/deliveries` | **Entregas** | Actas de entrega | Solo ADMIN |

### Leyenda de Accesos

| Icono | | Significado |
|---|---|---|
| | **Público** | Acceso sin autenticación |
| | **Autenticados** | Cualquier usuario logueado |
| | **Solo ADMIN** | Requiere rol `ADMIN` |

---

## 6. Verificación

> [!TIP]
> Sigue estos pasos para verificar que la instalación fue exitosa:

- [ ] **Inicie sesión** con las credenciales del administrador
- [ ] **Verifique** que el Dashboard carga correctamente con KPIs
- [ ] **Navegue** por los módulos de **Inventario**
- [ ] **Explore** el módulo de **Clientes**
- [ ] **Revise** el módulo de **Garantías**

---

<details>
<summary><b>Click para ver comandos de diagnóstico rápido</b></summary>

<br>

```bash
# Verificar versión de Node.js
node --version

# Verificar dependencias instaladas
npm list --depth=0

# Verificar configuración de Vite
cat .env

# Iniciar en modo desarrollo
npm run dev

# Verificar build de producción
npm run build && echo " Build exitoso"
```

</details>

---

<p align="center">
  <b>SIGAI-SES</b> — <i>Sistema Integral de Gestión de Activos e Inventario</i><br><br>
  <img src="https://img.shields.io/badge/Última%20actualización-Julio%202026-FF6F00?style=for-the-badge&logo=calendar" alt="Actualización"><br>
   v1.0.0
</p>





