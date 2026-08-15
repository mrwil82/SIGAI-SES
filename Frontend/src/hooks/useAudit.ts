import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../services/users";

export const useAuditLogs = (
  page = 1,
  pageSize = 50,
  search?: string,
  accion?: string,
) => {
  return useQuery({
    queryKey: ["audit", page, pageSize, search || "", accion || ""],
    queryFn: () => getAuditLogs(page, pageSize, search, accion),
    staleTime: 15 * 60 * 1000,
  });
};
