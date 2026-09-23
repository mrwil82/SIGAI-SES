/**
 * Utilidades para manejo de errores de API
 * Extrae mensajes legibles de errores de validación Pydantic (FastAPI)
 */

export interface ApiErrorResponse {
  detail?: string | PydanticError[];
}

export interface PydanticError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

/**
 * Extrae mensaje de error legible de respuesta de API
 * Maneja tanto strings simples como arrays de errores Pydantic
 */
export function extractErrorMessage(error: unknown, fallback?: string): string {
  const apiError = error as { response?: { data?: ApiErrorResponse } };
  const rawDetail = apiError.response?.data?.detail;

  if (typeof rawDetail === "string") {
    return rawDetail;
  }

  if (Array.isArray(rawDetail)) {
    return rawDetail.map((e) => e.msg).join(", ");
  }

  return fallback ?? "Error inesperado. Intente de nuevo.";
}

/**
 * Tipo para errores de Axios con estructura conocida
 */
export interface AxiosApiError {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

/**
 * Type guard para verificar si es un error de Axios con response
 */
export function isAxiosApiError(error: unknown): error is AxiosApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as AxiosApiError).response === "object"
  );
}
