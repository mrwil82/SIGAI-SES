import React, { useEffect, useState } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  Mail, 
  ExternalLink,
  Edit2,
  Trash2,
  Phone,
  Briefcase
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
  Alert
  , ConfirmModal
} from '../components/Fusion';
import { useToast } from '../lib/toast';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/business';
import { logger } from '../lib/logger';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); } }, [alert]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const data = await getClientes();
      setClientes(data.items || []);
    } catch (error) {
      logger.error('Failed to fetch clients', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente);
    setValue('nombre', cliente.nombre);
    setValue('nit', cliente.nit);
    setValue('tipo_cliente', cliente.tipo_cliente);
    setValue('contacto', cliente.contacto);
    setValue('ceco_asociado', cliente.ceco_asociado);
    setValue('email_contacto', cliente.email_contacto);
    setValue('telefono', cliente.telefono);
    setValue('direccion', cliente.direccion);
    setValue('ciudad', cliente.ciudad);
    setValue('departamento', cliente.departamento);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    openConfirmDelete(id);
  };

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openConfirmDelete = (id: number) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };
  const closeConfirm = () => { setConfirmId(null); setConfirmOpen(false); };
  const performDelete = async (id: number | null) => {
    if (!id) return closeConfirm();
    try {
      await deleteCliente(id);
      toast.success('Cliente eliminado correctamente.');
      fetchClientes();
    } catch (error) {
      toast.error('Error al eliminar el cliente.');
    } finally {
      closeConfirm();
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id_cliente, data);
        setAlert({ type: 'success', message: 'Cliente actualizado exitosamente.' });
      } else {
        await createCliente(data);
        setAlert({ type: 'success', message: 'Cliente registrado exitosamente.' });
      }
      closeModal();
      fetchClientes();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || 'Error al procesar la solicitud.');
      setAlert({ type: 'error', message: msg });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
    reset();
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.nit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directorio de Clientes</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Gestión de cuentas corporativas e internas</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu module="clientes" />
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Nuevo Cliente
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
          <NeoInput 
            placeholder="Buscar por nombre, NIT o CECO..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
        <TableContainer>
          <THead>
            <TH>Cliente / Empresa</TH>
            <TH className="hidden sm:table-cell">NIT / ID</TH>
            <TH>Tipo</TH>
            <TH className="hidden md:table-cell">Contacto Principal</TH>
            <TH className="hidden lg:table-cell">CECO</TH>
            <TH></TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-chart-purple/30 border-t-chart-purple rounded-full animate-spin" />
                    <span className="text-chart-purple uppercase tracking-[0.2em] font-bold text-[10px]">Cargando Cuentas...</span>
                  </div>
                </TD>
              </TR>
            ) : filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <TR key={cliente.id_cliente}>
                  <TD>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-bg3 flex items-center justify-center text-chart-purple border border-white/5 shadow-neo shrink-0">
                        <Building2 size={16} className="md:size-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs md:text-sm text-content-primary truncate max-w-[150px] md:max-w-none">{cliente.nombre}</div>
                        <div className="sm:hidden text-[9px] text-content-muted font-mono mt-0.5">{cliente.nit || 'S.N.'}</div>
                      </div>
                    </div>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="font-mono text-content-secondary text-[10px] md:text-[11px] bg-bg3/50 px-2 py-1 rounded inline-block border border-white/5">
                      {cliente.nit || 'S.N.'}
                    </div>
                  </TD>
                  <TD>
                    <Badge 
                      label={cliente.tipo_cliente} 
                      color={cliente.tipo_cliente === 'CORPORATIVO' ? 'var(--chart-blue)' : 'var(--chart-teal)'}
                      bg="rgba(0, 163, 255, 0.05)"
                    />
                  </TD>
                  <TD className="hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-content-primary font-bold">
                        <Users size={12} className="text-chart-purple" />
                        <span className="text-[11px]">{cliente.contacto || 'No asignado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-content-muted">
                        <Mail size={10} />
                        <span className="text-[10px] truncate max-w-[120px]">{cliente.email_contacto || '---'}</span>
                      </div>
                    </div>
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <span className="font-mono text-content-primary font-bold text-xs">{cliente.ceco_asociado || '---'}</span>
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1.5 md:gap-2">
                      <button 
                        onClick={() => handleEdit(cliente)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-white/5"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cliente.id_cliente)}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-all shadow-neo border border-white/5"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button 
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-content-primary transition-all shadow-neo border border-white/5"
                        onClick={() => navigate(`/clients/${cliente.id_cliente}`)}
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
                  Sin coincidencias.
                </TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      {/* Modal de Registro / Edición */}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingCliente ? "Editar Cuenta de Cliente" : "Registrar Nuevo Cliente"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>{editingCliente ? "Actualizar Cuenta" : "Registrar Cuenta"}</Button>
          </>
        }
      >
        <form className="space-y-4 text-[11px] md:text-xs">
          <FormGroup label="Nombre de la Empresa / Cliente" error={errors.nombre?.message as string}>
            <NeoInput 
              {...register('nombre', { required: 'El nombre es obligatorio' })}
              placeholder="Ej: Procafecol S.A." 
            />
          </FormGroup>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="NIT / Identificación">
              <NeoInput {...register('nit')} placeholder="Ej: 900123456-1" />
            </FormGroup>
            <FormGroup label="Tipo de Cliente">
              <NeoSelect {...register('tipo_cliente')}>
                <option value="CORPORATIVO">Corporativo</option>
                <option value="INTERNO">Interno (Securitas)</option>
                <option value="GENERAL">General</option>
              </NeoSelect>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Nombre de Contacto">
              <NeoInput {...register('contacto')} placeholder="Ej: Juan Pérez" />
            </FormGroup>
            <FormGroup label="CECO Asociado">
              <NeoInput {...register('ceco_asociado')} placeholder="Ej: 102030" />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Email de Contacto">
              <NeoInput type="email" {...register('email_contacto')} placeholder="contacto@empresa.com" />
            </FormGroup>
            <FormGroup label="Teléfono">
              <NeoInput {...register('telefono')} placeholder="+57 300..." />
            </FormGroup>
          </div>

          <FormGroup label="Dirección">
            <NeoInput {...register('direccion')} placeholder="Ej: Calle 100 # 15-20" />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Ciudad">
              <NeoInput {...register('ciudad')} placeholder="Ej: Bogotá" />
            </FormGroup>
            <FormGroup label="Departamento">
              <NeoInput {...register('departamento')} placeholder="Ej: Cundinamarca" />
            </FormGroup>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar cliente"
        message="¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer."
        onCancel={closeConfirm}
        onConfirm={() => performDelete(confirmId)}
      />
    </DashboardLayout>
  );
};

export default Clients;
