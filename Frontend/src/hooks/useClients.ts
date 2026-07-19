import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientes, createCliente, updateCliente, deleteCliente, getClienteById } from '../services/business';

export const useClientes = (skip = 0, limit = 1000) => {
  return useQuery({
    queryKey: ['clientes', skip, limit],
    queryFn: () => getClientes(skip, limit),
  });
};

export const useClienteById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => getClienteById(id!),
    enabled: !!id,
  });
};

export const useCreateCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createCliente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};

export const useUpdateCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCliente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};

export const useDeleteCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};
