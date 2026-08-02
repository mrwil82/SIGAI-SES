import { useQuery } from "@tanstack/react-query";
import { getDashboardAlerts } from "../services/alerts";

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ["alertsSummary"],
    queryFn: () => getDashboardAlerts(),
    staleTime: 5 * 60 * 1000,
  });
};
