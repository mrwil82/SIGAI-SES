import React, { useEffect, useState } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { 
  Briefcase, 
  Search, 
  Plus, 
  Building2, 
  MapPin, 
  Edit2, 
  Trash2, 
  ChevronRight,
  Target,
  Download
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
  Alert,
  NeoTextarea
} from '../components/Fusion';
import { SearchableSelect } from '../components/SearchableSelect';
import { ConfirmModal } from '../components/Fusion';
import { useToast } from '../lib/toast';
import { getProyectos, createProyecto, getClientes, deleteProyecto, updateProyecto } from '../services/business';
import { downloadTemplate } from '../services/inventory';
import { logger } from '../lib/logger';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<any | null>(null);
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
      const [projData, cliData] = await Promise.all([
        getProyectos(0, 1000),
        getClientes(0, 1000)
      ]);
      setProyectos(projData.items || []);
      setClientes(cliData.items || []);
    } catch (error) {
      logger.error('Failed to fetch projects data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (proj: any) => {
    setEditingProyecto(proj);
    setValue('nombre_proyecto', proj.nombre_proyecto);
    setValue('id_cliente', proj.id_cliente);
    setValue('centro_costos', proj.centro_costos);
    setValue('estado', proj.estado);
    setValue('ubicacion', proj.ubicacion);
    setValue('fecha_inicio', proj.fecha_inicio ? proj.fecha_inicio.split('T')[0] : '');
    setValue('fecha_fin_estimada', proj.fecha_fin_estimada ? proj.fecha_fin_estimada.split('T')[0] : '');
    setValue('fecha_cierre_real', proj.fecha_cierre_real ? proj.fecha_cierre_real.split('T')[0] : '');
    setValue('descripcion', proj.descripcion || '');
    setIsModalOpen(true);
  };

  const openConfirm = (id: number, message?: string) => {
    setConfirmId(id);
    setConfirmMessage(message || '¿Está seguro de eliminar este proyecto?');
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (confirmId == null) return;
    try {
      await deleteProyecto(confirmId);
      toast.success('Proyecto eliminado correctamente.');
      setAlert(null);
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar el proyecto.');
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProyecto(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      // Asegurar que id_cliente sea un número o null si no se selecciona
      const payload = {
        ...data,
        id_cliente: data.id_cliente ? parseInt(data.id_cliente) : null,
        fecha_inicio: data.fecha_inicio || null,
        fecha_fin_estimada: data.fecha_fin_estimada || null,
        fecha_cierre_real: data.fecha_cierre_real || null,
        descripcion: data.descripcion || null
      };

      if (editingProyecto) {
        await updateProyecto(editingProyecto.id_proyecto, payload);
        setAlert({ type: 'success', message: 'Proyecto actualizado correctamente.' });
      } else {
        await createProyecto(payload);
        setAlert({ type: 'success', message: 'Proyecto creado correctamente.' });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      setAlert({ type: 'error', message: 'Error al procesar el proyecto.' });
    }
  };

  const filteredProyectos = proyectos.filter(p => 
    p.nombre_proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.centro_costos?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Proyectos</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Locaciones de instalación y centros de costo</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <ExportMenu module="projects" />
          <Button variant="neo" className="flex items-center gap-2" onClick={() => downloadTemplate("proyectos")}>
            <Download size={14} />
            Plantilla
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Nuevo Proyecto
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
            placeholder="Buscar por nombre o CECO..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
        <TableContainer>
          <THead>
            <TH>Nombre del Proyecto</TH>
            <TH className="hidden md:table-cell">Cliente Asociado</TH>
            <TH className="hidden sm:table-cell">CECO / Centro Costos</TH>
            <TH className="hidden lg:table-cell">Ubicación</TH>
            <TH>Estado</TH>
            <TH></TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="w-10 h-10 border-2 border-chart-blue/30 border-t-chart-blue rounded-full animate-spin mx-auto mb-3" />
                  <span className="text-chart-blue uppercase tracking-widest font-bold text-[10px]">Cargando Proyectos...</span>
                </TD>
              </TR>
            ) : filteredProyectos.length > 0 ? (
              filteredProyectos.map((proj) => (
                <TR key={proj.id_proyecto}>
                  <TD>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center text-chart-blue border border-white/5 shadow-neo shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div className="font-bold text-xs md:text-sm text-content-primary truncate max-w-[150px] sm:max-w-[250px] lg:max-w-none">{proj.nombre_proyecto}</div>
                    </div>
                  </TD>
                  <TD className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Building2 size={12} className="text-content-muted" />
                      <span className="text-[11px] text-content-secondary">{proj.cliente?.nombre || 'Interno'}</span>
                    </div>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <Badge label={proj.centro_costos || 'S.C.'} color="var(--chart-blue)" bg="rgba(0,163,255,0.05)" />
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-content-muted" />
                      <span className="text-[11px] text-content-secondary truncate max-w-[150px]">{proj.ubicacion || 'No definida'}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge 
                      label={proj.estado} 
                      color={proj.estado === 'ACTIVO' ? 'var(--emerald)' : 'var(--gold)'} 
                      bg={proj.estado === 'ACTIVO' ? 'var(--emerald-muted)' : 'rgba(255,184,0,0.1)'} 
                    />
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(proj)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-white/5"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => openConfirm(proj.id_proyecto)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-all shadow-neo border border-white/5"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button 
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-content-primary transition-all shadow-neo border border-white/5"
                        onClick={() => navigate(`/projects/${proj.id_proyecto}`)}
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={6} className="text-center py-20 text-content-muted italic text-xs md:text-sm">Sin proyectos registrados.</TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      {/* Modal de Registro */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>{editingProyecto ? "Guardar Cambios" : "Crear Proyecto"}</Button>
          </>
        }
      >
        <form className="space-y-4 text-[11px] md:text-xs">
          <FormGroup label="Nombre del Proyecto" error={errors.nombre_proyecto?.message as string}>
            <NeoInput 
              {...register('nombre_proyecto', { required: 'El nombre es obligatorio' })}
              placeholder="Ej: Instalación Cámaras Sede Sur" 
            />
          </FormGroup>
          
          <FormGroup label="Cliente Responsable">
            <SearchableSelect
              options={clientes.map((c: any) => ({ value: String(c.id_cliente), label: c.nombre }))}
              value={watch('id_cliente') || ''}
              onChange={(val) => setValue('id_cliente', val)}
              placeholder="Escriba para buscar cliente..."
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Centro de Costos">
              <NeoInput {...register('centro_costos')} placeholder="Ej: 102030" />
            </FormGroup>
            <FormGroup label="Estado">
              <NeoSelect {...register('estado')}>
                <option value="ACTIVO">Activo</option>
                <option value="PAUSADO">Pausado</option>
                <option value="FINALIZADO">Finalizado</option>
              </NeoSelect>
            </FormGroup>
          </div>

          <FormGroup label="Ubicación Física / Dirección">
            <NeoInput {...register('ubicacion')} placeholder="Ej: Calle 100 #15-20, Bogotá" />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormGroup label="Fecha Inicio">
              <NeoInput type="date" {...register('fecha_inicio')} />
            </FormGroup>
            <FormGroup label="Fin Estimado">
              <NeoInput type="date" {...register('fecha_fin_estimada')} />
            </FormGroup>
            <FormGroup label="Cierre Real">
              <NeoInput type="date" {...register('fecha_cierre_real')} />
            </FormGroup>
          </div>

          <FormGroup label="Descripción Detallada">
            <NeoTextarea {...register('descripcion')} placeholder="Notas sobre el alcance del proyecto..." />
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

export default Projects;
