import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Key, ArrowLeft } from 'lucide-react';
import { DashboardLayout, Card, Button, SectionTitle } from '../components/Fusion';
import { useNavigate } from 'react-router-dom';
import UserSettingsModal from '../components/UserSettingsModal';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-bg3 text-content-muted hover:text-emerald-primary transition-all border border-white/5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Ajustes del sistema y preferencias de usuario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <SectionTitle>Perfil de Usuario</SectionTitle>
          <p className="text-sm text-content-muted">Actualiza tu foto de perfil, contraseña y preferencias personales.</p>
          <Button className="w-full" variant="neo" onClick={() => setShowModal(true)}>
            <User size={14} /> Abrir Configuración de Perfil
          </Button>
        </Card>

        <Card className="space-y-4">
          <SectionTitle>Seguridad</SectionTitle>
          <p className="text-sm text-content-muted">Cambia tu contraseña y revisa tus sesiones activas.</p>
          <Button className="w-full" variant="neo" onClick={() => setShowModal(true)}>
            <Key size={14} /> Gestionar Contraseña
          </Button>
        </Card>
      </div>

      {showModal && (
        <UserSettingsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Settings;
