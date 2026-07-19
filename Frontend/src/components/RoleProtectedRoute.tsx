import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <div className="text-emerald-primary animate-pulse font-bold tracking-widest text-xs uppercase">
          Cargando Sistema...
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
