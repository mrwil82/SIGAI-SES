import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProveedores, createProveedor } from "../services/business";

interface ProveedorPayload {
  nombre: string;
  nit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  dias_credito?: number;
  categoria?: string;
}

export const useProveedores = () => {
  return useQuery({
    queryKey: ["proveedores"],
    queryFn: () => getProveedores(),
  });
};

export const useCreateProveedor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProveedorPayload) => createProveedor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  });
};
