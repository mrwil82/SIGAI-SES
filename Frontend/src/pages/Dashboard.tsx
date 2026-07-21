import React, { useEffect, useState } from 'react';
import { 
  Package, 
  ShieldCheck, 
  Users, 
  History, 
  AlertTriangle, 
  TrendingUp,
  Briefcase,
  FileText,
  UserCog,
  LayoutDashboard,
  ArrowUpRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  Card, 
  SectionTitle, 
  DashboardLayout,
  TableContainer,
  THead,
  TBody,
  TH,
  TR,
  TD
} from '../components/Fusion';
import { StatCard, QuickAccessBtn } from '../components/DashboardComponents';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/analytics';
import { getAuditLogs } from '../services/users';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#00C26A', '#3B82F6', '#EAB308', '#A855F7', '#EF4444', '#6366F1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const label = payload[0].payload?.name ?? payload[0].name;
    return (
      <div className="bg-bg3 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-1">{label}</p>
        <p className="text-xl font-black text-emerald-primary">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [actividad, setActividad] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, auditData] = await Promise.all([
          getDashboardStats(timeRange),
          getAuditLogs(1, 50)
        ]);
        setStats(statsData);
        setActividad(auditData.items || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const formatAccion = (accion: string) => {
    const map: Record<string, string> = {
      CREATE: 'Creación',
      UPDATE: 'Actualización',
      DELETE: 'Eliminación',
      LOGIN: 'Inicio Sesión',
    };
    return map[accion] || accion;
  };

  const formatTabla = (tabla: string) => {
    const map: Record<string, string> = {
      usuarios: 'Usuario',
      clientes: 'Cliente',
      proyectos: 'Proyecto',
      items: 'Item',
      activos: 'Activo',
      movimientos_inventario: 'Movimiento',
      actas_entrega: 'Acta',
      proveedores: 'Proveedor',
      garantias: 'Garantía',
      notificaciones: 'Notificación',
    };
    return map[tabla] || tabla;
  };

  const getEventColor = (accion: string) => {
    switch (accion) {
      case 'CREATE': return 'text-emerald-primary border-emerald-primary/20 bg-emerald-primary/10';
      case 'UPDATE': return 'text-chart-blue border-chart-blue/20 bg-chart-blue/10';
      case 'DELETE': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'LOGIN': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
      default: return 'text-content-muted border-white/10 bg-white/5';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Filtrado por rango de tiempo
  const filteredActividad = actividad.filter(a => {
    if (!a.fecha_accion) return true;
    const d = new Date(a.fecha_accion);
    const now = new Date();
    if (timeRange === 'hoy') return d.toDateString() === now.toDateString();
    if (timeRange === 'semana') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (timeRange === 'mes') {
      const monthAgo = new Date(); monthAgo.setMonth(now.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  });

  const totalActivos = stats?.activos_por_estado ? Object.values(stats.activos_por_estado).reduce((a: any, b: any) => Number(a) + Number(b), 0) : 0;
  const enGarantia = Number(stats?.activos_por_estado?.EN_GARANTIA || 0);
  const nuevosIngresos = Number(stats?.nuevos_ingresos || 0);
  const movimientosPeriodo = Number(stats?.movimientos_periodo || 0);

  const timeRangeLabel = timeRange === 'hoy' ? 'hoy' : timeRange === 'semana' ? '7 días' : '30 días';

  const pieData = stats?.activos_por_estado ? Object.entries(stats.activos_por_estado).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value: Number(value)
  })) : [];

  const barData = stats?.activos_por_estado ? Object.entries(stats.activos_por_estado).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    count: Number(value)
  })).sort((a, b) => b.count - a.count) : [];

  return (
    <DashboardLayout>
      {/*cabecera*/}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
         <div>
            <h1 className="text-2xl font-black tracking-tighter">Bienvenido, {user?.nombre?.split(' ')[0]}</h1>
            <p className="text-[10px] text-content-muted uppercase tracking-[0.3em] font-bold mt-1">Resumen Ejecutivo del Laboratorio</p>
         </div>
         <div className="flex gap-2 bg-bg3/30 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setTimeRange('hoy')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                timeRange === 'hoy' ? 'bg-emerald-primary text-bg0 shadow-glow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button 
              onClick={() => setTimeRange('semana')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                timeRange === 'semana' ? 'bg-emerald-primary text-bg0 shadow-glow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => setTimeRange('mes')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                timeRange === 'mes' ? 'bg-emerald-primary text-bg0 shadow-glow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Mes
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title={`Activos (${timeRangeLabel})`} value={totalActivos} icon={<Package />} trend="En período" color="blue" />
        <StatCard title="En Garantía" value={enGarantia} icon={<ShieldCheck />} trend="Actual" color="emerald" />
        <StatCard title="Nuevos Ingresos" value={nuevosIngresos} icon={<TrendingUp />} trend={timeRangeLabel} color="purple" />
        <StatCard title="Movimientos" value={movimientosPeriodo} icon={<History />} trend={timeRangeLabel} color="gold" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* area de gráficos y movimientos recientes */}

        <div className="xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <SectionTitle>Distribución de Activos</SectionTitle>
                <div className="w-8 h-8 rounded-lg bg-bg3 flex items-center justify-center text-emerald-primary"><ArrowUpRight size={14}/></div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <SectionTitle>Comparativa por Estado</SectionTitle>
                <div className="w-8 h-8 rounded-lg bg-bg3 flex items-center justify-center text-chart-blue"><TrendingUp size={14}/></div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      tick={{ fill: 'var(--content-muted)', fontSize: 9, fontWeight: 'bold' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden border-emerald-primary/10">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg2/30">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-primary/10 rounded-lg text-emerald-primary"><Clock size={18} /></div>
                 <SectionTitle>Actividad Reciente</SectionTitle>
              </div>
              <button onClick={() => navigate('/audit')} className="text-[10px] font-bold text-emerald-primary hover:underline flex items-center gap-1 uppercase tracking-widest">Ver Todo <ExternalLink size={12}/></button>
            </div>
            <TableContainer>
              <THead>
                <TH>Acción</TH>
                <TH>Usuario</TH>
                <TH>Detalle</TH>
                <TH className="text-right">Tiempo</TH>
              </THead>
              <TBody>
                {filteredActividad.slice(0, 6).map((a, i) => (
                  <TR key={a.id_log || i}>
                    <TD>
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getEventColor(a.accion)}`}>
                         {formatAccion(a.accion)} {formatTabla(a.tabla_afectada)}
                       </span>
                    </TD>
                    <TD className="text-xs text-content-primary">
                      {a.usuario?.nombre || a.usuario?.email || `ID ${a.id_usuario}`}
                    </TD>
                    <TD className="text-[10px] text-content-muted max-w-[120px] lg:max-w-[250px] truncate">
                      {(() => {
                        try {
                          if (!a.valor_nuevo) return '---';
                          const parsed = JSON.parse(a.valor_nuevo);
                          const keys = Object.keys(parsed);
                          if (keys.length === 0) return '---';
                          return keys.slice(0, 3).map(k => `${k}: ${String(parsed[k]).slice(0, 40)}`).join(', ');
                        } catch { return '---'; }
                      })()}
                    </TD>
                    <TD className="text-[10px] text-content-muted text-right whitespace-nowrap">{formatTimeAgo(a.fecha_accion)}</TD>
                  </TR>
                ))}
              </TBody>
            </TableContainer>
          </Card>
        </div>

        {/* Sidebar Tools Area */}
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-6">
            <SectionTitle>Accesos Rápidos</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-4">
                <QuickAccessBtn icon={<Package size={18} />} label="Inventario" onClick={() => navigate('/inventory')} />
                <QuickAccessBtn icon={<ShieldCheck size={18} />} label="Garantías" onClick={() => navigate('/guarantees')} />
                <QuickAccessBtn icon={<Users size={18} />} label="Clientes" onClick={() => navigate('/clients')} />
                <QuickAccessBtn icon={<History size={18} />} label="Auditoría" onClick={() => navigate('/audit')} />
                <QuickAccessBtn icon={<Briefcase size={18} />} label="Proyectos" onClick={() => navigate('/projects')} />
                <QuickAccessBtn icon={<FileText size={18} />} label="Actas" onClick={() => navigate('/deliveries')} />
                <QuickAccessBtn icon={<UserCog size={18} />} label="Usuarios" onClick={() => navigate('/users')} />
                <QuickAccessBtn icon={<LayoutDashboard size={18} />} label="Ajustes" onClick={() => navigate('/settings')} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-primary/10 to-transparent border-emerald-primary/20 p-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-primary text-bg0 flex items-center justify-center shadow-glow"><TrendingUp size={20}/></div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Resumen de Salud</h3>
             </div>
             <p className="text-[11px] text-content-secondary leading-relaxed mb-6">
                El sistema detecta un nivel de operatividad del <span className="text-emerald-primary font-bold">94%</span>. 
                Se recomienda revisar los <span className="text-gold font-bold">{stats?.items_stock_bajo || 0}</span> ítems con stock crítico.
             </p>
             <button 
                onClick={() => navigate('/alerts')}
                className="w-full py-3 bg-bg3 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-primary hover:bg-bginput transition-all"
             >
                Optimizar Inventario
             </button>
          </Card>

          <Card className="min-h-[250px] relative overflow-hidden flex flex-col items-center justify-center text-center p-8">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-primary to-transparent" />
             <div className="w-16 h-16 rounded-full bg-bg3 border border-emerald-primary/20 flex items-center justify-center mb-4 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="#10b981" stroke-width="1.5"/>
                  <g transform="translate(8,8)">
                    <rect x="1" y="3" width="14" height="11" rx="1.5" fill="none" stroke="#10b981" stroke-width="1.5"/>
                    <rect x="1" y="1" width="14" height="3" rx="1" fill="#10b981" opacity="0.9"/>
                    <path d="M5 10l2 2 4-4" fill="none" stroke="#0d1a12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
             </div>
             <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-content-muted mb-2 relative z-10">SIGAI-SES AI</h4>
             <p className="text-[10px] italic text-emerald-primary/60 relative z-10">Integración de análisis predictivo disponible próximamente.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
