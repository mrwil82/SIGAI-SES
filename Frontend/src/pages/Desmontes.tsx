import React, { useState, useEffect } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { ClipboardCheck, Package, RotateCcw, Download, Plus, Search } from 'lucide-react';
import { 
  DashboardLayout, 
  Card, 
  Button, 
  TableContainer,
  THead,
  TBody,
  TH,
  TR,
  TD,
  Alert,
  NeoSelect,
  NeoTextarea,
  Modal,
  FormGroup,
  Badge
} from '../components/Fusion';
import { ConfirmModal } from '../components/Fusion';
import { SearchableSelect } from '../components/SearchableSelect';
import { useToast } from '../lib/toast';
import { getActivosParaTriaje, actualizarTriajeActivo } from '../services/desmontes';
import { getInventoryItems, crearDesmonteBulk, importInventory } from '../services/inventory';
import { getProyectos, getClientes } from '../services/business';

const Desmontes: React.FC = () => {
  const [activos, setActivos] = useState<any[]>([]);
  const [triajeData, setTriajeData] = useState<Record<number, { calificacion: string, observaciones: string }>>({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para Registro de Desmonte
  const [isDesmonteModalOpen, setIsDesmonteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(undefined);

  const [desmonteSelections, setDesmonteSelections] = useState<Record<number, number>>({});
  const [desmonteSearch, setDesmonteSearch] = useState('');
  const [desmonteCatFilter, setDesmonteCatFilter] = useState('all');

  useEffect(() => {
    cargarActivos();
    cargarCatalogos();
  }, []);

  const cargarActivos = async () => {
    setIsLoading(true);
    try {
      const data = await getActivosParaTriaje();
      const itemsList = data.items || [];
      setActivos(itemsList);
      const initialData: any = {};
      itemsList.forEach((a: any) => {
        initialData[a.id_activo] = { calificacion: a.calificacion_tecnica || 'BUENO', observaciones: a.observaciones || '' };
      });
      setTriajeData(initialData);
    } catch (err) {
      setError("Error al cargar activos en laboratorio");
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [itemsData, projectsData, clientesData] = await Promise.all([
        getInventoryItems(0, 1000, undefined, true),
        getProyectos(0, 100),
        getClientes(0, 100)
      ]);
      setItems(itemsData.items || []);
      setProjects(projectsData.items || projectsData || []);
      setClientes(clientesData.items || clientesData || []);
    } catch (err) {
      console.error("Error cargando catálogos", err);
    }
  };

  const procesarTriaje = async (id: number) => {
    // Abrir confirm modal
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);
  const closeConfirm = () => { setConfirmOpen(false); setConfirmTarget(null); };
  const performProcesarTriaje = async (id: number | null) => {
    if (!id) return closeConfirm();
    setLoading(true);
    try {
      const { calificacion, observaciones } = triajeData[id];
      await actualizarTriajeActivo(id, { calificacion_tecnica: calificacion, observaciones: observaciones });
      setSuccess(`Evaluación técnica guardada exitosamente.`);
      toast.success('Evaluación guardada');
      await cargarActivos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al guardar triaje");
      toast.error('Error al guardar triaje');
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const desmonteSelectedCount = Object.keys(desmonteSelections).length;

  const toggleDesmonteItem = (id: number) => {
    setDesmonteSelections((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const setDesmonteQty = (id: number, val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    setDesmonteSelections((prev) => ({ ...prev, [id]: n }));
  };

  const handleDesmonteSubmit = async () => {
    if (desmonteSelectedCount === 0 || (!selectedProjectId && !selectedClienteId)) {
      setError('Seleccione al menos un equipo y un origen (Cliente o Proyecto).');
      return;
    }

    const itemsPayload = Object.entries(desmonteSelections).map(([idStr, cantidad]) => ({
      id_item: parseInt(idStr),
      cantidad
    }));
    
    try {
      setLoading(true);
      const result = await crearDesmonteBulk({
        items: itemsPayload,
        id_proyecto: selectedProjectId,
        id_cliente: selectedClienteId,
      });
      setSuccess(`${result.items_registrados} equipos registrados como desmonte.`);
      setIsDesmonteModalOpen(false);
      setDesmonteSelections({});
      setDesmonteSearch('');
      setDesmonteCatFilter('all');
      cargarActivos();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || 'Error al registrar desmontes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Desmontes (Triaje)</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Evaluación técnica de equipos retirados en laboratorio</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ExportMenu module="desmontes" />
          <Button variant="neo" className="flex items-center gap-2" onClick={() => setIsDesmonteModalOpen(true)}>
            <Plus size={16} />
            Registrar Desmonte
          </Button>
          <Button variant="neo" className="flex items-center gap-2" onClick={() => setIsImportModalOpen(true)}>
            <Download size={16} className="rotate-180" />
            Carga Excel
          </Button>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
      {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}

      <Card className="p-0 overflow-hidden">
        <TableContainer>
          <THead>
            <TH>Serial</TH>
            <TH className="hidden sm:table-cell">Equipo</TH>
            <TH className="hidden md:table-cell">Origen</TH>
            <TH>Calificación</TH>
            <TH className="hidden lg:table-cell">Observaciones</TH>
            <TH className="text-right">Acción</TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-emerald-primary/30 border-t-emerald-primary rounded-full animate-spin" />
                    <span className="text-emerald-primary uppercase tracking-[0.2em] font-bold text-[10px]">Cargando activos...</span>
                  </div>
                </TD>
              </TR>
            ) : activos.length > 0 ? (
              activos.map((activo) => (
                <TR key={activo.id_activo}>
                  <TD className="font-bold font-mono text-emerald-primary">{activo.serial}</TD>
                  <TD className="hidden sm:table-cell">
                    <div className="text-xs font-bold text-content-primary">{activo.item?.nombre_equipo || '---'}</div>
                    <div className="text-[9px] text-content-muted uppercase">{activo.item?.referencia}</div>
                  </TD>
                  <TD className="hidden md:table-cell text-xs text-content-secondary">
                    {activo.proyecto && (
                      <div className="text-[9px] text-emerald-primary/70 font-bold uppercase">
                        PROY: {activo.proyecto.nombre_proyecto}
                      </div>
                    )}
                    {activo.cliente_actual && (
                      <div className="text-[9px] text-chart-blue font-bold uppercase mt-0.5">
                        CLI: {activo.cliente_actual.nombre_comercial}
                      </div>
                    )}
                    {!activo.proyecto && !activo.cliente_actual && <span className="text-[9px] italic">Sin origen definido</span>}
                  </TD>
                  <TD>
                    <NeoSelect 
                      className="h-9 text-xs"
                      value={triajeData[activo.id_activo]?.calificacion || 'BUENO'}
                      onChange={(e: any) => setTriajeData(prev => ({...prev, [activo.id_activo]: { ...prev[activo.id_activo], calificacion: e.target.value }}))}
                    >
                      <option value="BUENO">Bueno (Reingreso)</option>
                      <option value="RECUPERABLE">Recuperable (Garantía/Rep.)</option>
                      <option value="DESECHO">Desecho (Baja)</option>
                    </NeoSelect>
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <NeoTextarea 
                      className="min-h-[40px] max-h-[80px] p-2 text-xs" 
                      placeholder="Notas del triaje..."
                      value={triajeData[activo.id_activo]?.observaciones || ''}
                      onChange={(e: any) => setTriajeData(prev => ({...prev, [activo.id_activo]: { ...prev[activo.id_activo], observaciones: e.target.value }}))} 
                    />
                  </TD>
                  <TD className="text-right">
                    <Button 
                      variant="primary" 
                      className="h-9 px-3"
                      disabled={loading}
                      onClick={() => procesarTriaje(activo.id_activo)}
                    >
                      <ClipboardCheck size={16} className="mr-2" /> Guardar
                    </Button>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center opacity-30">
                    <Package size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No hay activos para triaje</p>
                    <p className="text-[10px] mt-1 text-center">Todos los equipos en laboratorio han sido procesados</p>
                    <Button variant="neo" className="mt-6" onClick={cargarActivos}>
                      <RotateCcw size={14} className="mr-2" /> Refrescar
                    </Button>
                  </div>
                </TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      {/* Modal Registrar Desmonte Manual */}
      <Modal
        isOpen={isDesmonteModalOpen}
        onClose={() => { setIsDesmonteModalOpen(false); setDesmonteSelections({}); setDesmonteSearch(''); setDesmonteCatFilter('all'); }}
        title="Ingreso de Desmonte (Manual)"
        className="max-w-4xl"
        footer={<><Button variant="ghost" onClick={() => { setIsDesmonteModalOpen(false); setDesmonteSelections({}); setDesmonteSearch(''); setDesmonteCatFilter('all'); }}>Cancelar</Button><Button onClick={handleDesmonteSubmit} disabled={desmonteSelectedCount === 0}>Registrar Ingreso ({desmonteSelectedCount} items)</Button></>}
      >
        <div className="space-y-4 text-[11px] md:text-xs">
          {/* Origen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Cliente de Origen">
              <NeoSelect
                value={selectedClienteId !== undefined ? String(selectedClienteId) : ''}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setSelectedClienteId(val ? parseInt(val) : undefined);
                  setSelectedProjectId(undefined);
                }}
              >
                <option value="">Seleccione cliente...</option>
                {clientes.map((c: any) => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
                ))}
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Proyecto de Origen">
              <NeoSelect
                value={selectedProjectId !== undefined ? String(selectedProjectId) : ''}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setSelectedProjectId(val ? parseInt(val) : undefined);
                  setSelectedClienteId(undefined);
                }}
              >
                <option value="">Seleccione proyecto...</option>
                {projects.map((p: any) => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre_proyecto}</option>
                ))}
              </NeoSelect>
            </FormGroup>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'EQUIPO', 'HERRAMIENTA', 'CONSUMIBLE', 'REPUESTO', 'SEGURIDAD', 'OTROS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setDesmonteCatFilter(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all border ${
                  desmonteCatFilter === cat
                    ? 'bg-emerald-500/12 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/4 border-white/10 text-content-muted hover:border-emerald-500/20 hover:text-content'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-white/8 px-3 py-1.5 bg-white/4">
              <Search size={12} className="text-content-muted" />
              <input
                type="text"
                value={desmonteSearch}
                onChange={(e) => setDesmonteSearch(e.target.value)}
                placeholder="Buscar equipo..."
                className="bg-transparent text-[11px] text-content outline-none w-40 placeholder:text-content-muted"
              />
            </div>
          </div>

          {/* Tabla de items */}
          <div className="overflow-y-auto max-h-[400px] border border-white/5 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-10 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm"></th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm">Equipo</th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm">Categoría</th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm">Marca</th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm">Ref.</th>
                  <th className="w-24 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-white/5 sticky top-0 bg-bg1/95 backdrop-blur-sm">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {items.filter((it: any) => {
                  const cat = it.categoria ?? 'OTROS';
                  const matchesCat = desmonteCatFilter === 'all' || cat === desmonteCatFilter;
                  const term = desmonteSearch.toLowerCase();
                  const matchSearch = !term || 
                    (it.nombre_equipo?.toLowerCase().includes(term)) ||
                    (it.marca?.toLowerCase().includes(term)) ||
                    (it.referencia?.toLowerCase().includes(term));
                  return matchesCat && matchSearch;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Package size={36} className="mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest">Sin items disponibles</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.filter((it: any) => {
                    const cat = it.categoria ?? 'OTROS';
                    const matchesCat = desmonteCatFilter === 'all' || cat === desmonteCatFilter;
                    const term = desmonteSearch.toLowerCase();
                    const matchSearch = !term || 
                      (it.nombre_equipo?.toLowerCase().includes(term)) ||
                      (it.marca?.toLowerCase().includes(term)) ||
                      (it.referencia?.toLowerCase().includes(term));
                    return matchesCat && matchSearch;
                  }).map((it: any) => {
                    const isSelected = desmonteSelections[it.id_item] !== undefined;
                    return (
                      <tr
                        key={it.id_item}
                        onClick={() => toggleDesmonteItem(it.id_item)}
                        className="cursor-pointer border-b border-white/3 transition-colors"
                        style={{ background: isSelected ? 'rgba(52,211,153,0.06)' : undefined }}
                      >
                        <td className="px-4 py-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            isSelected ? 'bg-emerald-400 text-bg1' : 'border border-white/15'
                          }`}>
                            {isSelected && <span className="text-[9px] font-bold">✓</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-semibold text-content">{it.nombre_equipo}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 text-content-muted">
                            {it.categoria || 'OTROS'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-content-muted">{it.marca || '---'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-content-muted">{it.referencia || '---'}</td>
                        <td className="px-4 py-2.5" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <input
                            type="number"
                            min={1}
                            value={desmonteSelections[it.id_item] ?? 1}
                            disabled={!isSelected}
                            onChange={(e) => setDesmonteQty(it.id_item, e.target.value)}
                            className="w-16 text-center text-[11px] rounded-md border border-white/8 py-1 px-2 bg-white/5 text-content outline-none focus:border-emerald-500/30 disabled:opacity-30"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[9px] text-content-muted uppercase tracking-widest">
            Se crearán activos con serial auto-generado y ubicación "Laboratorio", listos para triaje.
          </p>
        </div>
      </Modal>

      {/* Modal de Importación */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Carga Masiva de Desmontes (Excel)"
        footer={<><Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Cerrar</Button></>}
      >
        <div className="space-y-6 text-[11px] md:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Asociar a Cliente">
              <SearchableSelect
                options={[{ value: '', label: 'Ninguno' }, ...clientes.map((c: any) => ({ value: String(c.id_cliente), label: c.nombre }))]}
                value={selectedClienteId !== undefined ? String(selectedClienteId) : ''}
                onChange={(val) => {
                  setSelectedClienteId(val ? parseInt(val) : undefined);
                  setSelectedProjectId(undefined);
                }}
                placeholder="Escriba para buscar cliente..."
              />
            </FormGroup>

            <FormGroup label="Asociar a Proyecto">
              <SearchableSelect
                options={[{ value: '', label: 'Ninguno' }, ...projects.map((p: any) => ({ value: String(p.id_proyecto), label: p.nombre_proyecto }))]}
                value={selectedProjectId !== undefined ? String(selectedProjectId) : ''}
                onChange={(val) => {
                  setSelectedProjectId(val ? parseInt(val) : undefined);
                  setSelectedClienteId(undefined);
                }}
                placeholder="Escriba para buscar proyecto..."
              />
            </FormGroup>
          </div>

          <div className="p-4 border-2 border-dashed border-white/10 rounded-xl bg-bg3/50 text-center">
            <input 
              type="file" 
              id="excel-upload" 
              className="hidden" 
              accept=".xlsx,.xls,.csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImporting(true);
                  try {
                    const res = await importInventory(file, selectedProjectId, selectedClienteId);
                    setSuccess(res.mensaje);
                    cargarActivos();
                    setIsImportModalOpen(false);
                  } catch (err: any) {
                    const detail = err.response?.data?.detail;
                    setError(Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || 'Error al importar archivo'));
                  } finally {
                    setImporting(false);
                  }
                }
              }}
            />
            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${importing ? 'bg-gold animate-pulse' : 'bg-emerald-primary/10 text-emerald-primary'}`}>
                <Download size={24} className="rotate-180" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm">{importing ? 'Procesando registros...' : 'Click para subir archivo'}</p>
                <p className="text-[10px] text-content-muted">Soporta Inventario_laboratorio.xlsx</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>
      <ConfirmModal isOpen={confirmOpen} title="Confirmar evaluación" message="¿Está seguro de guardar la evaluación técnica de este equipo?" onCancel={closeConfirm} onConfirm={() => performProcesarTriaje(confirmTarget)} />
    </DashboardLayout>
  );
};

export default Desmontes;