import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface AlertParams {
  estado?: string;
  page?: number;
  page_size?: number;
}

export const useAlerts = (params: AlertParams = {}) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const response = await api.get('/alerts/', { params });
      return response.data;
    },
  });
};

export const useCreateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/alerts/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
};

export const useUpdateAlertEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
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
