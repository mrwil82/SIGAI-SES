<p align="center">
  <img src="https://img.shields.io/badge/SIGAI--SES-Acceso%20Pruebas-0055A4?style=for-the-badge&logo=testcafe" alt="Acceso">
  <img src="https://img.shields.io/badge/Ambiente-Cloud-yellow?style=for-the-badge&logo=vercel" alt="Cloud">
  <img src="https://img.shields.io/badge/Entrega%20Final-v1.0.0-success?style=for-the-badge&logo=checkmarx" alt="Entrega">
  <img src="https://img.shields.io/badge/Julio-2026-FF6B35?style=for-the-badge&logo=calendar" alt="Fecha">
</p>

<h1 align="center">
  SIGAI-SES — Acceso y Entrega Final
</h1>

<p align="center">
  <b>Sistema Integral de Gestión de Activos e Inventario</b><br>
  <i>Securitas Colombia S.A. — Unidad de Seguridad Electrónica (SES)</i>
</p>

<p align="center">
  <b>Destinatario:</b> Elkin David Velasquez Hernandez — Gerente de Mantenimiento SES
</p>

---

> [!WARNING]
> **CONFIDENCIAL** — Este documento contiene información sensible del proyecto. No compartir con personal no autorizado.

---

## Datos de acceso

| Dato | Valor |
|---|---|
| **Usuario** | `admin@securitas.com` |
| **Contrasena** | `Admin123!` |

> [!NOTE]
> Al ejecutar la aplicación se abrirá automáticamente el navegador con la URL local de inicio de sesión. Ambiente cloud (backend en Render, base de datos en Supabase). No se requiere instalación local.

---

## Archivos entregados

| Archivo | Descripción |
|---|---|
| `SIGAI-SES.apk` | Aplicacion Android nativa (~4.4 MB) |
| `SIGAI-SES_Portable.exe` | Windows portable, no necesita instalación (~67 MB) |
| `SIGAI-SES-Setup-1.0.0.exe` | Instalador profesional de Windows |

---

## Cómo usar cada archivo

### 1. APK Android

1. Transfiere el `.apk` al dispositivo
2. En el celular, ve a **Ajustes > Seguridad** y habilita "orígenes desconocidos"
3. Ábrelo y selecciona **Instalar**

### 2. Windows Portable (no requiere instalación)

1. Haz doble clic en `SIGAI-SES_Portable.exe`
2. Si Windows Defender lo bloquea, haz clic en "Mostrar más detalles", luego ejecuta de todas maneras.
3. Se lanzará la ventana de comandos seguida del navegador web, donde podrás iniciar sesión.
4. Para cerrar, presiona Ctrl+C o cierra la terminal.

### 3. Instalador de Windows (set-up)

1. Haz doble clic en `SIGAI-SES-Setup-1.0.0.exe`
   y sigue el asistente de instalación
2. Una vez finalizado, busca "SIGAI SES" en el menú inicio
3. Se abrirá la terminal con el servidor, seguida del navegador para iniciar sesión.
4. Para desinstalar: Panel de control > Programas > Desinstalar.

---

## Requisitos

| Componente | APK (Android) | Windows |
|---|---|---|
| Versión mínima | Android 8.0+ | Windows 10/11 |
| RAM minima | 2 GB | 4 GB |
| Espacio en disco | 20 MB | 300 MB |
| Conexión internet | Sí | Sí |

---

## Problemas y errores conocidos

| # | Problema | Solución/Recomendación |
|---|---|---|
| 1 | APK no se instala | Habilitar orígenes desconocidos en Ajustes |
| 2 | Windows Defender bloquea el archivo | Agregar a exclusiones del antivirus |
| 3 | Primera carga lenta | El servicio cloud (Render) puede tardar hasta 20 segundos en arrancar. Aguardar, luego la navegación es normal |
| 4 | API no disponible | Verificar internet; el backend y base datos están en Render y Supabase |

---

## Contacto para reportar problemas

> [!IMPORTANT]
> Cualquier error, sugerencia o mejora, repórtela a:

| Canal | Detalle |
|---|---|
| **WhatsApp** | [312 370 0968] |
| **Correo** | wil82-xbox@hotmail.com |

### Plantilla para reportar errores

```
Modulo: [Garantias/Inventario/Login…]
Problema:
Pasos para reproducir:
1.
2.
3.
Resultado esperado:
Error/Resultado obtenido:
Captura de pantalla:
```

---

## Nota de agradecimiento

> Agradezco sinceramente a Elkin David Velasquez Hernandez, Gerente de Mantenimiento SES, por la confianza y la oportunidad de desarrollar este proyecto. También a todo el equipo de Seguridad Electrónica (SES) por su invaluable apoyo, retroalimentación constante sobre los puntos de mejora y apertura durante la implementación del sistema. Este proyecto fue desarrollado con dedicación, bajo mucho aprendizaje, y el compromiso de entregar un producto funcional, robusto y preparado para un ambiente real para ENEL Colombia.

---

<p align="center">
  <i>Wilson Ortiz</i><br>
  <b>Aprendiz SENA - Análisis y Desarrollo de Software</b><br>
  SIGAI-SES — Securitas Colombia S.A.
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/SIGAI--SES-v1.0.0-blue?style=for-the-badge" alt="version">
  <img src="https://img.shields.io/badge/desarrollado%20por-Wilson%20Ortiz-success?style=for-the-badge" alt="Wilson Ortiz">
  <img src="https://img.shields.io/badge/SENA-FPI-FECC02?style=for-the-badge&logo=sena" alt="SENA">
</p>

<p align="center">
  <i>Bogotá, Colombia - Julio 2026</i>
</p>
