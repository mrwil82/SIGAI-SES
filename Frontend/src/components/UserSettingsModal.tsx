import React, { useState } from 'react';
import { Modal, Button, FormGroup, NeoInput } from './Fusion';
import { uploadAvatar, changeMyPassword } from '../services/users';
import { useToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';

const UserSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const toast = useToast();
  const { refreshUser } = useAuth();

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error('Selecciona un archivo');
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(avatarFile);
      toast.success('Avatar subido');
      setAvatarFile(null);
      // Refrescar usuario en la sesión
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Error subiendo avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) return toast.error('Completa ambos campos');
    if (newPass !== confirmPass) return toast.error('La nueva contraseña y su confirmación no coinciden');
    try {
      await changeMyPassword(currentPass, newPass);
      toast.success('Contraseña cambiada');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err:any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Error cambiando contraseña');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferencias de Usuario" footer={(
      <>
        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      </>
    )}>
      <div className="space-y-6 max-w-md">
        <FormGroup label="Avatar (subir imagen)">
          <input type="file" accept="image/*" onChange={(e:any) => setAvatarFile(e.target.files?.[0] || null)} />
          <div className="flex gap-2 mt-3">
            <Button onClick={handleAvatarUpload} disabled={avatarUploading}>{avatarUploading ? 'Subiendo...' : 'Subir Avatar'}</Button>
          </div>
        </FormGroup>

        <FormGroup label="Cambiar contraseña">
          <NeoInput type="password" value={currentPass} onChange={(e:any) => setCurrentPass(e.target.value)} placeholder="Contraseña actual" />
          <NeoInput type="password" value={newPass} onChange={(e:any) => setNewPass(e.target.value)} placeholder="Nueva contraseña" className="mt-3" />
          <NeoInput type="password" value={confirmPass} onChange={(e:any) => setConfirmPass(e.target.value)} placeholder="Confirmar nueva contraseña" className="mt-3" />
          <div className="mt-3"><Button onClick={handleChangePassword}>Cambiar contraseña</Button></div>
        </FormGroup>
      </div>
    </Modal>
  );
};

export default UserSettingsModal;
