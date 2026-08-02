import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface AlertParams {
  estado?: string;
  page?: number;
  page_size?: number;
}

interface AlertCreatePayload {
  tipo: string;
  titulo: string;
  descripcion?: string;
  prioridad?: string;
  estado?: string;
  valor_actual?: number;
  valor_umbral?: number;
  asignado_a?: number;
  item_id?: number;
}

interface AlertUpdatePayload {
  estado?: string;
  notas?: string;
  titulo?: string;
  prioridad?: string;
  valor_actual?: number;
  solucion?: string;
  asignado_a?: number;
}

export const useAlerts = (params: AlertParams = {}) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const response = await api.get('/alerts/', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AlertCreatePayload) => api.post('/alerts/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
};

export const useUpdateAlertEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AlertUpdatePayload }) =>
      api.patch(`/alerts/${id}/estado`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
};

export const useDeleteAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/alerts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
};
