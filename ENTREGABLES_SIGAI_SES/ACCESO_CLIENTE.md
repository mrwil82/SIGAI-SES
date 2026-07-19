<p align="center">
  <img src="https://img.shields.io/badge/SIGAI--SES-Acceso%20de%20Pruebas-0055A4?style=for-the-badge&logo=testcafe" alt="Acceso">
  <img src="https://img.shields.io/badge/Ambiente-Staging-yellow?style=for-the-badge&logo=vercel" alt="Staging">
  <img src="https://img.shields.io/badge/Rol-Administrador-success?style=for-the-badge&logo=admin" alt="Admin">
  <img src="https://img.shields.io/badge/Julio-2026-FF6B35?style=for-the-badge&logo=calendar" alt="Fecha">
</p>

<h1 align="center">
  SIGAI-SES - Acceso para Pruebas
</h1>

<p align="center">
  <b>Sistema Integral de Gestion de Activos e Inventario</b><br>
  <i>Securitas Colombia S.A. - Unidad de Seguridad Electronica (SES)</i>
</p>

---

> [!WARNING]
> **CONFIDENCIAL** - Estas credenciales son **unicamente para pruebas** del cliente autorizado. No compartir con personal no autorizado.

---

## Datos de Acceso

| Dato | Valor | Nota |
|---|---|---|
| **URL** | [https://proyecto-sigai-ses.vercel.app](https://proyecto-sigai-ses.vercel.app) | |
| **Usuario** | `admin@securitas.com` | |
| **Contrasena** | `Admin123!` | |

> [!NOTE]
> La contrasena debe ser cambiada en el **primer inicio de sesion** en el ambiente de produccion.

---

## Que Probar

<details open>
<summary><b>Funcionalidades disponibles para testing</b></summary>

### Modulos del Sistema

| # | Modulo | Accion | Estado Esperado |
|---|---|---|---|
| 1 | Login | Iniciar sesion con credenciales | Acceso concedido |
| 2 | Dashboard | Explorar KPIs y graficos | Datos visibles |
| 3 | Items | Crear, editar, eliminar items | CRUD funcional |
| 4 | Clientes | Gestionar clientes y proyectos | CRUD funcional |
| 5 | Equipos | Registrar equipos y activos serializados | CRUD funcional |
| 6 | Movimientos | Registrar entradas, salidas, traslados | Kardex actualizado |
| 7 | Garantias | Flujo completo de garantias | 5 estados funcionales |
| 8 | Actas | Generar actas de entrega con firma | PDF descargable |
| 9 | Alertas | Verificar motor de alertas automatico | Alertas visibles |
| 10 | Reportes | Generar reportes Excel y PDF | Archivos descargables |
| 11 | Importacion | Importar datos desde Excel | Upsert funcional |

</details>

---

## Escenarios de Prueba Sugeridos

> [!TIP]
> Sigue estos escenarios para una evaluacion completa del sistema.

| Escenario | Pasos | Resultado Esperado |
|---|---|---|
| **Flujo completo de garantia** | Crear item -> Asignar activo -> Registrar garantia -> Seguir 5 estados | Garantia entregada al tecnico |
| **Inventario con alertas** | Reducir stock por debajo del minimo -> Esperar 15 min | Alarma de stock bajo |
| **Acta de entrega** | Seleccionar activos -> Generar acta -> Firma digital -> PDF | PDF con firma y datos |
| **Importacion masiva** | Cargar Excel de 150+ registros | Datos importados correctamente |
| **Reporte ejecutivo** | Dashboard -> KPIs -> Exportar Excel | Excel con datos reales |

---

## Enviar Feedback

> [!IMPORTANT]
> Cualquier error, sugerencia o mejora, por favor reportarlo a traves de los siguientes canales:

| Canal | Detalle |
|---|---|
| **Correo** | [tucorreo@ejemplo.com](mailto:tucorreo@ejemplo.com) |
| **WhatsApp** | [+57 300 000 0000](https://wa.me/573000000000) |
| **Repositorio** | [Issues en GitHub](https://github.com/tu-repo/sigai-ses/issues) |

### Plantilla para reportar errores

```markdown
**Modulo:** [ej. Garantias, Inventario, Login]
**Descripcion:** [Que paso?]
**Pasos para reproducir:**
1. Ir a...
2. Hacer click en...
3. Observar error...
**Resultado esperado:** [Que deberia pasar]
**Captura de pantalla:** [Si aplica]
```

---

## Informacion Tecnica del Ambiente

| Parametro | Valor |
|---|---|
| **Ambiente** | Staging / Pre-produccion |
| **Hosting** | Vercel (Frontend) + Railway (Backend) |
| **Base de datos** | TiDB Cloud (MySQL compatible) |
| **API Base URL** | `https://sigai-ses-backend.railway.app/api` |
| **Documentacion API** | `/docs` (Swagger UI) |
| **TLS/SSL** | Habilitado (Let's Encrypt) |

---

## Recursos Adicionales

| Recurso | Enlace |
|---|---|
| Manual de usuario tecnico | [Ver manual](./03_DOCUMENTACION_USUARIO/MANUALES/01_MANUAL_USUARIO_TECNICO.md) |
| Manual de administrador | [Ver manual](./03_DOCUMENTACION_USUARIO/MANUALES/02_MANUAL_ADMINISTRADOR.md) |
| FAQ para usuarios | [Ver FAQ](./03_DOCUMENTACION_USUARIO/FAQ/01_FAQ_USUARIO.md) |
| Guia de instalacion | [Ver guia](./01_DOCUMENTACION_TECNICA/02_GUIA_INSTALACION_BACKEND.md) |

---

<p align="center">
  <img src="https://img.shields.io/badge/Documento%20generado-Julio%202026-0055A4?style=for-the-badge" alt="Generado">
  <img src="https://img.shields.io/badge/SIGAI--SES-Securitas%20Colombia-success?style=for-the-badge" alt="SIGAI-SES">
</p>

<p align="center">
  <i>Wilson Ortiz - Pasante SENA</i>
</p>
