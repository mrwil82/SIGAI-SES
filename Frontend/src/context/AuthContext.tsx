import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/auth';

interface User {
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      logout();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (isMounted) await fetchUser();
    };

    load();
    
    return () => { isMounted = false; };
  }, [token]);

  const login = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
