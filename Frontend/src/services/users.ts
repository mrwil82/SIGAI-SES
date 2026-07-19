import api from './api';

export const getAuditLogs = async (page = 1, pageSize = 50, search?: string, accion?: string) => {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (search) params.search = search;
  if (accion) params.accion = accion;
  const response = await api.get('/users/audit', { params });
  return response.data;
};

export const checkUniqueField = async (field: string, value: string, excludeId?: number) => {
  const params: Record<string, any> = { field, value };
  if (excludeId) params.exclude_id = excludeId;
  const response = await api.get('/users/check-unique', { params });
  return response.data;
};

export const getUsers = async (page = 1, pageSize = 50) => {
  const response = await api.get('/users/', { params: { page, page_size: pageSize } });
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getMySettings = async () => {
  const response = await api.get('/users/me/settings');
  return response.data;
};

export const updateMySettings = async (settings: any) => {
  const response = await api.put('/users/me/settings', settings);
  return response.data;
};

export const uploadAvatar = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const response = await api.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const changeMyPassword = async (current: string, newPassword: string) => {
  const response = await api.put('/users/me/password', { current_password: current, new_password: newPassword });
  return response.data;
};
