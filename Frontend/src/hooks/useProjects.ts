import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProyectos, getProyectoById, createProyecto, updateProyecto, deleteProyecto } from '../services/business';

export const useProyectos = (skip = 0, limit = 1000) => {
  return useQuery({
    queryKey: ['proyectos', skip, limit],
    queryFn: () => getProyectos(skip, limit),
  });
};

export const useProyectoById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['proyecto', id],
    queryFn: () => getProyectoById(id!),
    enabled: !!id,
  });
};

export const useCreateProyecto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createProyecto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proyectos'] }),
  });
};

export const useUpdateProyecto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProyecto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proyectos'] }),
  });
};

export const useDeleteProyecto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProyecto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proyectos'] }),
  });
};
