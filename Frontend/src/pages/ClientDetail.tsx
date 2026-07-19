import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Hash, User, Briefcase } from 'lucide-react';
import { DashboardLayout, Card, Button, SectionTitle, Badge } from '../components/Fusion';
import { getClienteById } from '../services/business';
import { useToast } from '../lib/toast';

interface Cliente {
  id_cliente: number;
  nombre: string;
  nit: string;
  tipo_cliente: string;
  contacto: string;
  email_contacto: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  ceco_asociado: string;
}

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getClienteById(parseInt(id))
      .then(setCliente)
      .catch(() => toast.error('Error al cargar el cliente'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-chart-purple/30 border-t-chart-purple rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!cliente) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-content-muted">Cliente no encontrado</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/clients')} className="p-2 rounded-xl bg-bg3 text-content-muted hover:text-emerald-primary transition-all border border-white/5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{cliente.nombre}</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Detalle de cuenta de cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <SectionTitle>Información General</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-chart-purple mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Nombre</p>
                <p className="font-bold text-sm">{cliente.nombre}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Hash size={16} className="text-chart-blue mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">NIT</p>
                <p className="font-mono text-sm">{cliente.nit || 'S.N.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase size={16} className="text-chart-teal mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Tipo</p>
                <Badge label={cliente.tipo_cliente} color="var(--chart-blue)" bg="rgba(0,163,255,0.05)" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={16} className="text-gold mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Contacto</p>
                <p className="font-bold text-sm">{cliente.contacto || 'No asignado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-emerald-primary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Email</p>
                <p className="text-sm">{cliente.email_contacto || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-chart-blue mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Teléfono</p>
                <p className="text-sm">{cliente.telefono || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-red-400 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Dirección</p>
                <p className="text-sm">{cliente.direccion || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-chart-teal mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Ciudad / Dpto</p>
                <p className="text-sm">{[cliente.ciudad, cliente.departamento].filter(Boolean).join(', ') || '---'}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionTitle>Resumen</SectionTitle>
          <div className="space-y-3">
            <div className="bg-bg2 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-content-muted">CECO Asociado</p>
              <p className="font-mono font-bold text-lg text-emerald-primary">{cliente.ceco_asociado || '---'}</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => navigate('/clients')}>
            Volver a Clientes
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
