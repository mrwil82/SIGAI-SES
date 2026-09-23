import { createContext, useContext } from "react";

export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  is_active: boolean;
  cedula?: string;
  codigo_empleado?: string;
  regional?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
