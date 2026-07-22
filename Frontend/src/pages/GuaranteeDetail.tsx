import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, Calendar, Clock, Package, Building2, FileText } from 'lucide-react';
import { DashboardLayout, Card, Button, SectionTitle, Badge } from '../components/Fusion';
import { getGarantiaById } from '../services/business';
import { useToast } from '../lib/toast';

interface Garantia {
  id_garantia: number;
  numero_caso_interno: string;
  rma_proveedor: string;
  estado_proceso: string;
  falla_reportada: string;
  fecha_envio: string;
  fecha_limite_estimada: string;
  fecha_recibido_reparado: string;
  activo?: { serial: string; item?: { nombre_equipo: string } };
  proveedor?: { nombre: string };
  comentarios_proceso: string;
}

const GuaranteeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [garantia, setGarantia] = useState<Garantia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getGarantiaById(parseInt(id))
      .then(setGarantia)
      .catch(() => toast.error('Error al cargar la garantía'))
      .finally(() => setLoading(false));
  }, [id]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string; bg: string }> = {
      REGISTRADO: { color: 'var(--content-muted)', bg: 'rgba(255,255,255,0.05)' },
      ENVIADO_PROVEEDOR: { color: 'var(--chart-blue)', bg: 'rgba(0,163,255,0.1)' },
      RECIBIDO_PROVEEDOR: { color: 'var(--gold)', bg: 'rgba(255,184,0,0.1)' },
      RESUELTO_REEMPLAZADO: { color: 'var(--emerald)', bg: 'var(--emerald-muted)' },
      ENTREGADO_CLIENTE: { color: 'var(--chart-teal)', bg: 'rgba(0,200,150,0.1)' },
    };
    const s = styles[status] || { color: 'white', bg: 'gray' };
    return <Badge label={status.replace(/_/g, ' ')} color={s.color} bg={s.bg} />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-chart-teal/30 border-t-chart-teal rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!garantia) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-content-muted">Garantía no encontrada</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/guarantees')} className="p-2 rounded-xl bg-bg3 text-content-muted hover:text-emerald-primary transition-all border border-bg4">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{garantia.numero_caso_interno || `Garantía #${id}`}</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Detalle de proceso de garantía</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <SectionTitle>Información del Caso</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-chart-teal mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Caso Interno</p>
                <p className="font-mono font-bold text-sm">{garantia.numero_caso_interno || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck size={16} className="text-chart-blue mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">RMA Proveedor</p>
                <p className="font-mono text-sm">{garantia.rma_proveedor || 'PEND'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package size={16} className="text-emerald-primary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Equipo</p>
                <p className="font-bold text-sm">{garantia.activo?.item?.nombre_equipo || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-chart-purple mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Serial</p>
                <p className="font-mono text-sm">{garantia.activo?.serial || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-gold mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Proveedor</p>
                <p className="text-sm">{garantia.proveedor?.nombre || '---'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusBadge(garantia.estado_proceso)}</div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Estado</p>
                <p className="font-bold text-sm">{garantia.estado_proceso?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-bg4 pt-6">
            <SectionTitle>Fechas Clave</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Calendar size={14} className="text-chart-blue mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Envío</p>
                <p className="font-bold text-sm">{garantia.fecha_envio || '---'}</p>
              </div>
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Clock size={14} className="text-gold mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Límite</p>
                <p className="font-bold text-sm">{garantia.fecha_limite_estimada || '---'}</p>
              </div>
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Calendar size={14} className="text-emerald-primary mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Retorno</p>
                <p className="font-bold text-sm">{garantia.fecha_recibido_reparado || '---'}</p>
              </div>
            </div>
          </div>

          {garantia.falla_reportada && (
            <div className="border-t border-bg4 pt-6">
              <SectionTitle>Falla Reportada</SectionTitle>
              <p className="text-sm text-content-secondary leading-relaxed">{garantia.falla_reportada}</p>
            </div>
          )}

          {garantia.comentarios_proceso && (
            <div className="border-t border-bg4 pt-6">
              <SectionTitle>Comentarios del Proceso</SectionTitle>
              <p className="text-sm text-content-secondary leading-relaxed">{garantia.comentarios_proceso}</p>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <SectionTitle>Acciones</SectionTitle>
          <Button className="w-full" variant="neo" onClick={() => navigate('/guarantees')}>
            <ArrowLeft size={14} /> Volver a Garantías
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuaranteeDetail;
