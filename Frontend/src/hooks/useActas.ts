import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActas, saveActa } from "../services/business";

interface ActaPayload {
  numero_acta?: string | null;
  estado_acta?: string;
  id_usuario_tecnico: number;
  id_usuario_representante: number;
  id_proyecto?: number | null;
  id_cliente?: number | null;
  id_regional?: number | null;
  tipo_acta: string;
  observaciones?: string;
  detalles?: {
    id_item: number;
    id_activo?: number | null;
    cantidad: number;
    notas_estado?: string;
  }[];
}

export const useActas = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: ["actas", page, pageSize],
    queryFn: () => getActas(page, pageSize),
  });
};

export const useSaveActa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ActaPayload) => saveActa(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["actas"], refetchType: "all" }),
  });
};
