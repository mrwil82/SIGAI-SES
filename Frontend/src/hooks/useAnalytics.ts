import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getPredictions,
  getInventorySummary,
  getUserActivity,
} from "../services/analytics";

const LIVE_STALE_TIME = 5 * 60 * 1000;

export const useDashboardStats = (timeRange = "hoy") => {
  return useQuery({
    queryKey: ["dashboardStats", timeRange],
    queryFn: () => getDashboardStats(timeRange),
    staleTime: LIVE_STALE_TIME,
  });
};

export const usePredictions = () => {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: () => getPredictions(),
    staleTime: LIVE_STALE_TIME,
  });
};

export const useInventorySummary = () => {
  return useQuery({
    queryKey: ["inventorySummary"],
    queryFn: () => getInventorySummary(),
    staleTime: LIVE_STALE_TIME,
  });
};

export const useUserActivity = () => {
  return useQuery({
    queryKey: ["userActivity"],
    queryFn: () => getUserActivity(),
    staleTime: LIVE_STALE_TIME,
  });
};
