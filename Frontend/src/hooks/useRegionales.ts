import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRegionales,
  createRegional,
  updateRegional,
  deleteRegional,
} from "../services/regionales";

interface RegionalPayload {
  nombre: string;
  ciudad?: string;
}

export const useRegionales = () => {
  return useQuery({
    queryKey: ["regionales"],
    queryFn: () => getRegionales(),
  });
};

export const useCreateRegional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegionalPayload) => createRegional(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regionales"] }),
  });
};

export const useUpdateRegional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<RegionalPayload>;
    }) => updateRegional(id, { nombre: data.nombre || "", ciudad: data.ciudad }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regionales"] }),
  });
};

export const useDeleteRegional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRegional(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regionales"] }),
  });
};
