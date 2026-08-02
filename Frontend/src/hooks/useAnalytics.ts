import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getPredictions,
  getInventorySummary,
  getUserActivity,
} from "../services/analytics";

export const useDashboardStats = (timeRange = "hoy") => {
  return useQuery({
    queryKey: ["dashboardStats", timeRange],
    queryFn: () => getDashboardStats(timeRange),
  });
};

export const usePredictions = () => {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: () => getPredictions(),
  });
};

export const useInventorySummary = () => {
  return useQuery({
    queryKey: ["inventorySummary"],
    queryFn: () => getInventorySummary(),
  });
};

export const useUserActivity = () => {
  return useQuery({
    queryKey: ["userActivity"],
    queryFn: () => getUserActivity(),
  });
};
