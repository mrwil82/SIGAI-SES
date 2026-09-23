import React, { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/auth";
import { AuthContext, type User } from "../hooks/useAuth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("token"),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    sessionStorage.getItem("refreshToken"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const rt = sessionStorage.getItem("refreshToken");
    if (rt) {
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api/v1`}/auth/logout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: rt }),
            credentials: "include",
          },
        );
      } catch {
        // Si el servidor no responde, se limpia igualmente la sesión local
      }
    }
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      logout();
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) await fetchUser();
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchUser]);

  const login = useCallback((newToken: string, newRefreshToken: string) => {
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("refreshToken", newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
