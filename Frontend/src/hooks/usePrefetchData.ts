import type { QueryClient } from "@tanstack/react-query";
import {
  getClientes,
  getProyectos,
  getProveedores,
  getGarantias,
  getActas,
} from "../services/business";
import { getRegionales } from "../services/regionales";
import { getUsers, getAuditLogs } from "../services/users";
import { getInventoryItems, getActivos } from "../services/inventory";
import { getActivosParaTriaje } from "../services/desmontes";
import { getDashboardAlerts } from "../services/alerts";
import {
  getDashboardStats,
  getPredictions,
  getInventorySummary,
  getUserActivity,
} from "../services/analytics";
import api from "../services/api";

const MASTER_STALE_TIME = Infinity;
const LIVE_STALE_TIME = 5 * 60 * 1000;

type PrefetchEntry = {
  key: readonly unknown[];
  fn: () => Promise<unknown>;
  staleTime?: number;
};

const PREFETCHES: PrefetchEntry[] = [
  // Maestros: solo se re-fetchean al invalidar (mutaciones)
  { key: ["clientes", 0, 1000], fn: () => getClientes(0, 1000) },
  { key: ["clientes", 0, 100], fn: () => getClientes(0, 100) },
  { key: ["proyectos", 0, 1000], fn: () => getProyectos(0, 1000) },
  { key: ["proyectos", 0, 100], fn: () => getProyectos(0, 100) },
  { key: ["proveedores"], fn: () => getProveedores() },
  { key: ["regionales"], fn: () => getRegionales() },
  { key: ["garantias"], fn: () => getGarantias() },
  { key: ["users", 1, 50], fn: () => getUsers(1, 50) },
  { key: ["users", 1, 1000], fn: () => getUsers(1, 1000) },
  { key: ["actas", 1, 50], fn: () => getActas(1, 50) },
  {
    key: ["inventory", 0, 50, "", 0, false],
    fn: () => getInventoryItems(0, 50, "", undefined, false),
  },
  { key: ["inventoryItems"], fn: () => getInventoryItems(0, 5000, undefined, true) },
  { key: ["activos", 1, 500], fn: () => getActivos(1, 500) },
  { key: ["triaje"], fn: () => getActivosParaTriaje() },
  // Tiempo sensible: se refrescan en segundo plano
  { key: ["dashboardStats", "hoy"], fn: () => getDashboardStats("hoy"), staleTime: LIVE_STALE_TIME },
  { key: ["predictions"], fn: () => getPredictions(), staleTime: LIVE_STALE_TIME },
  { key: ["inventorySummary"], fn: () => getInventorySummary(), staleTime: LIVE_STALE_TIME },
  { key: ["userActivity"], fn: () => getUserActivity(), staleTime: LIVE_STALE_TIME },
  { key: ["alertsSummary"], fn: () => getDashboardAlerts(), staleTime: LIVE_STALE_TIME },
  {
    key: ["audit", 1, 50, "", ""],
    fn: () => getAuditLogs(1, 50),
    staleTime: LIVE_STALE_TIME,
  },
  {
    key: ["alerts", { estado: "activa", page: 1, page_size: 50 }],
    fn: () =>
      api
        .get("/alerts/", { params: { estado: "activa", page: 1, page_size: 50 } })
        .then((r) => r.data),
    staleTime: LIVE_STALE_TIME,
  },
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
