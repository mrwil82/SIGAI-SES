import React, { useEffect, useState } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Truck, 
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  DashboardLayout,
  TableContainer,
  THead,
  TBody,
  TH,
  TR,
  TD,
  NeoInput,
  Modal,
  FormGroup,
  NeoSelect,
  ConfirmModal,
  Alert,
  NeoTextarea
} from '../components/Fusion';
import { SearchableSelect } from '../components/SearchableSelect';
import { useToast } from '../lib/toast';
import { getGarantias, createGarantia, getProveedores, updateGarantia, deleteGarantia } from '../services/business';
import { getActivos } from '../services/inventory';
import { logger } from '../lib/logger';

const Guarantees: React.FC = () => {
  const navigate = useNavigate();
  const [garantias, setGarantias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [activos, setActivos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGarantia, setEditingGarantia] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); } }, [alert]);

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [garData, provData, actData] = await Promise.all([
        getGarantias(),
        getProveedores(),
        getActivos()
      ]);
      setGarantias(garData.items || []);
      setProveedores(provData.items || []);
      setActivos(actData.items || []);
    } catch (error) {
      logger.error('Failed to fetch guarantees data', error);
      setAlert({ type: 'error', message: 'Error al sincronizar datos con el servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (gar: any) => {
    setEditingGarantia(gar);
    setValue('id_activo', String(gar.id_activo));
    setValue('id_proveedor', String(gar.id_proveedor));
    setValue('numero_caso_interno', gar.numero_caso_interno);
    setValue('rma_proveedor', gar.rma_proveedor);
    setValue('numero_factura_compra', gar.numero_factura_compra);
    setValue('fecha_envio', gar.fecha_envio);
    setValue('fecha_limite_estimada', gar.fecha_limite_estimada);
    setValue('falla_reportada', gar.falla_reportada);
    setValue('estado_proceso', gar.estado_proceso);
    setValue('area_origen', gar.area_origen || '');
    setValue('credenciales_equipo', gar.credenciales_equipo || '');
    setValue('fecha_recibido_reparado', gar.fecha_recibido_reparado || '');
    setValue('id_acta_devolucion', gar.id_acta_devolucion || '');
    setValue('comentarios_proceso', gar.comentarios_proceso || '');
    setIsModalOpen(true);
  };

  const openConfirm = (id: number, message?: string) => {
    setConfirmId(id);
    setConfirmMessage(message || '¿Está seguro de eliminar este registro de garantía?');
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (confirmId == null) return;
    try {
      await deleteGarantia(confirmId);
      toast.success('Registro de garantía eliminado correctamente.');
      setAlert(null);
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar el registro.');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGarantia(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data };
      ['fecha_envio', 'fecha_limite_estimada', 'fecha_recibido_reparado'].forEach(f => { if (!payload[f]) delete payload[f]; });
      if (editingGarantia) {
        await updateGarantia(editingGarantia.id_garantia, payload);
        setAlert({ type: 'success', message: 'Garantía actualizada correctamente.' });
      } else {
        await createGarantia(payload);
        setAlert({ type: 'success', message: 'Proceso de garantía iniciado correctamente.' });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || 'Error al procesar la solicitud.');
      setAlert({ type: 'error', message: msg });
    }
  };

  const formatDateTime = (d: string | null) => {
    if (!d) return '---';
    try { return new Date(d).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REGISTRADO': return <Badge label="REGISTRADO" color="var(--content-muted)" bg="rgba(255,255,255,0.05)" />;
      case 'ENVIADO_PROVEEDOR': return <Badge label="EN PROVEEDOR" color="var(--chart-blue)" bg="rgba(0,163,255,0.1)" />;
      case 'RECIBIDO_PROVEEDOR': return <Badge label="EN REVISIÓN" color="var(--gold)" bg="rgba(255,184,0,0.1)" />;
      case 'RESUELTO_REEMPLAZADO': return <Badge label="SOLUCIONADO" color="var(--emerald)" bg="var(--emerald-muted)" />;
      case 'ENTREGADO_CLIENTE': return <Badge label="ENTREGADO A CLIENTE" color="var(--chart-teal)" bg="rgba(0,200,150,0.1)" />;
      default: return <Badge label={status} color="white" bg="gray" />;
    }
  };

  const filteredGarantias = garantias.filter(garantia => 
    garantia.numero_caso_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garantia.activo?.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garantia.rma_proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Garantías</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Seguimiento de procesos de retorno y soporte técnico</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu module="guarantees" />
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Nueva Garantía
          </Button>
        </div>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <Card className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
          <NeoInput 
            placeholder="Buscar por caso, serial o RMA..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
        <TableContainer>
          <THead>
            <TH>Caso / Trazabilidad</TH>
            <TH className="hidden sm:table-cell">Equipo Serializado</TH>
            <TH>Estado</TH>
            <TH className="hidden md:table-cell">Fechas</TH>
            <TH className="hidden lg:table-cell">Falla / Diagnóstico</TH>
            <TH></TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-chart-teal/30 border-t-chart-teal rounded-full animate-spin" />
                    <span className="text-chart-teal uppercase tracking-[0.2em] font-bold text-[10px]">Sincronizando...</span>
                  </div>
                </TD>
              </TR>
            ) : filteredGarantias.length > 0 ? (
              filteredGarantias.map((garantia) => (
                <TR key={garantia.id_garantia}>
                  <TD>
                    <div className="space-y-1">
                      <div className="font-bold text-xs md:text-sm text-content-primary font-mono">{garantia.numero_caso_interno}</div>
                      <div className="text-[9px] md:text-[10px] text-content-muted flex items-center gap-1.5">
                        <ClipboardList size={10} className="text-chart-teal shrink-0" />
                        <span className="truncate max-w-[80px] md:max-w-none">RMA: {garantia.rma_proveedor || 'PEND'}</span>
                      </div>
                      <div className="sm:hidden text-[9px] text-emerald-primary font-mono">S/N: {garantia.activo?.serial}</div>
                    </div>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-content-primary truncate max-w-[150px] md:max-w-[200px]">{garantia.activo?.item?.nombre_equipo}</span>
                      <span className="text-[10px] text-emerald-primary font-mono mt-0.5">S/N: {garantia.activo?.serial}</span>
                    </div>
                  </TD>
                  <TD>
                    {getStatusBadge(garantia.estado_proceso)}
                  </TD>
                  <TD className="hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-content-secondary">
                        <Calendar size={12} className="text-content-muted" />
                        <span className="text-[10px] whitespace-nowrap">{formatDateTime(garantia.fecha_envio)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gold">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold whitespace-nowrap">Límite: {formatDateTime(garantia.fecha_limite_estimada)}</span>
                      </div>
                      {garantia.fecha_recibido_reparado && (
                        <div className="flex items-center gap-2 text-emerald-primary">
                          <Calendar size={12} />
                          <span className="text-[10px] whitespace-nowrap">Retorno: {formatDateTime(garantia.fecha_recibido_reparado)}</span>
                        </div>
                      )}
                    </div>
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <div className="max-w-[180px] xl:max-w-[250px]">
                      <p className="text-[10px] text-content-muted italic line-clamp-2 leading-relaxed">
                        {garantia.falla_reportada || 'Sin descripción'}
                      </p>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1.5 md:gap-2">
                      <button 
                        onClick={() => handleEdit(garantia)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-white/5"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => openConfirm(garantia.id_garantia)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-all shadow-neo border border-white/5"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button 
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-content-primary transition-all shadow-neo border border-white/5"
                        onClick={() => navigate(`/guarantees/${garantia.id_garantia}`)}
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={6} className="text-center py-20 text-content-muted italic text-xs md:text-sm">
                  Sin registros.
                </TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      {/* Modal de Garantía / Edición */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingGarantia ? "Editar Seguimiento de Garantía" : "Registrar Proceso de Garantía"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>{editingGarantia ? "Actualizar Seguimiento" : "Iniciar Seguimiento"}</Button>
          </>
        }
      >
        <form className="space-y-4 text-[11px] md:text-xs">
          {editingGarantia && (
            <FormGroup label="Estado del Proceso">
              <NeoSelect {...register('estado_proceso')}>
                <option value="REGISTRADO">Registrado</option>
                <option value="ENVIADO_PROVEEDOR">Enviado a Proveedor</option>
                <option value="RECIBIDO_PROVEEDOR">Recibido (En Revisión)</option>
                <option value="RESUELTO_REEMPLAZADO">Resuelto / Reemplazado</option>
                <option value="ENTREGADO_CLIENTE">Entregado a Cliente</option>
              </NeoSelect>
            </FormGroup>
          )}

          <FormGroup label="Activo (Serial)" error={errors.id_activo?.message as string}>
            <SearchableSelect
              options={activos.map((a: any) => ({
                value: String(a.id_activo),
                label: `${a.serial} - ${a.item?.nombre_equipo || ''}`,
                searchTerms: `${a.serial} ${a.item?.nombre_equipo || ''} ${a.item?.referencia || ''}`
              }))}
              value={String(watch('id_activo') || '')}
              onChange={(val) => setValue('id_activo', val)}
              placeholder="Escriba para buscar activo (serial)..."
              disabled={!!editingGarantia}
            />
          </FormGroup>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Proveedor de Garantía">
              <SearchableSelect
                options={proveedores.map((p: any) => ({ value: String(p.id_proveedor), label: p.nombre }))}
                value={String(watch('id_proveedor') || '')}
                onChange={(val) => setValue('id_proveedor', val)}
                placeholder="Escriba para buscar proveedor..."
              />
            </FormGroup>
            <FormGroup label="Número de Caso Interno">
              <NeoInput {...register('numero_caso_interno')} placeholder="Ej: SES-G-2024-001" />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Área Solicitante / Origen">
              <NeoInput {...register('area_origen')} placeholder="Ej: Comercial, Monitoreo" />
            </FormGroup>
            <FormGroup label="Credenciales Equipo (IP/Claves)">
              <NeoInput {...register('credenciales_equipo')} placeholder="Ej: 192.168.1.10 / admin:123" />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Seguimiento Proveedor">
              <NeoInput {...register('rma_proveedor')} placeholder="Ej: RMA-HK-12345" />
            </FormGroup>
            <FormGroup label="Número Factura Compra">
              <NeoInput {...register('numero_factura_compra')} placeholder="Ej: FAC-9988" />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha de Envío">
              <NeoInput type="date" {...register('fecha_envio')} />
            </FormGroup>
            <FormGroup label="Fecha Límite Estimada">
              <NeoInput type="date" {...register('fecha_limite_estimada')} />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha Retorno (Reparado)">
              <NeoInput type="date" {...register('fecha_recibido_reparado')} />
            </FormGroup>
            <FormGroup label="ID Acta Devolución">
              <NeoInput type="number" {...register('id_acta_devolucion')} placeholder="Si aplica" />
            </FormGroup>
          </div>

          <FormGroup label="Falla Reportada">
            <NeoTextarea {...register('falla_reportada')} placeholder="Describa detalladamente el problema del equipo..." />
          </FormGroup>

          <FormGroup label="Comentarios / Avances del Proceso">
            <NeoTextarea {...register('comentarios_proceso')} placeholder="Notas sobre el estado técnico o logístico..." />
          </FormGroup>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar eliminación"
        message={confirmMessage}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={performDelete}
      />
    </DashboardLayout>
  );
};

export default Guarantees;
