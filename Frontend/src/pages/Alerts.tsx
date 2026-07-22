import React, { useEffect, useState } from 'react';
import { 
  DashboardLayout, Card, TableContainer, THead, TBody, TH, TR, TD, Badge, Alert,
  NeoSelect, Button, Modal, FormGroup, NeoTextarea, NeoInput, ConfirmModal
} from '../components/Fusion';
import { useToast } from '../lib/toast';
import { ExportMenu } from '../components/ExportMenu';
import { Check, XCircle, Search, Eye, AlertTriangle, Trash2, Plus, Edit2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { getUsers } from '../services/users';
import { logger } from '../lib/logger';

const Alerts: React.FC = () => {
  const location = useLocation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estado, setEstado] = useState('activa');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalAlerts, setTotalAlerts] = useState(0);
  
  // Modal de gestión

  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notas, setNotas] = useState('');
  const [valorActual, setValorActual] = useState<number | ''>('');
  const [solucion, setSolucion] = useState('');
  
  // Modal de creación
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({ titulo: '', prioridad: 'media', notas: '' });

  useEffect(() => {
    fetchData();
  }, [estado, currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch alerts first; users list is optional (may require ADMIN). Use Promise.allSettled so a 403 on users doesn't block alerts.
      const results = await Promise.allSettled([
        api.get('/alerts/', { params: { estado, page: currentPage, page_size: pageSize } }),
        getUsers(1, 500)
      ]);

      const alertsResult = results[0];
      const usersResult = results[1];

      if (alertsResult.status === 'fulfilled') {
        const responseData = (alertsResult.value as { data?: Record<string, unknown> }).data;
        setAlerts((responseData?.items as unknown as unknown[]) || []);
        setTotalAlerts((responseData?.total as number) || 0);
      } else {
        logger.error('Error fetching alerts:', alertsResult.reason);
        setAlerts([]);
      }

      if (usersResult && usersResult.status === 'fulfilled') {
        const usersRes = (usersResult.value as { data?: { items?: unknown[] } }).data;
        setUsers(usersRes?.items || []);
      } else {
        // If fetching users failed (e.g., technician without permission), keep users empty but continue.
        if (usersResult) logger.warn('Could not fetch users list:', usersResult.reason);
        setUsers([]);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (alert: any) => {
    setSelectedAlert(alert);
    setNotas(alert.descripcion || '');
    setValorActual(alert.valor_actual ?? '');
    setSolucion(alert.solucion || '');
    setIsModalOpen(true);
  };

  const updateEstado = async (id: number, newEstado: string) => {
    setIsUpdating(true);
    try {
      const payload: any = { 
        estado: newEstado,
        notas: notas
      };
      if (valorActual !== '') payload.valor_actual = valorActual;
      if (solucion && solucion.trim().length > 0) payload.solucion = solucion;
      await api.patch(`/alerts/${id}/estado`, payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      logger.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAlerta = async (id: number) => {
    openConfirm(id);
  };

  const createAlerta = async () => {
    try {
      await api.post('/alerts/', newAlert);
      setIsCreateModalOpen(false);
      setNewAlert({ titulo: '', prioridad: 'media', notas: '' });
      fetchData();
    } catch (err) {
      logger.error(err);
    }
  };

  // Confirmación de eliminación

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const openConfirm = (id: number) => { setConfirmId(id); setConfirmOpen(true); };
  const closeConfirm = () => { setConfirmOpen(false); setConfirmId(null); };
  const performDelete = async (id: number | null) => {
    if (!id) return closeConfirm();
    try {
      await api.delete(`/alerts/${id}`);
      toast.success('Alerta eliminada');
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Error eliminando alerta');
    } finally {
      closeConfirm();
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id_usuario === userId);
    return user ? user.nombre : `Usuario #${userId}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '---';
    return new Date(date).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Panel de Alertas</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Gestión y control de incidencias en tiempo real</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <ExportMenu module="alerts" />
          <NeoSelect value={estado} onChange={(e: any) => { setEstado(e.target.value); setCurrentPage(1); }} className="w-full sm:w-40">
            <option value="activa">Activas</option>
            <option value="reconocida">Reconocidas</option>
            <option value="resuelta">Resueltas</option>
            <option value="ignorada">Ignoradas</option>
          </NeoSelect>
          <Button variant="neo" className="flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16}/> Nueva Alerta
          </Button>
          <Button variant="neo" className="flex items-center gap-2" onClick={async () => { try { await api.post('/alerts/evaluar'); toast.success('Alertas evaluadas'); fetchData(); } catch { toast.error('Error al evaluar alertas'); } }}>
            <AlertTriangle size={14}/> Evaluar
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <TableContainer>
          <THead>
            <TH>ID</TH>
            <TH>Título</TH>
            <TH className="hidden sm:table-cell">Tipo</TH>
            <TH className="hidden md:table-cell">Prioridad</TH>
            <TH className="hidden lg:table-cell">Fecha Detección</TH>
            <TH>Acciones</TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR><TD colSpan={6} className="text-center py-20 text-content-muted italic">Consultando base de datos...</TD></TR>
            ) : alerts.length === 0 ? (
              <TR><TD colSpan={6} className="text-center py-20 text-content-muted italic">No se encontraron alertas en este estado.</TD></TR>
            ) : alerts.map((a, i) => (
              <TR key={i} onClick={() => handleOpenModal(a)} className="cursor-pointer">
                <TD className="font-mono text-emerald-primary">#{a.id}</TD>
                <TD className="text-xs font-bold">{a.titulo}</TD>
                <TD className="hidden sm:table-cell">
                  <Badge 
                    label={a.tipo === 'stock_bajo' ? 'EXISTENCIAS BAJAS' : a.tipo.replace(/_/g, ' ')} 
                    color={a.tipo === 'stock_bajo' ? 'var(--gold)' : 'var(--emerald)'} 
                    bg={a.tipo === 'stock_bajo' ? 'rgba(212,175,55,0.1)' : 'rgba(0,194,106,0.1)'}
                  />
                </TD>
                <TD className="hidden md:table-cell">
                  <Badge 
                    label={a.prioridad} 
                    color={a.prioridad === 'critica' ? '#ef4444' : '#fbbf24'} 
                    bg="transparent"
                  />
                </TD>
                <TD className="hidden lg:table-cell text-[10px] text-content-muted">
                  {formatDate(a.created_at)}
                </TD>
                <TD>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(a); }}
                      className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-bg4"
                    >
                      <Edit2 size={13}/>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAlerta(a.id); }}
                      className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-danger transition-all shadow-neo border border-bg4"
                    >
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableContainer>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold text-center sm:text-left">
          Mostrando {alerts.length} de {totalAlerts} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={totalAlerts <= currentPage * pageSize}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal de Gestión */}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalles y Gestión de Alerta"
        footer={
          <>
            <Button variant="danger" onClick={() => openConfirm(selectedAlert?.id)} disabled={isUpdating}>
              <Trash2 size={14} className="mr-2"/> Eliminar
            </Button>
            {selectedAlert?.estado === 'activa' ? (
              <>
                <Button variant="neo" onClick={() => updateEstado(selectedAlert.id, 'ignorada')} disabled={isUpdating}>
                  Ignorar
                </Button>
                <Button variant="primary" onClick={() => updateEstado(selectedAlert.id, 'resuelta')} disabled={isUpdating}>
                  <Check size={14} className="mr-2"/> Marcar como Resuelta
                </Button>
              </>
            ) : (
              <Button variant="neo" onClick={() => setIsModalOpen(false)}><AlertTriangle size={14} className="mr-2"/> Cancelar</Button>
            )}
          </>
        }
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="bg-bg2 p-4 rounded-xl border border-bg4 flex items-start gap-4 shadow-neo-inset">
              <div className={`p-3 rounded-lg shrink-0 ${selectedAlert.prioridad === 'critica' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold'}`}>
                <AlertTriangle size={24}/>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-primary">#{selectedAlert.id}</span>
                   <Badge label={selectedAlert.estado} color="var(--emerald)" bg="rgba(0,194,106,0.1)"/>
                </div>
                <h4 className="font-bold text-sm text-content-primary truncate">{selectedAlert.titulo}</h4>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">{selectedAlert.descripcion}</p>
              </div>
            </div>
            
            <FormGroup label={selectedAlert.estado === 'activa' ? "Añadir Notas de Gestión" : "Notas Finales"}>
              <NeoTextarea 
                value={notas}
                onChange={(e: any) => setNotas(e.target.value)}
                disabled={selectedAlert.estado !== 'activa'}
                className="min-h-[120px] bg-bg2"
              />
            </FormGroup>
            {/* Campos adicionales editables por técnicos */}
            {selectedAlert.tipo === 'stock_bajo' && (
              <FormGroup label="Cantidad actual (ingresar nueva cantidad)">
                <NeoInput 
                  type="number"
                  value={valorActual}
                  onChange={(e: any) => setValorActual(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={selectedAlert.estado !== 'activa'}
                />
              </FormGroup>
            )}
            <FormGroup label="Solución / Acción tomada">
              <NeoTextarea
                value={solucion}
                onChange={(e: any) => setSolucion(e.target.value)}
                disabled={selectedAlert.estado !== 'activa'}
                className="min-h-[80px] bg-bg2"
              />
            </FormGroup>
          </div>
        )}
      </Modal>

      {/* Modal de Creación */}
      
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Alerta Manual"
        footer={<><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button><Button onClick={createAlerta}>Crear</Button></>}
      >
        <div className="space-y-4">
          <FormGroup label="Título">
            <NeoInput value={newAlert.titulo} onChange={(e: any) => setNewAlert({...newAlert, titulo: e.target.value})} />
          </FormGroup>
          <FormGroup label="Prioridad">
            <NeoSelect value={newAlert.prioridad} onChange={(e: any) => setNewAlert({...newAlert, prioridad: e.target.value})}>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </NeoSelect>
          </FormGroup>
          <FormGroup label="Notas/Descripción">
            <NeoTextarea value={newAlert.notas} onChange={(e: any) => setNewAlert({...newAlert, notas: e.target.value})} />
          </FormGroup>
        </div>
      </Modal>
      <ConfirmModal isOpen={confirmOpen} title="Eliminar alerta" message="¿Estás seguro de eliminar esta alerta permanentemente?" onCancel={closeConfirm} onConfirm={() => performDelete(confirmId)} />
    </DashboardLayout>
  );
};

export default Alerts;