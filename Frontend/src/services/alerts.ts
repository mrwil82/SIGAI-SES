import api from './api';

export const getDashboardAlerts = async () => {
  const response = await api.get('/alerts/summary');
  return response.data;
};
