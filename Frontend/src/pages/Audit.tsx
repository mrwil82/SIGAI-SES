import React, { useEffect, useState } from "react";
import { ExportMenu } from "../components/ExportMenu";
import {
  Search,
  User,
  Calendar,
  X,
  Eye,
} from "lucide-react";
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
  Badge,
  Modal,
} from "../components/Fusion";
import { useAuditLogs } from "../hooks/useAudit";
import { auditEntries, humanizeKey } from "../lib/auditFormat";

interface AuditLog {
  id_log: number;
  fecha_accion: string;
  accion: string;
  tabla_afectada: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  id_usuario: number;
  usuario?: { nombre: string } | null;
}

// Componente para mostrar detalles de auditoría, formateando JSON si es posible

const IGNORE_KEYS = new Set([
  "created_at",
  "updated_at",
  "deleted_at",
  "__class__",
]);

const AuditDetails: React.FC<{ data: string | null }> = ({ data }) => {
  if (!data)
    return (
      <span className="text-[9px] text-content-muted italic">Sin datos</span>
    );

  try {
    const parsed = JSON.parse(data);
    const entries = Object.entries(parsed).filter(
      ([key, val]) =>
        val !== null &&
        val !== undefined &&
        val !== "" &&
        !IGNORE_KEYS.has(key),
    );
    if (entries.length === 0)
      return <span className="text-[9px] text-content-muted italic">--</span>;
    return (
      <div className="flex flex-col gap-0.5 font-mono text-[9px] bg-bg3/20 p-2 rounded">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-1">
            <span className="text-emerald-primary font-bold">{key}:</span>
            <span className="text-content-secondary truncate max-w-[120px] md:max-w-[200px] lg:max-w-[350px]">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <span className="text-[9px] text-content-muted">
        {data.substring(0, 80)}...
      </span>
    );
  }
};

const Audit: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: auditData, isLoading } = useAuditLogs(
    currentPage,
    pageSize,
    debouncedSearch || undefined,
    actionFilter || undefined,
  );
  const logs = (auditData?.items || []) as AuditLog[];
  const totalLogs = auditData?.total || 0;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <Badge
            label="CREACIÓN"
            color="var(--emerald)"
            bg="var(--emerald-muted)"
          />
        );
      case "UPDATE":
        return (
          <Badge
            label="CAMBIO"
            color="var(--chart-blue)"
            bg="rgba(0,163,255,0.1)"
          />
        );
      case "DELETE":
        return (
          <Badge
            label="ELIMINACIÓN"
            color="var(--danger)"
            bg="rgba(255,77,77,0.1)"
          />
        );
      case "LOGIN":
        return (
          <Badge
            label="INGRESO"
            color="var(--chart-purple)"
            bg="rgba(155, 109, 255, 0.1)"
          />
        );
      default:
        return <Badge label={action} color="white" bg="gray" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Registro de Auditoría
          </h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">
            Historial completo de acciones y cambios en el sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu module="audit" />
        </div>
      </div>

      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
              size={16}
            />
            <NeoInput
              placeholder="Buscar por tabla, nombre de equipo, serial..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <NeoSelect
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
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

      <Card className="overflow-hidden p-0 border-bg4">
        <TableContainer>
          <THead>
            <TH className="hidden sm:table-cell">Fecha / Hora</TH>
            <TH>Usuario</TH>
            <TH>Acción</TH>
            <TH className="hidden md:table-cell">Módulo / Tabla</TH>
            <TH className="hidden lg:table-cell">Valor Anterior</TH>
            <TH>Detalles (Nuevo Valor)</TH>
            <TH className="w-16 text-center">Ver</TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD
                  colSpan={7}
                  className="text-center py-20 text-content-primary font-bold"
                >
                  Consultando Bitácora...
                </TD>
              </TR>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TR key={log.id_log}>
                  <TD className="hidden sm:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-2 text-content-secondary">
                      <Calendar size={12} className="text-content-muted" />
                      <span className="text-[10px]">
                        {new Date(log.fecha_accion).toLocaleString()}
                      </span>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-emerald-primary/70" />
                      <span className="text-[11px] font-bold">
                        {log.usuario?.nombre || `ID: ${log.id_usuario}`}
                      </span>
                    </div>
                  </TD>
                  <TD>{getActionBadge(log.accion)}</TD>
                  <TD className="hidden md:table-cell font-bold uppercase tracking-wider">
                    {log.tabla_afectada}
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <AuditDetails data={log.valor_anterior} />
                  </TD>
                  <TD>
                    <AuditDetails data={log.valor_nuevo} />
                  </TD>
                  <TD className="text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      title="Ver detalle completo"
                      className="p-1.5 rounded-lg text-emerald-primary bg-emerald-primary/10 hover:bg-emerald-primary/20 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD
                  colSpan={7}
                  className="text-center py-10 text-content-muted italic"
                >
                  No hay registros de auditoría.
                </TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
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

      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </DashboardLayout>
  );
};

const AuditDetailModal: React.FC<{
  log: AuditLog | null;
  onClose: () => void;
}> = ({ log, onClose }) => {
  const entriesNuevo = auditEntries(log?.valor_nuevo ?? null);
  const entriesAnterior = auditEntries(log?.valor_anterior ?? null);

  const renderEntries = (entries: { label: string; value: string }[]) => {
    if (entries.length === 0)
      return <span className="text-xs text-content-muted italic">Sin datos</span>;
    return (
      <div className="flex flex-col gap-1.5">
        {entries.map((e) => (
          <div
            key={e.label}
            className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-2 text-[11px] py-1 border-b border-bg4/60 last:border-0"
          >
            <span className="font-bold text-emerald-primary">
              {e.label}:
            </span>
            <span className="text-content-secondary break-all">
              {e.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={!!log}
      onClose={onClose}
      title={`Detalle de Auditoría #${log?.id_log ?? ""}`}
      className="max-w-2xl"
    >
      {log && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="bg-bg2 p-3 rounded-xl border border-bg4">
              <span className="block text-[9px] uppercase tracking-widest text-content-muted mb-1">
                Usuario
              </span>
              <span className="font-bold">
                {log.usuario?.nombre || `ID: ${log.id_usuario}`}
              </span>
            </div>
            <div className="bg-bg2 p-3 rounded-xl border border-bg4">
              <span className="block text-[9px] uppercase tracking-widest text-content-muted mb-1">
                Acción
              </span>
              <span className="font-bold">{humanizeKey(log.accion)}</span>
            </div>
            <div className="bg-bg2 p-3 rounded-xl border border-bg4">
              <span className="block text-[9px] uppercase tracking-widest text-content-muted mb-1">
                Módulo / Tabla
              </span>
              <span className="font-bold uppercase">
                {humanizeKey(log.tabla_afectada)}
              </span>
            </div>
            <div className="bg-bg2 p-3 rounded-xl border border-bg4">
              <span className="block text-[9px] uppercase tracking-widest text-content-muted mb-1">
                Fecha / Hora
              </span>
              <span className="font-bold">
                {new Date(log.fecha_accion).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              Valor Anterior
            </h4>
            {renderEntries(entriesAnterior)}
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              Valor Nuevo / Detalle
            </h4>
            {renderEntries(entriesNuevo)}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default Audit;
