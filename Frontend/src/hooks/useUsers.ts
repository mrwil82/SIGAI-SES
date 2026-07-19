import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../services/users';

export const useUsers = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};
