import api from './api';

export const getActivosParaTriaje = async () => {
  const { data } = await api.get('/inventory/activos?estado=LABORATORIO');
  return data;
};

export const actualizarTriajeActivo = async (id_activo: number, payload: { calificacion_tecnica: string, observaciones: string }) => {
  const { data } = await api.patch(`/inventory/activos/${id_activo}/triaje`, {
    ...payload,
    fecha_triaje: new Date().toISOString()
  });
  return data;
};

export const getActivoById = async (id_activo: number) => {
  const { data } = await api.get(`/inventory/activos/id/${id_activo}`);
  return data;
};

export const deleteActivo = async (id_activo: number) => {
  const { data } = await api.delete(`/inventory/activos/${id_activo}`);
  return data;
};
