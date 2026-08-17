export const AUDIT_IGNORE = new Set([
  "created_at",
  "updated_at",
  "deleted_at",
  "__class__",
  "id_registro",
  "password_hash",
]);

export const AUDIT_LABELS: Record<string, string> = {
  archivo: "Archivo",
  tipo_detectado: "Tipo",
  resultado: "Resultado",
  nombre: "Nombre",
  nombre_proyecto: "Proyecto",
  nombre_equipo: "Equipo",
  id_regional: "Regional",
  centro_costos: "Centro de costos",
  descripcion: "Descripción",
  serial: "Serial",
  estado: "Estado",
  estado_actual: "Estado",
  condicion_fisica: "Condición",
  ubicacion_fisica: "Ubicación",
  area_asignada: "Área",
  marca: "Marca",
  modelo: "Modelo",
  referencia: "Referencia",
  categoria: "Categoría",
  sub_categoria: "Subcategoría",
  cantidad_actual: "Cantidad",
  stock_minimo: "Stock mínimo",
  email: "Email",
  email_contacto: "Email",
  telefono: "Teléfono",
  contacto: "Contacto",
  nit: "NIT",
  direccion: "Dirección",
  ciudad: "Ciudad",
  departamento: "Departamento",
  tipo_cliente: "Tipo cliente",
  ceco_asociado: "CECO",
  rol: "Rol",
  avatar_url: "Avatar",
  password_changed: "Contraseña",
  fecha_inicio: "Inicio",
  fecha_fin_estimada: "Fin estimado",
  cliente: "Cliente",
  proveedor: "Proveedor",
  numero_caso_interno: "N° caso",
  rma_proveedor: "RMA",
  falla_reportada: "Falla",
  area_origen: "Área",
  numero_factura_compra: "Factura",
  dias_credito: "Días crédito",
  garantias: "Garantías",
  items: "Ítems",
  items_stock: "Ítems stock",
  activos: "Activos",
  clientes: "Clientes",
  proyectos: "Proyectos",
  actualizados: "Actualizados",
};

const RESULT_LABELS: Record<string, string> = {
  garantias: "garantías",
  items: "ítems",
  items_stock: "ítems stock",
  activos: "activos",
  clientes: "clientes",
  proyectos: "proyectos",
  actualizados: "actualizados",
};

export function parseAuditJson(
  data: string | null,
): Record<string, unknown> | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface AuditEntry {
  key: string;
  label: string;
  value: string;
}

export function auditEntries(data: string | null): AuditEntry[] {
  const parsed = parseAuditJson(data);
  if (!parsed) return [];
  return Object.entries(parsed)
    .filter(
      ([key, val]) =>
        val !== null &&
        val !== undefined &&
        val !== "" &&
        !AUDIT_IGNORE.has(key),
    )
    .map(([key, val]) => ({
      key,
      label: AUDIT_LABELS[key] || humanizeKey(key),
      value: String(val),
    }));
}

function truncate(s: string, max = 28): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function formatResultado(res: unknown): string {
  if (!res || typeof res !== "object") return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(res as Record<string, unknown>)) {
    const label = RESULT_LABELS[k];
    if (label && Number(v) > 0) parts.push(`${v} ${label}`);
  }
  return parts.join(", ");
}

const TECHNICAL_KEYS = new Set([
  "id_regional",
  "centro_costos",
  "id_proyecto",
  "id_cliente",
  "id_activo",
  "id_item",
  "id_proveedor",
  "id_usuario",
  "id_log",
  "updated_at",
  "created_at",
  "deleted_at",
]);

const PREFERRED_FIELD: Record<string, string[]> = {
  proyectos: ["nombre_proyecto", "nombre"],
  clientes: ["nombre", "nit"],
  proveedores: ["nombre", "nit"],
  usuarios: ["nombre", "email"],
  activos: ["serial", "nombre_equipo", "descripcion"],
  items: ["nombre_equipo", "nombre", "referencia"],
  garantias: ["numero_caso_interno", "serial", "falla_reportada"],
  movimientos_inventario: ["tipo_movimiento", "origen", "destino"],
  actas_entrega: ["numero_acta", "consecutivo"],
};

export function formatActivityDetail(
  data: string | null,
  tabla?: string,
): string {
  const parsed = parseAuditJson(data);
  if (!parsed) return "---";

  if (tabla === "importacion_datos") {
    const archivo = String(parsed.archivo ?? "").trim();
    const resumen = formatResultado(parsed.resultado);
    const base = archivo ? `Carga ${archivo}` : "Carga de datos";
    return resumen ? `${base} → ${resumen}` : base;
  }

  // Frases humanas para acciones puntuales
  if (tabla === "usuarios") {
    if (parsed.avatar_url) return "Avatar actualizado";
    if (parsed.password_changed === true) return "Contraseña actualizada";
  }

  // Campo preferido según la tabla (ej. "Proyecto: TERRANVM")
  const preferred = PREFERRED_FIELD[tabla || ""] || [];
  for (const key of preferred) {
    const val = parsed[key];
    if (val !== null && val !== undefined && val !== "") {
      return `${AUDIT_LABELS[key] || humanizeKey(key)}: ${String(val).slice(0, 40)}`;
    }
  }

  // Fallback: primeros 2 campos no técnicos
  const entries = auditEntries(data).filter(
    (e) => !TECHNICAL_KEYS.has(e.key) && e.value.length <= 60,
  );
  if (entries.length === 0) return "Cambios registrados";
  return entries
    .slice(0, 2)
    .map((e) => `${e.label}: ${truncate(e.value)}`)
    .join(", ");
}
