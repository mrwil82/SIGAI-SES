import api from './api';

// --- CLIENTES ---
export const getClientes = async (skip = 0, limit = 1000) => {
  const response = await api.get(`/business/clientes?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getClienteById = async (id: number) => {
  const response = await api.get(`/business/clientes/${id}`);
  return response.data;
};

export const createCliente = async (clienteData: any) => {
  const response = await api.post('/business/clientes', clienteData);
  return response.data;
};

export const updateCliente = async (id: number, clienteData: any) => {
  const response = await api.put(`/business/clientes/${id}`, clienteData);
  return response.data;
};

export const deleteCliente = async (id: number) => {
  const response = await api.delete(`/business/clientes/${id}`);
  return response.data;
};

// --- PROYECTOS ---
export const getProyectos = async (skip = 0, limit = 1000) => {
  const response = await api.get(`/business/proyectos?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getProyectoById = async (id: number) => {
  const response = await api.get(`/business/proyectos/${id}`);
  return response.data;
};

export const createProyecto = async (proyectoData: any) => {
  const response = await api.post('/business/proyectos', proyectoData);
  return response.data;
};

export const updateProyecto = async (id: number, proyectoData: any) => {
  const response = await api.put(`/business/proyectos/${id}`, proyectoData);
  return response.data;
};

export const deleteProyecto = async (id: number) => {
  const response = await api.delete(`/business/proyectos/${id}`);
  return response.data;
};

// --- ACTAS ---
export const saveActa = async (actaData: any) => {
  const response = await api.post('/business/actas', actaData);
  return response.data;
};

export const getActas = async (page = 1, pageSize = 50) => {
  const response = await api.get('/business/actas', { params: { page, page_size: pageSize } });
  return response.data;
};

// --- PROVEEDORES ---
export const getProveedores = async () => {
  const response = await api.get('/business/proveedores');
  return response.data;
};

// --- MOVIMIENTOS ---
export const getMovimientos = async () => {
  const response = await api.get('/business/movimientos');
  return response.data;
};

export const createMovimiento = async (movData: any) => {
  const response = await api.post('/business/movimientos', movData);
  return response.data;
};

// --- GARANTÍAS ---
export const getGarantias = async () => {
  const response = await api.get('/business/garantias');
  return response.data;
};

export const getGarantiaById = async (id: number) => {
  const response = await api.get(`/business/garantias/${id}`);
  return response.data;
};

export const createGarantia = async (garData: any) => {
  const response = await api.post('/business/garantias', garData);
  return response.data;
};

export const updateGarantia = async (id: number, garData: any) => {
  const response = await api.put(`/business/garantias/${id}`, garData);
  return response.data;
};

export const deleteGarantia = async (id: number) => {
  const response = await api.delete(`/business/garantias/${id}`);
  return response.data;
};
