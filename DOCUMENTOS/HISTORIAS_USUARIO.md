# 📝 HISTORIAS DE USUARIO — SIGAI-SES

| ID | Historia de Usuario | Criterio de Aceptación |
|---|---|---|
| **HU-01** | Como **Bodeguero**, quiero registrar la entrada de equipos nuevos para que estén disponibles en el stock. | - El sistema debe pedir Serial y Referencia.<br>- Debe actualizar el stock total automáticamente. |
| **HU-02** | Como **Técnico**, quiero ver mi inventario asignado para saber qué herramientas y equipos tengo bajo mi responsabilidad. | - Debe mostrar una lista con seriales y fechas de entrega.<br>- Debe estar disponible en el móvil. |
| **HU-03** | Como **Supervisor**, quiero aprobar un acta de entrega digital para formalizar la salida de equipos a un proyecto. | - El acta debe incluir firma del técnico y del bodeguero.<br>- Debe generar un PDF inviolable. |
| **HU-04** | Como **Admin**, quiero recibir una alerta de stock bajo para iniciar el proceso de recompra a tiempo. | - Se debe configurar un umbral por item.<br>- La alerta debe aparecer en el dashboard principal. |
| **HU-05** | Como **Técnico de Laboratorio**, quiero registrar un equipo de desmonte para evaluar si se puede reutilizar. | - Debe permitir marcar estado (Funcional, Dañado, Chatarra).<br>- Debe quedar vinculado al cliente de origen. |
| **HU-06** | Como **Técnico**, quiero reportar una garantía de forma rápida para que el proceso con el proveedor inicie de inmediato. | - Debe permitir asociar fotos de la falla.<br>- Debe generar un número de caso GSES-XXX único. |
