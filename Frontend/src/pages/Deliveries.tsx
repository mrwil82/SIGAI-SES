import React, { useState, useEffect } from 'react';
import { Plus, FileText, Package, Download, Trash2, Search, CheckSquare, Pen } from 'lucide-react';
import {
  DashboardLayout, Card, Button, NeoInput, NeoSelect, NeoTextarea,
  FormGroup, SectionTitle, TableContainer, THead, TBody, TH, TR, TD, Alert, ConfirmModal,
} from '../components/Fusion';
import { ExportMenu } from '../components/ExportMenu';
import { SearchableSelect } from '../components/SearchableSelect';
import { useToast } from '../lib/toast';
import { logger } from '../lib/logger';
import api from '../services/api';
import { getProyectos, saveActa, getActas, getClientes } from '../services/business';
import { getUsers } from '../services/users';
import { getInventoryItems, getActivos } from '../services/inventory';
import { useAuth } from '../context/AuthContext';
import ItemModal from './deliveries/ItemModal';
import EditActaModal from './deliveries/EditActaModal';
import ActaViewModal from './deliveries/ActaViewModal';
import { InventoryItem, Activo, ActaItem, ActaFormData, ACTA_TYPES } from './deliveries/types';
import { downloadPostBlob } from '../services/download';

const initFormData = (user: any): ActaFormData => ({
  id_usuario_tecnico: 0,
  id_usuario_representante: user?.id_usuario || 0,
  nombre_tecnico: '',
  cedula: '',
  codigo: '',
  regional: user?.regional || 'SES BARRANQUILLA',
  fecha: new Date().toISOString().split('T')[0],
  observaciones_generales: '',
  nombre_representante: user?.nombre || '',
  cedula_representante: user?.cedula || '',
  codigo_representante: user?.codigo_empleado || '',
  id_proyecto: '',
  id_cliente: '',
  tipo_acta: 'ENTREGA_HERRAMIENTA',
});

const normalizeError = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((e: any) => e.msg).filter(Boolean).join('; ');
  if (typeof detail === 'string') return detail;
  return fallback;
};

