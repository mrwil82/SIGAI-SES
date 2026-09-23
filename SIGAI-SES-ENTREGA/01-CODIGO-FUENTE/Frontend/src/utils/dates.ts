const TZ_RE = /(Z|[+-]\d{2}:?\d{2})$/;

/** Parsea una fecha que proviene del servidor.
 * Las fechas generadas por el backend/BD se guardan en UTC pero llegan al
 * navegador sin marca de zona horaria. Si no traen zona, se asumen UTC para
 * que al convertirlas a la hora local del usuario muestren el valor correcto.
 */
export function parseServerDate(
  value: string | null | undefined,
): Date | null {
  if (!value || !value.trim()) return null;
  const str = value.trim();
  try {
    const normalized = TZ_RE.test(str) ? str : `${str}Z`;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatServerDateTime(
  value: string | null | undefined,
  locale = "es-CO",
): string {
  const d = parseServerDate(value);
  if (!d) return value ? value : "---";
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatServerDate(
  value: string | null | undefined,
  locale = "es-CO",
): string {
  const d = parseServerDate(value);
  if (!d) return value ? value : "---";
  return d.toLocaleDateString(locale);
}
