import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toaster';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Guarantees from './pages/Guarantees';
import GuaranteeDetail from './pages/GuaranteeDetail';
import Audit from './pages/Audit';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Users from './pages/Users';
import Deliveries from './pages/Deliveries';
import Desmontes from './pages/Desmontes';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <ToastProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/guarantees" element={<ProtectedRoute><Guarantees /></ProtectedRoute>} />
            <Route path="/guarantees/:id" element={<ProtectedRoute><GuaranteeDetail /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["ADMIN"]}><Audit /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["ADMIN"]}><Users /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/deliveries" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["ADMIN"]}><Deliveries /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/desmontes" element={<ProtectedRoute><Desmontes /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