const Deliveries: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<ActaFormData>(initFormData(currentUser));
  const [items, setItems] = useState<ActaItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [actas, setActas] = useState<any[]>([]);
  const [actasPage, setActasPage] = useState(1);
  const [actasTotal, setActasTotal] = useState(0);
  const actasPageSize = 50;
  const [searchActas, setSearchActas] = useState('');
  const [filterActaType, setFilterActaType] = useState('');
  const [filterActaEstado, setFilterActaEstado] = useState('');
  const [editActa, setEditActa] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewActa, setViewActa] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmActaId, setConfirmActaId] = useState<number | null>(null);

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => {
    if (!currentUser) return;
    setFormData((prev) => ({
      ...prev,
      id_usuario_representante: prev.id_usuario_representante || currentUser.id_usuario,
      nombre_representante: !prev.nombre_representante || prev.nombre_representante === 'ELKIN DAVID VELASQUEZ HERNANDEZ' ? currentUser.nombre : prev.nombre_representante,
      cedula_representante: prev.cedula_representante || currentUser.cedula || '',
      codigo_representante: prev.codigo_representante || currentUser.codigo_empleado || '',
      regional: prev.regional || currentUser.regional || prev.regional,
    }));
  }, [currentUser]);

  const loadActas = async (page?: number) => {
    try {
      const res = await getActas(page ?? actasPage, actasPageSize);
      setActas(res.items || []);
      setActasTotal(res.total || 0);
    } catch (err) { logger.error('Error cargando actas:', err); }
  };

  const refreshActas = () => { setActasPage(1); loadActas(1); };

  const fetchInitialData = async () => {
    try {
      const [p, c, u, inv, a] = await Promise.all([
        getProyectos(0, 1000), getClientes(0, 1000), getUsers(),
        getInventoryItems(0, 5000, undefined, true), getActivos(1, 500),
      ]);
      const allUsers = u.items || [];
      setProjects(p.items || []);
      setClients(c.items || []);
      setUsers(allUsers.filter((x: any) => ['TECNICO', 'TECNICO_LABORATORIO'].includes(x.rol)));
      setRepresentatives(allUsers.filter((x: any) => ['ADMIN'].includes(x.rol)));
      setInventoryItems(inv.items || []);
      setActivos(a.items || []);
      refreshActas();
    } catch (err) { logger.error('Error cargando datos:', err); }
    finally { setIsLoading(false); }
  };

  const resetForm = () => { setFormData(initFormData(currentUser)); setItems([]); setError(null); };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) {
      setFormData({ ...formData, id_usuario_tecnico: 0, nombre_tecnico: '', cedula: '', codigo: '', regional: currentUser?.regional || 'SES BARRANQUILLA' });
      return;
    }
    const u = users.find((x) => x.id_usuario.toString() === userId);
    if (u) setFormData({ ...formData, id_usuario_tecnico: u.id_usuario, nombre_tecnico: u.nombre, cedula: u.cedula || '', codigo: u.codigo_empleado || '', regional: u.regional || 'SES BARRANQUILLA' });
  };

  const handleRepresentativeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const u = representatives.find((x) => x.id_usuario.toString() === userId);
    if (u) {
      setFormData({ ...formData, id_usuario_representante: u.id_usuario, nombre_representante: u.nombre, cedula_representante: u.cedula || '', codigo_representante: u.codigo_empleado || '' });
      return;
    }
    setFormData({ ...formData, id_usuario_representante: currentUser?.id_usuario || 0, nombre_representante: currentUser?.nombre || formData.nombre_representante, cedula_representante: currentUser?.cedula || formData.cedula_representante, codigo_representante: currentUser?.codigo_empleado || formData.codigo_representante });
  };

  const handleModalConfirm = (selected: { item: InventoryItem; cantidad: number }[]) => {
    const newItems: ActaItem[] = selected.map(({ item, cantidad }) => ({
      id_item: item.id_item.toString(), id_activo: '', descripcion: item.nombre_equipo,
      marca: item.marca, referencia: item.referencia, serie: '', cantidad, observaciones: 'NUEVO',
    }));
    setItems((prev) => {
      const merged = [...prev];
      newItems.forEach((ni) => {
        const existing = merged.find((m) => m.id_item === ni.id_item);
        if (existing) existing.cantidad += ni.cantidad;
        else merged.push(ni);
      });
      return merged;
    });
    setModalOpen(false);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const saveActaOnly = async () => {
    if (!formData.nombre_tecnico) { setError('Debe seleccionar un técnico'); return; }
    if (items.length === 0) { setError('Debe agregar al menos un item'); return; }
    setSaving(true); setError(null);
    try {
      await saveActa({
        id_usuario_tecnico: formData.id_usuario_tecnico,
        id_usuario_representante: formData.id_usuario_representante || currentUser?.id_usuario || 1,
        id_proyecto: formData.id_proyecto ? parseInt(formData.id_proyecto) : null,
        id_cliente: formData.id_cliente ? parseInt(formData.id_cliente) : null,
        tipo_acta: formData.tipo_acta,
        observaciones: formData.observaciones_generales,
        detalles: items.map((it) => ({ id_item: parseInt(it.id_item), id_activo: it.id_activo ? parseInt(it.id_activo) : null, cantidad: it.cantidad, notas_estado: it.observaciones })),
      });
      refreshActas();
      setSuccess('Acta guardada correctamente');
      resetForm();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      logger.error('Error guardando acta:', err);
      setError(normalizeError(err, 'Error al guardar el acta'));
    } finally { setSaving(false); }
  };

  const generatePDF = async () => {
    if (!formData.nombre_tecnico) { setError('Debe seleccionar un técnico'); return; }
    if (items.length === 0) { setError('Debe agregar al menos un item'); return; }
    setLoading(true); setError(null);
    try {
      const filename = `Acta_Entrega_${formData.nombre_tecnico.replace(/ /g, '_')}_${formData.fecha}.pdf`;
      await downloadPostBlob('/business/actas/generate', { ...formData, items }, filename);
      setSuccess('PDF generado correctamente'); toast.success('PDF generado correctamente');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      logger.error('Error generando PDF:', err);
      setError(normalizeError(err, 'Error generando PDF'));
    } finally { setLoading(false); }
  };

  const generateActaPDF = async (actaId: number) => {
    setLoading(true); setError(null);
    try {
      await downloadPostBlob(`/business/actas/${actaId}/generate`, {}, `Acta_${actaId}.pdf`);
      try {
        const res = await api.post(`/business/actas/${actaId}/downloaded`);
        toast.success(res?.data?.message || 'Descarga registrada');
      } catch {
        toast.info('PDF generado (registro de descarga falló)');
      }
      setSuccess('PDF del acta generado'); toast.success('PDF generado');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      logger.error('Error generando PDF del acta:', err);
      setError(normalizeError(err, 'Error generando PDF del acta'));
      toast.error(normalizeError(err, 'Error generando PDF'));
    } finally { setLoading(false); }
  };

  const handleEditActa = (acta: any) => { setEditActa(acta); setEditModalOpen(true); };
  const handleViewActa = async (actaId: number) => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/business/actas/${actaId}`);
      setViewActa(res.data || res);
      setViewModalOpen(true);
    } catch (err: any) {
      logger.error('Error cargando acta:', err);
      setError(normalizeError(err, 'Error cargando acta'));
      toast.error(normalizeError(err, 'Error cargando acta'));
    } finally { setLoading(false); }
  };
  const handleDeleteActa = (actaId: number) => { setConfirmActaId(actaId); setConfirmOpen(true); };
  const performDeleteActa = async (actaId: number | null) => {
    if (!actaId) return;
    setLoading(true); setError(null);
    try {
      await api.delete(`/business/actas/${actaId}`);
      setSuccess('Acta eliminada correctamente'); toast.success('Acta eliminada');
      refreshActas();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      logger.error('Error eliminando acta:', err);
      setError(normalizeError(err, 'Error eliminando acta'));
      toast.error(normalizeError(err, 'Error eliminando acta'));
    } finally { setLoading(false); setConfirmOpen(false); setConfirmActaId(null); }
  };

  const getProjectName = (id: any) => projects.find((p) => p.id_proyecto === id)?.nombre_proyecto || id;
  const getUserName = (id: any) => users.find((u) => u.id_usuario === id)?.nombre || id;

  const filteredActas = actas.filter((acta) => {
    const s = searchActas.toLowerCase();
    return (!s || acta.numero_acta?.toLowerCase().includes(s) || acta.tipo_acta?.toLowerCase().includes(s) || acta.estado_acta?.toLowerCase().includes(s) || acta.observaciones?.toLowerCase().includes(s)) &&
      (!filterActaType || acta.tipo_acta === filterActaType) &&
      (!filterActaEstado || acta.estado_acta === filterActaEstado);
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actas de Entrega</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Generación de actas institucionales Securitas</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportMenu module="actas" />
          <Button variant="neo" onClick={resetForm}>Limpiar</Button>
          <Button variant="neo" onClick={saveActaOnly} disabled={saving}>
            {saving ? 'Guardando...' : <><CheckSquare size={14} className="mr-2"/> Guardar Acta</>}
          </Button>
          <Button onClick={generatePDF} disabled={loading}>
            {loading ? 'Generando...' : <><Download size={16} className="mr-2"/> Descargar / Imprimir</>}
          </Button>
        </div>
      </div>

      {error   && <div className="mb-6"><Alert type="error"   message={error}   onClose={() => setError(null)}   /></div>}
      {success && <div className="mb-6"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <SectionTitle>1. Información Técnico</SectionTitle>
            <FormGroup label="Seleccionar Técnico" htmlFor="id_usuario_tecnico">
              <SearchableSelect
                options={users.map((u: any) => ({ value: String(u.id_usuario), label: u.nombre, searchTerms: `${u.nombre} ${u.email || ''} ${u.cedula || ''}` }))}
                value={formData.id_usuario_tecnico?.toString() || ''}
                onChange={(val) => handleUserSelect({ target: { value: val } } as any)}
                placeholder="Escriba para buscar técnico..."
              />
            </FormGroup>
            <FormGroup label="Nombre Completo" htmlFor="nombre_tecnico">
              <NeoInput id="nombre_tecnico" value={formData.nombre_tecnico} onChange={(e) => setFormData({ ...formData, nombre_tecnico: e.target.value })} />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Cédula" htmlFor="cedula"><NeoInput id="cedula" value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} /></FormGroup>
              <FormGroup label="Código" htmlFor="codigo"><NeoInput id="codigo" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} /></FormGroup>
            </div>
            <FormGroup label="Regional" htmlFor="regional"><NeoInput id="regional" value={formData.regional} onChange={(e) => setFormData({ ...formData, regional: e.target.value })} /></FormGroup>
            <FormGroup label="Fecha de Entrega" htmlFor="fecha"><NeoInput id="fecha" type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} /></FormGroup>
            <FormGroup label="Proyecto" htmlFor="id_proyecto">
              <SearchableSelect
                options={projects.map((p: any) => ({ value: String(p.id_proyecto), label: p.nombre_proyecto }))}
                value={formData.id_proyecto}
                onChange={(val) => setFormData({ ...formData, id_proyecto: val })}
                placeholder="Escriba para buscar proyecto..."
              />
            </FormGroup>
            <FormGroup label="Cliente" htmlFor="id_cliente">
              <SearchableSelect
                options={clients.map((c: any) => ({ value: String(c.id_cliente), label: c.nombre }))}
                value={formData.id_cliente}
                onChange={(val) => setFormData({ ...formData, id_cliente: val })}
                placeholder="Escriba para buscar cliente..."
              />
            </FormGroup>
            <FormGroup label="Tipo de Acta" htmlFor="tipo_acta">
              <NeoSelect id="tipo_acta" value={formData.tipo_acta} onChange={(e) => { setFormData({ ...formData, tipo_acta: e.target.value }); if (items.length > 0) setItems([]); }}>
                {ACTA_TYPES.map((t) => (<option key={t} value={t}>{t.replace(/_/g, ' ')}</option>))}
              </NeoSelect>
            </FormGroup>
          </Card>

          <Card>
            <SectionTitle>Firmas & Autorización</SectionTitle>
            <FormGroup label="Representante Securitas" htmlFor="id_usuario_representante">
              <SearchableSelect
                options={[
                  { value: '', label: 'Usar usuario en sesión' },
                  ...representatives.map((u: any) => ({ value: String(u.id_usuario), label: `${u.nombre} (${u.rol})` }))
                ]}
                value={formData.id_usuario_representante?.toString() || ''}
                onChange={(val) => handleRepresentativeSelect({ target: { value: val } } as any)}
                placeholder="Escriba para buscar representante..."
              />
            </FormGroup>
            <FormGroup label="Nombre representante" htmlFor="nombre_representante">
              <NeoInput id="nombre_representante" value={formData.nombre_representante} onChange={(e) => setFormData({ ...formData, nombre_representante: e.target.value })} />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Cédula representante" htmlFor="cedula_representante"><NeoInput id="cedula_representante" value={formData.cedula_representante} onChange={(e) => setFormData({ ...formData, cedula_representante: e.target.value })} /></FormGroup>
              <FormGroup label="Código representante" htmlFor="codigo_representante"><NeoInput id="codigo_representante" value={formData.codigo_representante} onChange={(e) => setFormData({ ...formData, codigo_representante: e.target.value })} /></FormGroup>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-bg4 flex justify-between items-center bg-bg2/30">
              <div className="flex items-center gap-3">
                <Package className="text-emerald-primary" size={18} />
                <SectionTitle>2. Herramienta, Equipos, Consumibles y EPPs</SectionTitle>
              </div>
              <Button variant="neo" className="text-[10px] h-9" onClick={() => setModalOpen(true)}>
                <Plus size={14} className="mr-2" /> Agregar Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <TableContainer>
                <THead>
                  <TH className="w-10">#</TH>
                  <TH>Descripción / Equipo</TH>
                  <TH>Marca</TH>
                  <TH>Referencia</TH>
                  <TH>Serie</TH>
                  <TH className="w-20">Cant.</TH>
                  <TH className="w-10" />
                </THead>
                <TBody>
                  {items.length === 0 ? (
                    <TR><TD colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center opacity-30"><FileText size={48} className="mb-4" /><p className="text-sm font-bold uppercase tracking-widest">No hay items en el acta</p></div>
                    </TD></TR>
                  ) : items.map((item, index) => (
                    <TR key={index}>
                      <TD className="font-bold text-emerald-primary">{index + 1}</TD>
                      <TD><p className="text-xs font-semibold">{item.descripcion}</p></TD>
                      <TD><p className="text-xs text-content-muted">{item.marca || '—'}</p></TD>
                      <TD><p className="text-xs text-content-muted">{item.referencia || '—'}</p></TD>
                      <TD><p className="text-xs text-content-muted font-mono">{item.serie || '—'}</p></TD>
                      <TD><p className="text-xs font-bold text-center">{item.cantidad}</p></TD>
                      <TD><button onClick={() => removeItem(index)} className="text-content-muted hover:text-danger transition-colors p-1"><Trash2 size={16} /></button></TD>
                    </TR>
                  ))}
                </TBody>
              </TableContainer>
            </div>
          </Card>

          <Card>
            <SectionTitle>3. Observaciones Generales</SectionTitle>
            <NeoTextarea placeholder="Notas adicionales..." value={formData.observaciones_generales} onChange={(e) => setFormData({ ...formData, observaciones_generales: e.target.value })} />
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><SectionTitle>Actas Guardadas</SectionTitle></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input id="searchActas" type="text" value={searchActas} onChange={(e) => setSearchActas(e.target.value)} placeholder="Buscar acta..."
                className="w-full rounded-xl border border-bg3 bg-bg1/80 py-3 pl-10 pr-4 text-sm text-content outline-none focus:border-emerald-500" />
            </div>
            <NeoSelect id="filterActaType" value={filterActaType} onChange={(e) => setFilterActaType(e.target.value)} className="h-11 text-xs">
              <option value="">Todos los tipos</option>
              {ACTA_TYPES.map((type) => (<option key={type} value={type}>{type.replace(/_/g, ' ')}</option>))}
            </NeoSelect>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-4">
          <SectionTitle>Listado de Actas</SectionTitle>
          <div className="overflow-x-auto mt-3">
            <TableContainer>
              <THead>
                <TH className="w-10">#</TH><TH>Número</TH><TH className="hidden sm:table-cell">Tipo</TH>
                <TH className="hidden md:table-cell">Proyecto</TH><TH className="hidden lg:table-cell">Técnico</TH>
                <TH>Estado</TH><TH className="hidden sm:table-cell">Fecha</TH><TH className="w-32">Acciones</TH>
              </THead>
              <TBody>
                {filteredActas.length === 0 ? (
                  <TR><TD colSpan={8} className="text-center py-8">No hay actas guardadas</TD></TR>
                ) : filteredActas.map((a: any, idx: number) => (
                  <TR key={a.id_acta || idx}>
                    <TD className="font-bold">{idx + 1}</TD>
                    <TD><p className="text-xs font-semibold">{a.numero_acta || '—'}</p></TD>
                    <TD className="hidden sm:table-cell"><p className="text-xs">{a.tipo_acta?.replace(/_/g, ' ')}</p></TD>
                    <TD className="hidden md:table-cell"><p className="text-xs">{getProjectName(a.id_proyecto)}</p></TD>
                    <TD className="hidden lg:table-cell"><p className="text-xs">{getUserName(a.id_usuario_tecnico)}</p></TD>
                    <TD><p className="text-xs">{a.estado_acta || '—'}</p></TD>
                    <TD className="hidden sm:table-cell"><p className="text-xs">{a.fecha_entrega ? new Date(a.fecha_entrega).toLocaleString() : '—'}</p></TD>
                    <TD>
                      <div className="flex gap-2">
                        <button title="Ver" onClick={() => handleViewActa(a.id_acta)} className="p-1 text-content-muted hover:text-content"><FileText size={16} /></button>
                        {currentUser?.rol === 'ADMIN' && <button title="Editar" onClick={() => handleEditActa(a)} className="p-1 text-content-muted hover:text-content"><Pen size={16} /></button>}
                        <button title="Descargar" onClick={() => generateActaPDF(a.id_acta)} className="p-1 text-content-muted hover:text-content"><Download size={16} /></button>
                        {currentUser?.rol === 'ADMIN' && <button title="Eliminar" onClick={() => handleDeleteActa(a.id_acta)} className="p-1 text-content-muted hover:text-danger"><Trash2 size={16} /></button>}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableContainer>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold">
          Mostrando {actas.length} de {actasTotal} registros
        </div>
        <div className="flex gap-2">
          <Button variant="neo" className="h-8 text-[10px] px-3" disabled={actasPage === 1} onClick={() => { const p = actasPage - 1; setActasPage(p); loadActas(p); }}>Anterior</Button>
          <Button variant="neo" className="h-8 text-[10px] px-3" disabled={actasTotal <= actasPage * actasPageSize} onClick={() => { const p = actasPage + 1; setActasPage(p); loadActas(p); }}>Siguiente</Button>
        </div>
      </div>

      <ItemModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleModalConfirm} inventoryItems={inventoryItems} tipoActa={formData.tipo_acta} />
      <EditActaModal key={editActa?.id_acta || 'new'} isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} acta={editActa} onSaved={refreshActas} />
      <ActaViewModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} acta={viewActa} projectName={getProjectName(viewActa?.id_proyecto)} userName={getUserName(viewActa?.id_usuario_tecnico)} onDownload={generateActaPDF} />
      <ConfirmModal isOpen={confirmOpen} title="Confirmar eliminación" message="¿Eliminar acta? Esta acción no se puede deshacer." onCancel={() => { setConfirmOpen(false); setConfirmActaId(null); }} onConfirm={() => performDeleteActa(confirmActaId)} />
    </DashboardLayout>
  );
};

export default Deliveries;
