import api from "./api";

export const getRegionales = async () => {
  const response = await api.get("/regionales/");
  return response.data;
};

export const createRegional = async (data: {
  nombre: string;
  ciudad?: string;
}) => {
  const response = await api.post("/regionales/", data);
  return response.data;
};

export const updateRegional = async (
  id: number,
  data: { nombre: string; ciudad?: string },
) => {
  const response = await api.put(`/regionales/${id}`, data);
  return response.data;
};

export const deleteRegional = async (id: number) => {
  const response = await api.delete(`/regionales/${id}`);
  return response.data;
};
