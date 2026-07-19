import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button, FormGroup, NeoInput, NeoSelect, NeoTextarea } from '../../components/Fusion';
import { useToast } from '../../lib/toast';
import { logger } from '../../lib/logger';
import api from '../../services/api';
import { ACTA_TYPES, ACTA_ESTADOS } from './types';

interface EditActaModalProps {
  isOpen: boolean;
  onClose: () => void;
  acta: any;
  onSaved: () => void;
}

const EditActaModal: React.FC<EditActaModalProps> = ({ isOpen, onClose, acta, onSaved }) => {
  const [localActa, setLocalActa] = useState<any>(acta || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const escHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (acta) setLocalActa({ ...acta });
  }, [acta]);

  useEffect(() => {
    if (isOpen) window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [isOpen, escHandler]);

  if (!isOpen || !acta) return null;

  const submitEdit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/business/actas/${localActa.id_acta}`, localActa);
      toast.success('Acta actualizada correctamente');
      onSaved();
      onClose();
    } catch (err: any) {
      logger.error('Error actualizando acta:', err);
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || 'Error al actualizar acta');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[500px] mx-4 bg-bg1 p-4 sm:p-6 rounded-xl shadow-lg" style={{ animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Editar Acta</h2>
          <button onClick={onClose} className="text-content-muted hover:text-content">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}

        <FormGroup label="Número de Acta" htmlFor="numero_acta">
          <NeoInput id="numero_acta" value={localActa.numero_acta || ''} onChange={(e) => setLocalActa({ ...localActa, numero_acta: e.target.value })} />
        </FormGroup>
        <FormGroup label="Tipo de Acta" htmlFor="tipo_acta">
          <NeoSelect id="tipo_acta" value={localActa.tipo_acta || ''} onChange={(e) => setLocalActa({ ...localActa, tipo_acta: e.target.value })}>
            {ACTA_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </NeoSelect>
        </FormGroup>
        <FormGroup label="Estado" htmlFor="estado_acta">
          <NeoSelect id="estado_acta" value={localActa.estado_acta || ''} onChange={(e) => setLocalActa({ ...localActa, estado_acta: e.target.value })}>
            {ACTA_ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </NeoSelect>
        </FormGroup>
        <FormGroup label="Observaciones" htmlFor="observaciones">
          <NeoTextarea id="observaciones" value={localActa.observaciones || ''} onChange={(e) => setLocalActa({ ...localActa, observaciones: e.target.value })} />
        </FormGroup>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="neo" onClick={onClose}>Cancelar</Button>
          <Button onClick={submitEdit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </div>
    </div>
  );
};

export default EditActaModal;
