import React, { useEffect, useState } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { 
  UserCog, 
  Search, 
  Plus, 
  Mail, 
  Shield, 
  Edit2, 
  Trash2, 
  UserCheck,
  UserX,
  MapPin,
  CreditCard,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
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
  resolveAvatarUrl
} from '../components/Fusion';
import { SearchableSelect } from '../components/SearchableSelect';
import { ConfirmModal } from '../components/Fusion';
import { getUsers, createUser, updateUser, deleteUser, checkUniqueField } from '../services/users';
import { getRegionales } from '../services/regionales';
import { useToast } from '../lib/toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [regionales, setRegionales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors } } = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const effectivePageSize = debouncedSearch ? 1000 : pageSize;

  const fetchData = async (page?: number) => {
    const targetPage = page ?? currentPage;
    setIsLoading(true);
    try {
      const [usersData, regionalesData] = await Promise.all([
        getUsers(targetPage, effectivePageSize),
        getRegionales()
      ]);
      setUsers(usersData.items || []);
      setTotalUsers(usersData.total || 0);
      setRegionales(regionalesData || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, debouncedSearch]);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setValue('nombre', user.nombre);
    setValue('email', user.email);
    setValue('rol', user.rol);
    setValue('cedula', user.cedula || '');
    setValue('codigo_empleado', user.codigo_empleado || '');
    setValue('id_regional', user.id_regional || '');
    setValue('regional', user.regional || '');
    setValue('is_active', user.is_active);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number, message?: string) => {
    setConfirmId(id);
    setConfirmMessage(message || '¿Está seguro de desactivar a este usuario?');
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (confirmId == null) return;
    try {
      await deleteUser(confirmId);
      toast.success('Usuario desactivado correctamente.');
      setCurrentPage(1);
      fetchData(1);
    } catch (error: any) {
      toast.error('Error al desactivar el usuario', { description: error.response?.data?.detail });
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const checkField = async (field: string, value: string) => {
    const excludeId = editingUser?.id_usuario;
    const result = await checkUniqueField(field, value, excludeId);
    if (!result.available) {
      setError(field, { type: 'manual', message: result.error || `Este ${field} ya está en uso.` });
    } else {
      clearErrors(field);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    if (data.password && data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    // Si estamos editando y no se ingresó contraseña, la removemos del payload
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    delete payload.confirmPassword;

    // Convertir is_active a booleano real
    payload.is_active = payload.is_active === 'true' || payload.is_active === true;
    
    // Convertir id_regional a número o null
    payload.id_regional = payload.id_regional ? parseInt(payload.id_regional) : null;

    

    try {
      if (editingUser) {
        await updateUser(editingUser.id_usuario, payload);
        toast.success('Usuario actualizado exitosamente.');
      } else {
        await createUser(payload);
        toast.success('Usuario creado exitosamente.');
      }
      closeModal();
      setCurrentPage(1);
      fetchData(1);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al procesar el usuario', { description: error.response?.data?.detail || 'Intente de nuevo.' });
    }
  };


  const filteredUsers = users.filter((u: any) => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cedula?.includes(searchTerm)
  );

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    TECNICO: 'Técnico',
    TECNICO_LABORATORIO: 'Técnico de Laboratorio',
    SUPERVISOR: 'Supervisor',
    BODEGUERO: 'Bodeguero',
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">Gestión de Usuarios</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Control de acceso y roles del sistema (RBAC)</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu module="users" />
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Nuevo Usuario
          </Button>
        </div>
      </div>

  
      <Card className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
          <NeoInput 
            placeholder="Buscar por nombre, correo o cédula..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
        <TableContainer>
          <THead>
            <TH>Usuario / Nombre</TH>
            <TH className="hidden sm:table-cell">Identificación</TH>
            <TH className="hidden md:table-cell">Cód. Empleado</TH>
            <TH className="hidden lg:table-cell">Regional</TH>
            <TH>Rol</TH>
            <TH className="hidden sm:table-cell">Estado</TH>
            <TH></TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={7} className="text-center py-20 text-content-primary font-bold">
                  Sincronizando Usuarios...
                </TD>
              </TR>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TR key={u.id_usuario}>
                  <TD>
                    <div className="flex items-center gap-4">
                      {u.avatar_url ? (
                        <img
                          src={resolveAvatarUrl(u.avatar_url)}
                          alt={u.nombre}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-primary/20 shadow-neo shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center text-emerald-primary border border-white/5 shadow-neo shrink-0 uppercase font-bold">
                          {u.nombre.substring(0, 2)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-xs md:text-sm text-content-primary">{u.nombre}</span>
                        <span className="text-[10px] text-content-muted">{u.email}</span>
                      </div>
                    </div>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <span className="text-xs text-content-secondary">{u.cedula || '---'}</span>
                  </TD>
                  <TD className="hidden md:table-cell">
                    <span className="text-xs text-content-secondary">{u.codigo_empleado || '---'}</span>
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <span className="text-xs text-content-secondary">{u.regional_rel?.nombre || u.regional || '---'}</span>
                  </TD>
                  <TD>
                    <Badge label={ROLE_LABELS[u.rol] ?? u.rol} color="#9B6DFF" bg="rgba(155, 109, 255, 0.1)" />
                  </TD>
                  <TD className="hidden sm:table-cell">
                    {u.is_active ? (
                      <div className="flex items-center gap-1 text-emerald-primary">
                        <UserCheck size={12} />
                        <span className="text-[9px] font-bold uppercase">Activo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <UserX size={12} />
                        <span className="text-[9px] font-bold uppercase">Inactivo</span>
                      </div>
                    )}
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-white/5"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => openConfirm(u.id_usuario)}
                        className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-all shadow-neo border border-white/5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={7} className="text-center py-20 text-content-muted italic text-xs md:text-sm">No hay usuarios registrados.</TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-white/5">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold text-center sm:text-left">
          Mostrando {users.length} de {totalUsers} registros
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
            disabled={totalUsers <= currentPage * pageSize}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}
        footer={
          <>
            <Button variant="ghost"  onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>{editingUser ? "Actualizar Usuario" : "Crear Usuario"}</Button>
          </>
        }
      >
        <form className="space-y-3 text-[11px] md:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Nombre Completo" error={errors.nombre?.message as string}>
              <NeoInput {...register('nombre', { required: 'Obligatorio' })} placeholder="Nombre" />
            </FormGroup>
            <FormGroup label="Correo Electrónico" error={errors.email?.message as string}>
              <NeoInput
                {...register('email', {
                  required: 'Obligatorio',
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Formato de correo inválido' }
                })}
                type="email"
                placeholder="correo@securitas.com"
                onBlur={(e: any) => { if (e.target.value && !errors.email?.message) checkField('email', e.target.value); }}
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormGroup label="Cédula" error={errors.cedula?.message as string}>
              <NeoInput
                {...register('cedula')}
                placeholder="CC."
                onBlur={(e: any) => { if (e.target.value) checkField('cedula', e.target.value); }}
              />
            </FormGroup>
            <FormGroup label="Código Empleado" error={errors.codigo_empleado?.message as string}>
              <NeoInput
                {...register('codigo_empleado')}
                placeholder="Código"
                onBlur={(e: any) => { if (e.target.value) checkField('codigo_empleado', e.target.value); }}
              />
            </FormGroup>
            <FormGroup label="Regional">
              <SearchableSelect
                options={regionales.map((r: any) => ({ value: String(r.id_regional), label: r.nombre }))}
                value={watch('id_regional') || ''}
                onChange={(val) => setValue('id_regional', val)}
                placeholder="Buscar regional..."
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Rol de Sistema">
              <NeoSelect {...register('rol')}>
                <option value="ADMIN">Administrador</option>
                <option value="TECNICO">Técnico</option>
                <option value="TECNICO_LABORATORIO">Técnico de Laboratorio</option>
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Estado">
              <NeoSelect {...register('is_active')}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </NeoSelect>
            </FormGroup>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3">
            <p className="text-[9px] md:text-xs text-content-muted mb-3 uppercase tracking-wider font-bold">
              {editingUser ? "Cambiar contraseña" : "Credenciales de Acceso"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <FormGroup label="Contraseña">
                  <NeoInput {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                </FormGroup>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-emerald-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative">
                <FormGroup label="Confirmar Contraseña">
                  <NeoInput {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" />
                </FormGroup>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-emerald-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar desactivación"
        message={confirmMessage}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={performDelete}
      />
    </DashboardLayout>
  );
};

export default UsersPage;
