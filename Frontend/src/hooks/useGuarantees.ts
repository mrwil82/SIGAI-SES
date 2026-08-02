import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGarantias,
  getGarantiaById,
  createGarantia,
  updateGarantia,
  deleteGarantia,
} from "../services/business";

interface GarantiaPayload {
  id_activo: number;
  id_proveedor?: number;
  id_acta_devolucion?: number;
  numero_caso_interno?: string;
  rma_proveedor?: string;
  numero_factura_compra?: string;
  fecha_envio?: string;
  fecha_limite_estimada?: string;
  fecha_inicio_garantia?: string;
  meses_garantia?: number;
  credenciales_equipo?: string;
  area_origen?: string;
  tipo_resolucion?: string;
  falla_reportada?: string;
  comentarios_proceso?: string;
  estado_proceso?: string;
}

export const useGarantias = () => {
  return useQuery({
    queryKey: ["garantias"],
    queryFn: () => getGarantias(),
  });
};

export const useGarantiaById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["garantia", id],
    queryFn: () => getGarantiaById(id!),
    enabled: !!id,
  });
};

export const useCreateGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GarantiaPayload) => createGarantia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["garantias"] }),
  });
};

export const useUpdateGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GarantiaPayload> }) =>
      updateGarantia(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["garantias"] }),
  });
};

export const useDeleteGarantia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGarantia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["garantias"] }),
  });
};
