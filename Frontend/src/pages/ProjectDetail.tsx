import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, MapPin, Calendar, Target, FileText } from 'lucide-react';
import { DashboardLayout, Card, Button, SectionTitle, Badge } from '../components/Fusion';
import { getProyectoById } from '../services/business';
import { useToast } from '../lib/toast';

interface Proyecto {
  id_proyecto: number;
  nombre_proyecto: string;
  cliente?: { nombre: string };
  id_cliente: number;
  centro_costos: string;
  estado: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  fecha_cierre_real: string;
  descripcion: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProyectoById(parseInt(id))
      .then(setProyecto)
      .catch(() => toast.error('Error al cargar el proyecto'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-chart-blue/30 border-t-chart-blue rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!proyecto) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-content-muted">Proyecto no encontrado</div>
      </DashboardLayout>
    );
  }

  const estadoColor = proyecto.estado === 'ACTIVO' ? 'var(--emerald)' : proyecto.estado === 'PAUSADO' ? 'var(--gold)' : 'var(--chart-blue)';

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-xl bg-bg3 text-content-muted hover:text-emerald-primary transition-all border border-bg4">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{proyecto.nombre_proyecto}</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Detalle de proyecto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <SectionTitle>Información del Proyecto</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Briefcase size={16} className="text-chart-blue mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Nombre</p>
                <p className="font-bold text-sm">{proyecto.nombre_proyecto}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-chart-purple mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Cliente</p>
                <p className="font-bold text-sm">{proyecto.cliente?.nombre || 'Interno'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target size={16} className="text-gold mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Centro Costos</p>
                <p className="font-mono text-sm">{proyecto.centro_costos || 'S.C.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Badge label={proyecto.estado} color={estadoColor} bg="rgba(0,194,106,0.05)" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Estado</p>
                <p className="font-bold text-sm">{proyecto.estado}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-danger/80 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Ubicación</p>
                <p className="text-sm">{proyecto.ubicacion || 'No definida'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-bg4 pt-6">
            <SectionTitle>Línea de Tiempo</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Calendar size={14} className="text-emerald-primary mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Inicio</p>
                <p className="font-bold text-sm">{proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString('es-CO') : '---'}</p>
              </div>
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Calendar size={14} className="text-gold mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Fin Estimado</p>
                <p className="font-bold text-sm">{proyecto.fecha_fin_estimada ? new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-CO') : '---'}</p>
              </div>
              <div className="bg-bg2 p-4 rounded-xl border border-bg4">
                <Calendar size={14} className="text-chart-blue mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Cierre Real</p>
                <p className="font-bold text-sm">{proyecto.fecha_cierre_real ? new Date(proyecto.fecha_cierre_real).toLocaleDateString('es-CO') : '---'}</p>
              </div>
            </div>
          </div>

          {proyecto.descripcion && (
            <div className="border-t border-bg4 pt-6">
              <SectionTitle>Descripción</SectionTitle>
              <p className="text-sm text-content-secondary leading-relaxed">{proyecto.descripcion}</p>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <SectionTitle>Acciones</SectionTitle>
          <Button className="w-full" variant="neo" onClick={() => navigate(`/projects`)}>
            <ArrowLeft size={14} /> Volver a Proyectos
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
