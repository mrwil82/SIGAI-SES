import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getClienteById,
} from "../services/business";

export interface ClientePayload {
  nombre: string;
  nit?: string;
  contacto?: string;
  email_contacto?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  tipo_cliente?: string;
  ceco_asociado?: string;
}

export const useClientes = (page = 1, pageSize = 500) => {
  return useQuery({
    queryKey: ["clientes", page, pageSize],
    queryFn: () => getClientes(page, pageSize),
  });
};

export const useClienteById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: () => getClienteById(id!),
    enabled: !!id,
  });
};

export const useCreateCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientePayload) => createCliente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
};

export const useUpdateCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientePayload> }) =>
      updateCliente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
};

export const useDeleteCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
};
