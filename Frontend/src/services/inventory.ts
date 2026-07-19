import api from './api';

export const getInventoryItems = async (skip: number, limit: number, search?: string, allResults?: boolean, includeDeleted?: boolean) => {
  const params: Record<string, string> = {
    page: String(Math.floor(skip / Math.max(1, limit)) + 1),
    page_size: String(Math.min(Math.max(1, limit), 500)),
  };
  if (allResults || search) {
    params.all_results = 'true';
  }
  if (search) {
    params.search = search;
  }
  if (includeDeleted) {
    params.include_deleted = 'true';
  }
  const response = await api.get('/inventory/items', { params });
  return response.data;
};

export const createInventoryItem = async (data: any) => {
  return await api.post('/inventory/items', data);
};

export const updateInventoryItem = async (id: string, data: any) => {
  return await api.put(`/inventory/items/${id}`, data);
};

export const deleteInventoryItem = async (id: number) => {
  return await api.delete(`/inventory/items/${id}`);
};

export const getActivos = async (page: number = 1, page_size: number = 500) => {
  const response = await api.get(`/inventory/activos?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const createActivo = async (data: any) => {
  return await api.post('/inventory/activos', data);
};

export const updateActivo = async (id: number, data: any) => {
  return await api.put(`/inventory/activos/${id}`, data);
};

export const deleteActivo = async (id: number) => {
  return await api.delete(`/inventory/activos/${id}`);
};

export const crearDesmonteBulk = async (data: { items: { id_item: number, cantidad: number }[], id_proyecto?: number, id_cliente?: number }) => {
  const response = await api.post('/inventory/items/desmonte-bulk', data);
  return response.data;
};

export const getUbicaciones = async () => {
  const response = await api.get('/inventory/ubicaciones');
  return response.data;
};

export const importInventory = async (file: File, idProyecto?: number, idCliente?: number) => {
  const formData = new FormData();
  formData.append('file', file);
  if (idProyecto) formData.append('id_proyecto', idProyecto.toString());
  if (idCliente) formData.append('id_cliente', idCliente.toString());
  
  const response = await api.post('/import/full-system', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
