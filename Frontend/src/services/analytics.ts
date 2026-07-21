import api from './api';

export const getDashboardStats = async (timeRange: string = 'hoy') => {
  const response = await api.get(`/analytics/summary?time_range=${timeRange}`);
  return response.data;
};

export const getInventorySummary = async () => {
  const response = await api.get('/analytics/inventory-summary');
  return response.data;
};

export const getUserActivity = async () => {
  const response = await api.get('/analytics/user-activity');
  return response.data;
};

export const globalSearch = async (query: string) => {
  if (!query || query.length < 2) return [];
  const response = await api.get(`/analytics/search?q=${encodeURIComponent(query)}`);
  return response.data;
};
