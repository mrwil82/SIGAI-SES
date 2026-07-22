import React, { useState } from 'react';
import { User, Key, ArrowLeft, Upload } from 'lucide-react';
import { DashboardLayout, Card, Button, SectionTitle, NeoInput } from '../components/Fusion';
import { useNavigate } from 'react-router-dom';
import { uploadAvatar, changeMyPassword } from '../services/users';
import { useToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeName } from '../context/ThemeContext';

const THEMES: { id: ThemeName; label: string; desc: string; preview: string }[] = [
  { id: 'green', label: 'Verde', desc: 'Industrial / seguridad', preview: 'bg-emerald-primary' },
  { id: 'blue', label: 'Azul Cobalto', desc: 'Oscuro / corporativo', preview: 'bg-chart-blue' },
  { id: 'bone', label: 'Blanco Hueso', desc: 'Cálido / natural', preview: 'bg-emerald-primary' },
  { id: 'sand', label: 'Arena', desc: 'Beige / acento dorado', preview: 'bg-gold' },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error('Selecciona un archivo');
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(avatarFile);
      toast.success('Avatar actualizado');
      setAvatarFile(null);
      await refreshUser();
    } catch (err) {
      toast.error('Error subiendo avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) return toast.error('Completa ambos campos');
    if (newPass !== confirmPass) return toast.error('Las contraseñas no coinciden');
    setChangingPass(true);
    try {
      await changeMyPassword(currentPass, newPass);
      toast.success('Contraseña cambiada');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error cambiando contraseña');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-bg3 text-content-muted hover:text-emerald-primary transition-all border border-bg4">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Ajustes del sistema y preferencias de usuario</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6 md:p-8">
          <SectionTitle>Tema de la aplicación</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  theme === t.id
                    ? 'border-emerald-primary bg-emerald-primary/5'
                    : 'border-bg4 bg-bg2 hover:bg-white/5'
                }`}
              >
                <div className={`w-full h-8 rounded-lg mb-3 ${t.preview} bg-opacity-30 border border-bg3`} />
                <p className="text-xs font-bold text-content-primary">{t.label}</p>
                <p className="text-[9px] text-content-muted mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <SectionTitle>Preferencias de Usuario</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-chart-blue/10 text-chart-blue flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-content-primary">Avatar</h3>
                  <p className="text-[10px] text-content-muted">Sube una foto de perfil</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center gap-3 p-4 border-2 border-dashed border-bg3 rounded-xl bg-bg3/50 cursor-pointer hover:border-emerald-primary/30 transition-colors">
                  <Upload size={20} className="text-content-muted shrink-0" />
                  <span className="text-[11px] text-content-muted truncate">
                    {avatarFile ? avatarFile.name : 'Seleccionar imagen...'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e: any) => setAvatarFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <Button className="w-full" variant="neo" onClick={handleAvatarUpload} disabled={avatarUploading || !avatarFile}>
                {avatarUploading ? 'Subiendo...' : 'Actualizar Avatar'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-content-primary">Seguridad</h3>
                  <p className="text-[10px] text-content-muted">Cambia tu contraseña</p>
                </div>
              </div>
              <NeoInput type="password" value={currentPass} onChange={(e: any) => setCurrentPass(e.target.value)} placeholder="Contraseña actual" />
              <NeoInput type="password" value={newPass} onChange={(e: any) => setNewPass(e.target.value)} placeholder="Nueva contraseña" />
              <NeoInput type="password" value={confirmPass} onChange={(e: any) => setConfirmPass(e.target.value)} placeholder="Confirmar nueva contraseña" />
              <Button className="w-full" onClick={handleChangePassword} disabled={changingPass}>
                {changingPass ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
