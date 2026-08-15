import type { QueryClient } from "@tanstack/react-query";
import {
  getClientes,
  getProyectos,
  getProveedores,
  getGarantias,
} from "../services/business";
import { getRegionales } from "../services/regionales";
import { getDashboardAlerts } from "../services/alerts";
import {
  getDashboardStats,
  getPredictions,
  getInventorySummary,
} from "../services/analytics";

const MASTER_STALE_TIME = Infinity;
const LIVE_STALE_TIME = 15 * 60 * 1000;

type PrefetchEntry = {
  key: readonly unknown[];
  fn: () => Promise<unknown>;
  staleTime?: number;
};

const PREFETCHES: PrefetchEntry[] = [
  // Maestros ligeros: se descargan 1 vez por sesion y solo se re-fetchean
  // al invalidar (mutaciones) o cuando el modulo vuelve a montarse.
  { key: ["clientes", 0, 1000], fn: () => getClientes(0, 1000) },
  { key: ["proyectos", 0, 1000], fn: () => getProyectos(0, 1000) },
  { key: ["proveedores"], fn: () => getProveedores() },
  { key: ["regionales"], fn: () => getRegionales() },
  { key: ["garantias"], fn: () => getGarantias() },
  // Dashboard: se refrescan en segundo plano al volver al modulo
  { key: ["dashboardStats", "hoy"], fn: () => getDashboardStats("hoy"), staleTime: LIVE_STALE_TIME },
  { key: ["predictions"], fn: () => getPredictions(), staleTime: LIVE_STALE_TIME },
  { key: ["inventorySummary"], fn: () => getInventorySummary(), staleTime: LIVE_STALE_TIME },
  { key: ["alertsSummary"], fn: () => getDashboardAlerts(), staleTime: LIVE_STALE_TIME },
];

export const prefetchAllData = (queryClient: QueryClient) => {
  for (const entry of PREFETCHES) {
    void queryClient.prefetchQuery({
      queryKey: entry.key,
      queryFn: async () => entry.fn(),
      staleTime: entry.staleTime ?? MASTER_STALE_TIME,
    });
  }
};
