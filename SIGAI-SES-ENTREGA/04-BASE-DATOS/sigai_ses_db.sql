-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-09-2026 a las 03:37:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sigai_ses`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actas_entrega`
--

CREATE TABLE `actas_entrega` (
  `id_acta` int(11) NOT NULL,
  `numero_acta` varchar(50) DEFAULT NULL,
  `id_usuario_tecnico` int(11) DEFAULT NULL,
  `id_usuario_representante` int(11) DEFAULT NULL,
  `id_proyecto` int(11) DEFAULT NULL,
  `id_regional` int(11) DEFAULT NULL,
  `tipo_acta` enum('ENTREGA_EPP','ENTREGA_HERRAMIENTA','DESPACHO_PROYECTO','DEVOLUCION','INGRESO_DESMONTE') NOT NULL,
  `estado_acta` enum('BORRADOR','FIRMADA','ANULADA') DEFAULT 'BORRADOR',
  `fecha_entrega` timestamp NULL DEFAULT current_timestamp(),
  `url_pdf` varchar(255) DEFAULT NULL,
  `firma_tecnico_blob` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activos`
--

CREATE TABLE `activos` (
  `id_activo` int(11) NOT NULL,
  `id_item` int(11) DEFAULT NULL,
  `serial` varchar(100) NOT NULL,
  `estado_actual` enum('DISPONIBLE','INSTALADO','EN_GARANTIA','REPARADO','LABORATORIO','DESMONTE','BAJA','OBSOLETO') DEFAULT NULL,
  `condicion_fisica` enum('NUEVO','USADO_BUENO','PARA_REPARAR','SULFATADO','SIN_CONTRAPESOS','DAÑADO') DEFAULT NULL,
  `area_asignada` varchar(100) DEFAULT NULL,
  `responsable_sitio` varchar(100) DEFAULT NULL,
  `ubicacion_fisica` varchar(255) DEFAULT NULL,
  `id_proyecto_actual` int(11) DEFAULT NULL,
  `id_cliente_actual` int(11) DEFAULT NULL,
  `id_proveedor_compra` int(11) DEFAULT NULL,
  `numero_factura_compra` varchar(50) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `activo_fijo_securitas` varchar(50) DEFAULT NULL,
  `credenciales_tecnicas` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_ingreso_laboratorio` timestamp NULL DEFAULT NULL,
  `fecha_triaje` timestamp NULL DEFAULT NULL,
  `calificacion_tecnica` enum('BUENO','RECUPERABLE','DESECHO') DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alembic_version`
--

CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alembic_version`
--

INSERT INTO `alembic_version` (`version_num`) VALUES
('0b0ad1035e55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `prioridad` enum('critica','alta','media','baja') NOT NULL,
  `estado` enum('activa','reconocida','resuelta','ignorada') DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `item_nombre` varchar(200) DEFAULT NULL,
  `valor_actual` decimal(10,2) DEFAULT NULL,
  `valor_umbral` decimal(10,2) DEFAULT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `asignado_a` int(11) DEFAULT NULL,
  `solucion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alert_rules`
--

CREATE TABLE `alert_rules` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `activa` tinyint(1) DEFAULT NULL,
  `prioridad` enum('critica','alta','media','baja') NOT NULL,
  `condicion` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `cooldown_h` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id_log` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `accion` enum('CREATE','UPDATE','DELETE','LOGIN') NOT NULL,
  `id_registro` int(11) DEFAULT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `fecha_accion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `email_contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `tipo_cliente` enum('CORPORATIVO','INTERNO','GENERAL') DEFAULT NULL,
  `ceco_asociado` varchar(20) DEFAULT NULL,
  `id_regional` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_acta_entrega`
--

CREATE TABLE `detalles_acta_entrega` (
  `id_detalle` int(11) NOT NULL,
  `id_acta` int(11) DEFAULT NULL,
  `id_item` int(11) DEFAULT NULL,
  `id_activo` int(11) DEFAULT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `notas_estado` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `epp_asignaciones`
--

CREATE TABLE `epp_asignaciones` (
  `id_asignacion` int(11) NOT NULL,
  `id_activo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `talla` varchar(10) DEFAULT NULL,
  `fecha_entrega` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `id_acta` int(11) DEFAULT NULL,
  `estado` enum('ACTIVO','DEVUELTO','VENCIDO','PERDIDO') DEFAULT 'ACTIVO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `garantias`
--

CREATE TABLE `garantias` (
  `id_garantia` int(11) NOT NULL,
  `id_activo` int(11) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `id_acta_devolucion` int(11) DEFAULT NULL,
  `numero_caso_interno` varchar(50) DEFAULT NULL,
  `rma_proveedor` varchar(50) DEFAULT NULL,
  `numero_factura_compra` varchar(50) DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_limite_estimada` datetime DEFAULT NULL,
  `fecha_recibido_reparado` datetime DEFAULT NULL,
  `credenciales_equipo` varchar(255) DEFAULT NULL,
  `area_origen` varchar(100) DEFAULT NULL,
  `fecha_inicio_garantia` datetime DEFAULT NULL,
  `meses_garantia` int(11) DEFAULT NULL,
  `tipo_resolucion` enum('REPARADO','REEMPLAZADO','SIN_COBERTURA','PENDIENTE') DEFAULT NULL,
  `falla_reportada` text DEFAULT NULL,
  `comentarios_proceso` text DEFAULT NULL,
  `estado_proceso` enum('REGISTRADO','ENVIADO_PROVEEDOR','RECIBIDO_PROVEEDOR','RESUELTO_REEMPLAZADO','ENTREGADO_CLIENTE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_ubicaciones`
--

CREATE TABLE `historial_ubicaciones` (
  `id_historial` int(11) NOT NULL,
  `id_activo` int(11) NOT NULL,
  `ubicacion_desde` varchar(255) NOT NULL,
  `fecha_desde` timestamp NULL DEFAULT current_timestamp(),
  `fecha_hasta` timestamp NULL DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `items`
--

CREATE TABLE `items` (
  `id_item` int(11) NOT NULL,
  `categoria` enum('MONITOREO','MANTENIMIENTO','INSTALACION','SOLUCIONES','EPP','CONSUMIBLE','HERRAMIENTA_LAB','REPUESTO') NOT NULL,
  `sub_categoria` varchar(100) DEFAULT NULL,
  `nombre_equipo` varchar(255) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `codigo_item_interno` varchar(50) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `compra_maxima` int(11) DEFAULT NULL,
  `costo_unitario` decimal(12,2) DEFAULT NULL,
  `moneda` enum('COP','USD','EUR') DEFAULT 'COP',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_activo` int(11) DEFAULT NULL,
  `id_item` int(11) DEFAULT NULL,
  `id_acta` int(11) DEFAULT NULL,
  `tipo_movimiento` enum('ENTRADA_COMPRA','SALIDA_INSTALACION','TRASLADO','DEVOLUCION','BAJA_DAÑO','AJUSTE','INGRESO_DESMONTE') NOT NULL,
  `cantidad` decimal(12,2) DEFAULT NULL,
  `origen` varchar(100) DEFAULT NULL,
  `destino` varchar(100) DEFAULT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT current_timestamp(),
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `dias_credito` int(11) DEFAULT NULL,
  `categoria` enum('FABRICANTE','DISTRIBUIDOR','SERVICIO_TECNICO','LOGISTICA') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id_proyecto` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_regional` int(11) DEFAULT NULL,
  `nombre_proyecto` varchar(200) NOT NULL,
  `centro_costos` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `estado` enum('ACTIVO','FINALIZADO','PAUSADO') DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin_estimada` date DEFAULT NULL,
  `fecha_cierre_real` date DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regionales`
--

CREATE TABLE `regionales` (
  `id_regional` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ciudad` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_usuario`
--

CREATE TABLE `sesiones_usuario` (
  `id_sesion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `revocado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesiones_usuario`
--

INSERT INTO `sesiones_usuario` (`id_sesion`, `id_usuario`, `token_hash`, `ip_origen`, `user_agent`, `created_at`, `expires_at`, `revocado`) VALUES
(1, 1, '8f4e6250dfc4d73ab7b4c9ebb68043a983720bcd6442239a9238bd164e69343d', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 01:33:58', '2026-09-30 01:33:58', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock_bulk`
--

CREATE TABLE `stock_bulk` (
  `id_item` int(11) NOT NULL,
  `cantidad_actual` decimal(12,2) DEFAULT NULL,
  `punto_recompra_alerta` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('ADMIN','TECNICO','TECNICO_LABORATORIO') NOT NULL,
  `id_regional` int(11) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `codigo_empleado` varchar(20) DEFAULT NULL,
  `regional` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `config` varchar(1024) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `password_hash`, `rol`, `id_regional`, `cedula`, `codigo_empleado`, `regional`, `is_active`, `created_at`, `config`, `avatar_url`) VALUES
(1, 'Administrador SIGAI', 'admin@securitas.com', '$2b$12$DxQQTG4mhXohJkinA88DUea06BQsVAfQ92MugQin0/9obQshx4Xly', 'ADMIN', NULL, '0000000000', 'ADM001', 'Nacional', 1, '2026-09-23 01:31:05', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actas_entrega`
--
ALTER TABLE `actas_entrega`
  ADD PRIMARY KEY (`id_acta`),
  ADD UNIQUE KEY `numero_acta` (`numero_acta`),
  ADD KEY `id_usuario_tecnico` (`id_usuario_tecnico`),
  ADD KEY `id_usuario_representante` (`id_usuario_representante`),
  ADD KEY `id_proyecto` (`id_proyecto`),
  ADD KEY `id_regional` (`id_regional`),
  ADD KEY `ix_actas_entrega_id_acta` (`id_acta`);

--
-- Indices de la tabla `activos`
--
ALTER TABLE `activos`
  ADD PRIMARY KEY (`id_activo`),
  ADD UNIQUE KEY `serial` (`serial`),
  ADD KEY `id_item` (`id_item`),
  ADD KEY `id_proyecto_actual` (`id_proyecto_actual`),
  ADD KEY `id_cliente_actual` (`id_cliente_actual`),
  ADD KEY `id_proveedor_compra` (`id_proveedor_compra`),
  ADD KEY `ix_activos_id_activo` (`id_activo`);

--
-- Indices de la tabla `alembic_version`
--
ALTER TABLE `alembic_version`
  ADD PRIMARY KEY (`version_num`);

--
-- Indices de la tabla `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `asignado_a` (`asignado_a`),
  ADD KEY `ix_alerts_id` (`id`);

--
-- Indices de la tabla `alert_rules`
--
ALTER TABLE `alert_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_alert_rules_id` (`id`);

--
-- Indices de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `ix_audit_logs_id_log` (`id_log`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `nit` (`nit`),
  ADD KEY `id_regional` (`id_regional`),
  ADD KEY `ix_clientes_id_cliente` (`id_cliente`);

--
-- Indices de la tabla `detalles_acta_entrega`
--
ALTER TABLE `detalles_acta_entrega`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_acta` (`id_acta`),
  ADD KEY `id_item` (`id_item`),
  ADD KEY `id_activo` (`id_activo`),
  ADD KEY `ix_detalles_acta_entrega_id_detalle` (`id_detalle`);

--
-- Indices de la tabla `epp_asignaciones`
--
ALTER TABLE `epp_asignaciones`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD KEY `id_activo` (`id_activo`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_acta` (`id_acta`),
  ADD KEY `ix_epp_asignaciones_id_asignacion` (`id_asignacion`);

--
-- Indices de la tabla `garantias`
--
ALTER TABLE `garantias`
  ADD PRIMARY KEY (`id_garantia`),
  ADD UNIQUE KEY `numero_caso_interno` (`numero_caso_interno`),
  ADD KEY `id_activo` (`id_activo`),
  ADD KEY `id_proveedor` (`id_proveedor`),
  ADD KEY `id_acta_devolucion` (`id_acta_devolucion`),
  ADD KEY `ix_garantias_id_garantia` (`id_garantia`);

--
-- Indices de la tabla `historial_ubicaciones`
--
ALTER TABLE `historial_ubicaciones`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_activo` (`id_activo`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `ix_historial_ubicaciones_id_historial` (`id_historial`);

--
-- Indices de la tabla `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id_item`),
  ADD UNIQUE KEY `referencia` (`referencia`),
  ADD UNIQUE KEY `codigo_item_interno` (`codigo_item_interno`),
  ADD KEY `ix_items_id_item` (`id_item`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_activo` (`id_activo`),
  ADD KEY `id_item` (`id_item`),
  ADD KEY `id_acta` (`id_acta`),
  ADD KEY `ix_movimientos_inventario_id_movimiento` (`id_movimiento`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `nit` (`nit`),
  ADD KEY `ix_proveedores_id_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id_proyecto`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_regional` (`id_regional`),
  ADD KEY `ix_proyectos_id_proyecto` (`id_proyecto`);

--
-- Indices de la tabla `regionales`
--
ALTER TABLE `regionales`
  ADD PRIMARY KEY (`id_regional`),
  ADD KEY `ix_regionales_id_regional` (`id_regional`);

--
-- Indices de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD PRIMARY KEY (`id_sesion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `ix_sesiones_usuario_token_hash` (`token_hash`),
  ADD KEY `ix_sesiones_usuario_id_sesion` (`id_sesion`);

--
-- Indices de la tabla `stock_bulk`
--
ALTER TABLE `stock_bulk`
  ADD PRIMARY KEY (`id_item`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `ix_usuarios_email` (`email`),
  ADD UNIQUE KEY `ix_usuarios_codigo_empleado` (`codigo_empleado`),
  ADD UNIQUE KEY `ix_usuarios_cedula` (`cedula`),
  ADD KEY `id_regional` (`id_regional`),
  ADD KEY `ix_usuarios_id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actas_entrega`
--
ALTER TABLE `actas_entrega`
  MODIFY `id_acta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `activos`
--
ALTER TABLE `activos`
  MODIFY `id_activo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alert_rules`
--
ALTER TABLE `alert_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalles_acta_entrega`
--
ALTER TABLE `detalles_acta_entrega`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `epp_asignaciones`
--
ALTER TABLE `epp_asignaciones`
  MODIFY `id_asignacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `garantias`
--
ALTER TABLE `garantias`
  MODIFY `id_garantia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_ubicaciones`
--
ALTER TABLE `historial_ubicaciones`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `items`
--
ALTER TABLE `items`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id_proyecto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `regionales`
--
ALTER TABLE `regionales`
  MODIFY `id_regional` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `id_sesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actas_entrega`
--
ALTER TABLE `actas_entrega`
  ADD CONSTRAINT `actas_entrega_ibfk_1` FOREIGN KEY (`id_usuario_tecnico`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `actas_entrega_ibfk_2` FOREIGN KEY (`id_usuario_representante`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `actas_entrega_ibfk_3` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  ADD CONSTRAINT `actas_entrega_ibfk_4` FOREIGN KEY (`id_regional`) REFERENCES `regionales` (`id_regional`);

--
-- Filtros para la tabla `activos`
--
ALTER TABLE `activos`
  ADD CONSTRAINT `activos_ibfk_1` FOREIGN KEY (`id_item`) REFERENCES `items` (`id_item`),
  ADD CONSTRAINT `activos_ibfk_2` FOREIGN KEY (`id_proyecto_actual`) REFERENCES `proyectos` (`id_proyecto`),
  ADD CONSTRAINT `activos_ibfk_3` FOREIGN KEY (`id_cliente_actual`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `activos_ibfk_4` FOREIGN KEY (`id_proveedor_compra`) REFERENCES `proveedores` (`id_proveedor`);

--
-- Filtros para la tabla `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id_item`),
  ADD CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_regional`) REFERENCES `regionales` (`id_regional`);

--
-- Filtros para la tabla `detalles_acta_entrega`
--
ALTER TABLE `detalles_acta_entrega`
  ADD CONSTRAINT `detalles_acta_entrega_ibfk_1` FOREIGN KEY (`id_acta`) REFERENCES `actas_entrega` (`id_acta`),
  ADD CONSTRAINT `detalles_acta_entrega_ibfk_2` FOREIGN KEY (`id_item`) REFERENCES `items` (`id_item`),
  ADD CONSTRAINT `detalles_acta_entrega_ibfk_3` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`);

--
-- Filtros para la tabla `epp_asignaciones`
--
ALTER TABLE `epp_asignaciones`
  ADD CONSTRAINT `epp_asignaciones_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  ADD CONSTRAINT `epp_asignaciones_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `epp_asignaciones_ibfk_3` FOREIGN KEY (`id_acta`) REFERENCES `actas_entrega` (`id_acta`);

--
-- Filtros para la tabla `garantias`
--
ALTER TABLE `garantias`
  ADD CONSTRAINT `garantias_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  ADD CONSTRAINT `garantias_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  ADD CONSTRAINT `garantias_ibfk_3` FOREIGN KEY (`id_acta_devolucion`) REFERENCES `actas_entrega` (`id_acta`);

--
-- Filtros para la tabla `historial_ubicaciones`
--
ALTER TABLE `historial_ubicaciones`
  ADD CONSTRAINT `historial_ubicaciones_ibfk_1` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  ADD CONSTRAINT `historial_ubicaciones_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`id_activo`) REFERENCES `activos` (`id_activo`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_3` FOREIGN KEY (`id_item`) REFERENCES `items` (`id_item`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_4` FOREIGN KEY (`id_acta`) REFERENCES `actas_entrega` (`id_acta`);

--
-- Filtros para la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`id_regional`) REFERENCES `regionales` (`id_regional`);

--
-- Filtros para la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD CONSTRAINT `sesiones_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `stock_bulk`
--
ALTER TABLE `stock_bulk`
  ADD CONSTRAINT `stock_bulk_ibfk_1` FOREIGN KEY (`id_item`) REFERENCES `items` (`id_item`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_regional`) REFERENCES `regionales` (`id_regional`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
