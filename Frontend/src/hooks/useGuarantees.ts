import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGarantias, getGarantiaById, createGarantia, updateGarantia, deleteGarantia } from '../services/business';

export const useGarantias = () => {
  return useQuery({
    queryKey: ['garantias'],
    queryFn: () => getGarantias(),
  });
};

export const useGarantiaById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['garantia', id],
    queryFn: () => getGarantiaById(id!),
    enabled: !!id,
  });
};

export const useCreateGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createGarantia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garantias'] }),
  });
};

export const useUpdateGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateGarantia(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garantias'] }),
  });
};

export const useDeleteGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGarantia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garantias'] }),
  });
};
