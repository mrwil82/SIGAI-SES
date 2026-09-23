import type { QueryClient } from "@tanstack/react-query";
import {
  getClientes,
  getProyectos,
  getProveedores,
  getGarantias,
} from "../services/business";
import { getRegionales } from "../services/regionales";
import { getDashboardAlerts } from "../services/alerts";
import { getDashboardStats, getPredictions } from "../services/analytics";

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
  { key: ["clientes", 1, 500], fn: () => getClientes(1, 500) },
  { key: ["proyectos", 1, 500], fn: () => getProyectos(1, 500) },
  { key: ["proveedores"], fn: () => getProveedores() },
  { key: ["regionales"], fn: () => getRegionales() },
  { key: ["garantias", 1, 50], fn: () => getGarantias(1, 50) },
  // Dashboard: se refrescan en segundo plano al volver al modulo
  { key: ["dashboardStats", "hoy"], fn: () => getDashboardStats("hoy"), staleTime: LIVE_STALE_TIME },
  { key: ["predictions"], fn: () => getPredictions(), staleTime: LIVE_STALE_TIME },
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
