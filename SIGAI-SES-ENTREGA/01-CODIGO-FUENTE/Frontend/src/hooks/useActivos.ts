import { useQuery } from "@tanstack/react-query";
import { getActivos, getInventoryItems } from "../services/inventory";

export const useActivos = (page = 1, pageSize = 500) => {
  return useQuery({
    queryKey: ["activos", page, pageSize],
    queryFn: () => getActivos(page, pageSize),
  });
};

export const useInventoryItems = () => {
  return useQuery({
    queryKey: ["inventoryItems"],
    queryFn: () => getInventoryItems(0, 5000, undefined, true),
  });
};
