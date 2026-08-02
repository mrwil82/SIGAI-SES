import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivosParaTriaje,
  actualizarTriajeActivo,
  deleteActivo,
} from "../services/desmontes";
import { crearDesmonteBulk } from "../services/inventory";

export const useActivosTriaje = () => {
  return useQuery({
    queryKey: ["triaje"],
    queryFn: () => getActivosParaTriaje(),
  });
};

export const useActualizarTriaje = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { calificacion_tecnica: string; observaciones?: string };
    }) => actualizarTriajeActivo(id, { ...data, observaciones: data.observaciones || "" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["triaje"] }),
  });
};

export const useCrearDesmonteBulk = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      items: { id_item: number; cantidad: number }[];
      id_proyecto?: number;
      id_cliente?: number;
    }) => crearDesmonteBulk(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["triaje"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["activos"] });
    },
  });
};

export const useDeleteActivoTriaje = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteActivo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["triaje"] }),
  });
};
