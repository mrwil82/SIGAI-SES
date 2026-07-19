import api from './api';

export const getRegionales = async () => {
  const response = await api.get('/regionales/');
  return response.data;
};
