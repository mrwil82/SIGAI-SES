import axios from 'axios';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  validationErrors?: Record<string, string[]>;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    const dataObj = data !== null && typeof data === 'object' ? data as Record<string, unknown> : undefined;

    if (!error.response) {
      return {
        status: 0,
        message: 'Error de conexion con el servidor',
        detail: 'Verifique su conexion a internet',
      };
    }

    if (status === 422 && dataObj?.detail) {
      const validationErrors: Record<string, string[]> = {};
      if (Array.isArray(dataObj.detail)) {
        for (const err of dataObj.detail) {
          const errObj = err !== null && typeof err === 'object' ? err as Record<string, unknown> : {};
          const loc = Array.isArray(errObj.loc) ? errObj.loc.slice(1).join('.') : 'general';
          const field = loc || 'general';
          if (!validationErrors[field]) validationErrors[field] = [];
          validationErrors[field].push(String(errObj.msg || ''));
        }
      }
      return {
        status,
        message: 'Error de validacion',
        detail: 'Revise los campos del formulario',
        validationErrors,
      };
    }

    return {
      status,
      message: (typeof dataObj?.detail === 'string' ? dataObj.detail : dataObj?.message as string | undefined) || `Error ${status}`,
      detail: typeof dataObj?.detail === 'string' ? dataObj.detail : undefined,
    };
  }

  if (error instanceof Error) {
    return { status: -1, message: error.message };
  }

  return { status: -1, message: 'Error desconocido' };
}

export function getErrorMessage(error: unknown): string {
  return extractApiError(error).message;
}