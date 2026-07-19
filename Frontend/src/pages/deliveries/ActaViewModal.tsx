import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/Fusion';

interface ActaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  acta: any;
  projectName: string;
  userName: string;
  onDownload: (id: number) => void;
}

const ActaViewModal: React.FC<ActaViewModalProps> = ({ isOpen, onClose, acta, projectName, userName, onDownload }) => {
  if (!isOpen || !acta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[680px] mx-4 bg-bg1 p-4 sm:p-6 rounded-xl shadow-lg" style={{ animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Vista Acta</h2>
          <div className="flex items-center gap-2">
            <Button variant="neo" className="text-[10px] h-9" onClick={() => { if (acta?.id_acta) onDownload(acta.id_acta); }}>Descargar</Button>
            <button onClick={onClose} className="text-content-muted hover:text-content"><X size={20} /></button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-content-muted">Número</p>
              <p className="font-bold">{acta.numero_acta || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-content-muted">Tipo</p>
              <p className="font-bold">{acta.tipo_acta?.replace(/_/g, ' ') || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-content-muted">Proyecto</p>
              <p>{projectName}</p>
            </div>
            <div>
              <p className="text-[10px] text-content-muted">Técnico</p>
              <p>{userName}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-content-muted">Observaciones</p>
            <p className="whitespace-pre-wrap">{acta.observaciones || '—'}</p>
          </div>

          <div>
            <p className="text-[10px] text-content-muted mb-2">Detalles</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[9px] text-content-muted text-left px-3 py-2">#</th>
                    <th className="text-[9px] text-content-muted text-left px-3 py-2">Descripción</th>
                    <th className="text-[9px] text-content-muted text-left px-3 py-2">Cantidad</th>
                    <th className="text-[9px] text-content-muted text-left px-3 py-2">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {(acta.detalles || []).map((d: any, i: number) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{d.descripcion || d.id_item || '—'}</td>
                      <td className="px-3 py-2">{d.cantidad ?? '—'}</td>
                      <td className="px-3 py-2">{d.notas_estado || d.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActaViewModal;
