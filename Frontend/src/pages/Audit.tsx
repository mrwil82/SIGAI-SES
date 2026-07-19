import React, { useEffect, useState, useCallback } from 'react';
import { ExportMenu } from "../components/ExportMenu";
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Calendar,
  Activity,
  X
} from 'lucide-react';
import { 
  Card, 
  Button,
  DashboardLayout,
  TableContainer,
  THead,
  TBody,
  TH,
  TR,
  TD,
  NeoInput,
  NeoSelect,
  Badge
} from '../components/Fusion';
import { getAuditLogs } from '../services/users';

// Componente para mostrar detalles de auditoría, formateando JSON si es posible

const IGNORE_KEYS = new Set(['created_at', 'updated_at', 'deleted_at', '__class__']);

const AuditDetails: React.FC<{ data: string | null }> = ({ data }) => {
  if (!data) return <span className="text-[9px] text-content-muted italic">Sin datos</span>;
  
  try {
    const parsed = JSON.parse(data);
    const entries = Object.entries(parsed).filter(([key, val]) => val !== null && val !== undefined && val !== '' && !IGNORE_KEYS.has(key));
    if (entries.length === 0) return <span className="text-[9px] text-content-muted italic">--</span>;
    return (
      <div className="flex flex-col gap-0.5 font-mono text-[9px] bg-bg3/20 p-2 rounded">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-1">
            <span className="text-emerald-primary font-bold">{key}:</span>
            <span className="text-content-secondary truncate max-w-[150px]">{String(val)}</span>
          </div>
        ))}
      </div>
    );
  } catch {
    return <span className="text-[9px] text-content-muted">{data.substring(0, 80)}...</span>;
  }
};

const Audit: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = async (page?: number) => {
    const targetPage = page ?? currentPage;
    setIsLoading(true);
    try {
      const data = await getAuditLogs(targetPage, pageSize, debouncedSearch || undefined, actionFilter || undefined);
      setLogs(data.items || []);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, debouncedSearch, actionFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <Badge label="CREACIÓN" color="var(--emerald)" bg="var(--emerald-muted)" />;
      case 'UPDATE': return <Badge label="CAMBIO" color="var(--chart-blue)" bg="rgba(0,163,255,0.1)" />;
      case 'DELETE': return <Badge label="ELIMINACIÓN" color="var(--danger)" bg="rgba(255,77,77,0.1)" />;
      case 'LOGIN': return <Badge label="INGRESO" color="var(--chart-purple)" bg="rgba(155, 109, 255, 0.1)" />;
      default: return <Badge label={action} color="white" bg="gray" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">Registro de Auditoría</h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">Historial completo de acciones y cambios en el sistema</p>
        </div>
        <ExportMenu module="audit" />
      </div>

      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
            <NeoInput 
              placeholder="Buscar por tabla, nombre de equipo, serial..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <NeoSelect 
            value={actionFilter} 
            onChange={(e: any) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="h-11 w-full sm:w-44"
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
            <option value="LOGIN">Ingreso</option>
          </NeoSelect>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
        <TableContainer>
          <THead>
            <TH className="hidden sm:table-cell">Fecha / Hora</TH>
            <TH>Usuario</TH>
            <TH>Acción</TH>
            <TH className="hidden md:table-cell">Módulo / Tabla</TH>
            <TH className="hidden lg:table-cell">Valor Anterior</TH>
            <TH className="hidden xl:table-cell">Detalles (Nuevo Valor)</TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20 text-content-primary font-bold">
                  Consultando Bitácora...
                </TD>
              </TR>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TR key={log.id_log}>
                  <TD className="hidden sm:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-2 text-content-secondary">
                      <Calendar size={12} className="text-content-muted" />
                      <span className="text-[10px]">{new Date(log.fecha_accion).toLocaleString()}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-emerald-primary/70" />
                      <span className="text-[11px] font-bold">{log.usuario?.nombre || `ID: ${log.id_usuario}`}</span>
                    </div>
                  </TD>
                  <TD>{getActionBadge(log.accion)}</TD>
                  <TD className="hidden md:table-cell font-bold uppercase tracking-wider">{log.tabla_afectada}</TD>
                  <TD className="hidden lg:table-cell">
                    <AuditDetails data={log.valor_anterior} />
                  </TD>
                  <TD className="hidden xl:table-cell">
                    <AuditDetails data={log.valor_nuevo} />
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={6} className="text-center py-10 text-content-muted italic">No hay registros de auditoría.</TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-white/5">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold text-center sm:text-left">
          Mostrando {logs.length} de {totalLogs} registros
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
            disabled={totalLogs <= currentPage * pageSize}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Audit;
