import api from "./api";

export const getDashboardAlerts = async () => {
  const response = await api.get("/alerts/summary");
  return response.data;
};

export const getActiveAlerts = async (pageSize = 20) => {
  const response = await api.get("/alerts", {
    params: { estado: "activa", page: 1, page_size: pageSize },
  });
  return response.data?.items || [];
};
