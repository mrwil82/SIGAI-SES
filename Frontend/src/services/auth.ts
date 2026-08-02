import api from "./api";

export const login = async (credentials: URLSearchParams) => {
  const response = await api.post("/auth/login", credentials, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export interface RegisterPayload {
  username: string;
  password: string;
  nombre?: string;
  email?: string;
  codigo_empleado?: string;
  cedula?: string;
  rol?: string;
  regional?: string;
}

export const register = async (userData: RegisterPayload) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
