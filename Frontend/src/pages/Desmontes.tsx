import React, { useState, useEffect } from "react";
import { ExportMenu } from "../components/ExportMenu";
import {
  ClipboardCheck,
  Package,
  RotateCcw,
  Download,
  Plus,
  Search,
  Trash2,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
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
  Modal,
  FormGroup,
  Badge,
} from "../components/Fusion";
import { ConfirmModal } from "../components/Fusion";
import { SearchableSelect } from "../components/SearchableSelect";
import { useToast } from "../lib/toast";
import {
  getActivosParaTriaje,
  actualizarTriajeActivo,
  getActivoById,
  deleteActivo,
} from "../services/desmontes";
import {
  getInventoryItems,
  crearDesmonteBulk,
  importInventory,
  downloadTemplate,
} from "../services/inventory";
import { getProyectos, getClientes } from "../services/business";

const Desmontes: React.FC = () => {
  const [activos, setActivos] = useState<any[]>([]);
  const [triajeData, setTriajeData] = useState<
    Record<number, { calificacion: string; observaciones: string }>
  >({});
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

  const [selectedProjectId, setSelectedProjectId] = useState<
    number | undefined
  >(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<
    number | undefined
  >(undefined);

  const [desmonteSelections, setDesmonteSelections] = useState<
    Record<number, number>
  >({});
  const [desmonteSearch, setDesmonteSearch] = useState("");
  const [desmonteCatFilter, setDesmonteCatFilter] = useState("all");

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
        initialData[a.id_activo] = {
          calificacion: a.calificacion_tecnica || "BUENO",
          observaciones: a.observaciones || "",
        };
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
        getClientes(0, 100),
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
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const performProcesarTriaje = async (id: number | null) => {
    if (!id) return closeConfirm();
    setLoading(true);
    try {
      const { calificacion, observaciones } = triajeData[id];
      await actualizarTriajeActivo(id, {
        calificacion_tecnica: calificacion,
        observaciones: observaciones,
      });
      setSuccess(`Evaluación técnica guardada exitosamente.`);
      toast.success("Evaluación guardada");
      await cargarActivos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al guardar triaje");
      toast.error("Error al guardar triaje");
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const data = await getActivoById(id);
      setSelectedActivo(data);
    } catch (err) {
      toast.error("Error al cargar detalle del activo");
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setSelectedActivo(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteActivo(deleteTarget);
      toast.success("Activo eliminado de la lista de triaje");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      cargarActivos();
    } catch (err) {
      toast.error("Error al eliminar activo");
    } finally {
      setDeleting(false);
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
    if (
      desmonteSelectedCount === 0 ||
      (!selectedProjectId && !selectedClienteId)
    ) {
      setError(
        "Seleccione al menos un equipo y un origen (Cliente o Proyecto).",
      );
      return;
    }

    const itemsPayload = Object.entries(desmonteSelections).map(
      ([idStr, cantidad]) => ({
        id_item: parseInt(idStr),
        cantidad,
      }),
    );

    try {
      setLoading(true);
      const result = await crearDesmonteBulk({
        items: itemsPayload,
        id_proyecto: selectedProjectId,
        id_cliente: selectedClienteId,
      });
      setSuccess(
        `${result.items_registrados} equipos registrados como desmonte.`,
      );
      setIsDesmonteModalOpen(false);
      setDesmonteSelections({});
      setDesmonteSearch("");
      setDesmonteCatFilter("all");
      cargarActivos();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail
              .map((e: any) => e.msg)
              .filter(Boolean)
              .join("; ")
          : detail || "Error al registrar desmontes.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Desmontes (Triaje)
          </h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">
            Evaluación técnica de equipos retirados en laboratorio
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <ExportMenu module="desmontes" />
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => downloadTemplate("desmontes")}
          >
            <Download size={14} />
            Plantilla
          </Button>
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Download size={16} className="rotate-180" />
            Carga Excel
          </Button>
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => setIsDesmonteModalOpen(true)}
          >
            <Plus size={16} />
            Registrar Desmonte
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <TableContainer>
          <THead>
            <TH>Serial</TH>
            <TH className="hidden sm:table-cell">Equipo</TH>
            <TH className="hidden md:table-cell">Origen</TH>
            <TH>Calificación</TH>
            <TH className="text-right">Acción</TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-emerald-primary/30 border-t-emerald-primary rounded-full animate-spin" />
                    <span className="text-emerald-primary uppercase tracking-[0.2em] font-bold text-[10px]">
                      Cargando activos...
                    </span>
                  </div>
                </TD>
              </TR>
            ) : activos.length > 0 ? (
              activos.map((activo) => (
                <TR key={activo.id_activo}>
                  <TD>
                    <button
                      onClick={() => openDetail(activo.id_activo)}
                      className="font-bold font-mono text-emerald-primary hover:text-emerald-bright transition-colors flex items-center gap-1.5"
                    >
                      {activo.serial}
                      <Eye size={12} className="opacity-40" />
                    </button>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="text-xs font-bold text-content-primary">
                      {activo.item?.nombre_equipo || "---"}
                    </div>
                    <div className="text-[9px] text-content-muted uppercase">
                      {activo.item?.referencia}
                    </div>
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
                    {!activo.proyecto && !activo.cliente_actual && (
                      <span className="text-[9px] italic">
                        Sin origen definido
                      </span>
                    )}
                  </TD>
                  <TD>
                    <NeoSelect
                      className="text-xs"
                      value={
                        triajeData[activo.id_activo]?.calificacion || "BUENO"
                      }
                      onChange={(e: any) =>
                        setTriajeData((prev) => ({
                          ...prev,
                          [activo.id_activo]: {
                            ...prev[activo.id_activo],
                            calificacion: e.target.value,
                          },
                        }))
                      }
                    >
                      <option
                        value="BUENO"
                        style={{ background: "#fff", color: "#111" }}
                      >
                        Bueno
                      </option>
                      <option
                        value="RECUPERABLE"
                        style={{ background: "#fff", color: "#111" }}
                      >
                        Recuperable
                      </option>
                      <option
                        value="DESECHO"
                        style={{ background: "#fff", color: "#111" }}
                      >
                        Desecho
                      </option>
                    </NeoSelect>
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="primary"
                        className="h-9 px-2.5 text-[10px]"
                        disabled={loading}
                        onClick={() => procesarTriaje(activo.id_activo)}
                      >
                        <ClipboardCheck size={14} /> Guardar
                      </Button>
                      <button
                        onClick={() => handleDeleteClick(activo.id_activo)}
                        className="h-9 w-9 rounded-lg border border-red-500/20 text-danger/80 hover:bg-danger/10 transition-colors flex items-center justify-center"
                        title="Eliminar de triaje"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center opacity-30">
                    <Package size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                      No hay activos para triaje
                    </p>
                    <p className="text-[10px] mt-1 text-center">
                      Todos los equipos en laboratorio han sido procesados
                    </p>
                    <Button
                      variant="neo"
                      className="mt-6"
                      onClick={cargarActivos}
                    >
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
        onClose={() => {
          setIsDesmonteModalOpen(false);
          setDesmonteSelections({});
          setDesmonteSearch("");
          setDesmonteCatFilter("all");
        }}
        title="Ingreso de Desmonte (Manual)"
        className="max-w-4xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDesmonteModalOpen(false);
                setDesmonteSelections({});
                setDesmonteSearch("");
                setDesmonteCatFilter("all");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDesmonteSubmit}
              disabled={desmonteSelectedCount === 0}
            >
              Registrar Ingreso ({desmonteSelectedCount} items)
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-[11px] md:text-xs">
          {/* Origen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Cliente de Origen">
              <NeoSelect
                value={
                  selectedClienteId !== undefined
                    ? String(selectedClienteId)
                    : ""
                }
                onChange={(e: any) => {
                  const val = e.target.value;
                  setSelectedClienteId(val ? parseInt(val) : undefined);
                  setSelectedProjectId(undefined);
                }}
              >
                <option value="">Seleccione cliente...</option>
                {clientes.map((c: any) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre}
                  </option>
                ))}
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Proyecto de Origen">
              <NeoSelect
                value={
                  selectedProjectId !== undefined
                    ? String(selectedProjectId)
                    : ""
                }
                onChange={(e: any) => {
                  const val = e.target.value;
                  setSelectedProjectId(val ? parseInt(val) : undefined);
                  setSelectedClienteId(undefined);
                }}
              >
                <option value="">Seleccione proyecto...</option>
                {projects.map((p: any) => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>
                    {p.nombre_proyecto}
                  </option>
                ))}
              </NeoSelect>
            </FormGroup>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              "all",
              "EQUIPO",
              "HERRAMIENTA",
              "CONSUMIBLE",
              "REPUESTO",
              "SEGURIDAD",
              "OTROS",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setDesmonteCatFilter(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all border ${
                  desmonteCatFilter === cat
                    ? "bg-emerald-muted border-emerald-500/40 text-emerald-primary"
                    : "bg-bg1/80 border-bg3 text-content-muted hover:border-emerald-500/20 hover:text-content"
                }`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-bg4/80 px-3 py-1.5 bg-bg1/80">
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
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-bg4 rounded-xl">
            <table className="w-full border-collapse" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th className="w-10 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm"></th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">
                    Equipo
                  </th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">
                    Categoría
                  </th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">
                    Marca
                  </th>
                  <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">
                    Ref.
                  </th>
                  <th className="w-24 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.filter((it: any) => {
                  const cat = it.categoria ?? "OTROS";
                  const matchesCat =
                    desmonteCatFilter === "all" || cat === desmonteCatFilter;
                  const term = desmonteSearch.toLowerCase();
                  const matchSearch =
                    !term ||
                    it.nombre_equipo?.toLowerCase().includes(term) ||
                    it.marca?.toLowerCase().includes(term) ||
                    it.referencia?.toLowerCase().includes(term);
                  return matchesCat && matchSearch;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Package size={36} className="mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          Sin items disponibles
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items
                    .filter((it: any) => {
                      const cat = it.categoria ?? "OTROS";
                      const matchesCat =
                        desmonteCatFilter === "all" ||
                        cat === desmonteCatFilter;
                      const term = desmonteSearch.toLowerCase();
                      const matchSearch =
                        !term ||
                        it.nombre_equipo?.toLowerCase().includes(term) ||
                        it.marca?.toLowerCase().includes(term) ||
                        it.referencia?.toLowerCase().includes(term);
                      return matchesCat && matchSearch;
                    })
                    .map((it: any) => {
                      const isSelected =
                        desmonteSelections[it.id_item] !== undefined;
                      return (
                        <tr
                          key={it.id_item}
                          onClick={() => toggleDesmonteItem(it.id_item)}
                          className="cursor-pointer border-b border-bg3/50 transition-colors"
                          style={{
                            background: isSelected
                              ? "rgba(52,211,153,0.06)"
                              : undefined,
                          }}
                        >
                          <td className="px-4 py-2.5">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-emerald-400 text-bg1"
                                  : "border border-bg3"
                              }`}
                            >
                              {isSelected && (
                                <span className="text-[9px] font-bold">✓</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-semibold text-content">
                              {it.nombre_equipo}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-bg3 text-content-muted">
                              {it.categoria || "OTROS"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-content-muted">
                            {it.marca || "---"}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-content-muted">
                            {it.referencia || "---"}
                          </td>
                          <td
                            className="px-4 py-2.5"
                            onClick={(e: React.MouseEvent) =>
                              e.stopPropagation()
                            }
                          >
                            <input
                              type="number"
                              min={1}
                              value={desmonteSelections[it.id_item] ?? 1}
                              disabled={!isSelected}
                              onChange={(e) =>
                                setDesmonteQty(it.id_item, e.target.value)
                              }
                              className="w-16 text-center text-[11px] rounded-md border border-bg4/80 py-1 px-2 bg-bg2 text-content outline-none focus:border-emerald-500/30 disabled:opacity-30"
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
            Se crearán activos con serial auto-generado y ubicación
            "Laboratorio", listos para triaje.
          </p>
        </div>
      </Modal>

      {/* Modal de Importación */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Carga Masiva de Desmontes (Excel)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cerrar
            </Button>
          </>
        }
      >
        <div className="space-y-6 text-[11px] md:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Asociar a Cliente">
              <SearchableSelect
                options={[
                  { value: "", label: "Ninguno" },
                  ...clientes.map((c: any) => ({
                    value: String(c.id_cliente),
                    label: c.nombre,
                  })),
                ]}
                value={
                  selectedClienteId !== undefined
                    ? String(selectedClienteId)
                    : ""
                }
                onChange={(val) => {
                  setSelectedClienteId(val ? parseInt(val) : undefined);
                  setSelectedProjectId(undefined);
                }}
                placeholder="Escriba para buscar cliente..."
              />
            </FormGroup>

            <FormGroup label="Asociar a Proyecto">
              <SearchableSelect
                options={[
                  { value: "", label: "Ninguno" },
                  ...projects.map((p: any) => ({
                    value: String(p.id_proyecto),
                    label: p.nombre_proyecto,
                  })),
                ]}
                value={
                  selectedProjectId !== undefined
                    ? String(selectedProjectId)
                    : ""
                }
                onChange={(val) => {
                  setSelectedProjectId(val ? parseInt(val) : undefined);
                  setSelectedClienteId(undefined);
                }}
                placeholder="Escriba para buscar proyecto..."
              />
            </FormGroup>
          </div>

          <div className="p-4 border-2 border-dashed border-bg3 rounded-xl bg-bg3/50 text-center">
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
                    const res = await importInventory(
                      file,
                      selectedProjectId,
                      selectedClienteId,
                    );
                    setSuccess(res.mensaje);
                    cargarActivos();
                    setIsImportModalOpen(false);
                  } catch (err: any) {
                    const detail = err.response?.data?.detail;
                    setError(
                      Array.isArray(detail)
                        ? detail
                            .map((e: any) => e.msg)
                            .filter(Boolean)
                            .join("; ")
                        : detail || "Error al importar archivo",
                    );
                  } finally {
                    setImporting(false);
                  }
                }
              }}
            />
            <label
              htmlFor="excel-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${importing ? "bg-gold animate-pulse" : "bg-emerald-primary/10 text-emerald-primary"}`}
              >
                <Download size={24} className="rotate-180" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {importing
                    ? "Procesando registros..."
                    : "Click para subir archivo"}
                </p>
                <p className="text-[10px] text-content-muted">
                  Soporta Inventario_laboratorio.xlsx
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="neo"
              className="flex-1 text-[10px] py-2"
              onClick={() => downloadTemplate("desmontes")}
            >
              <Download size={14} className="mr-1" />
              Plantilla Desmontes
            </Button>
            <Button
              variant="neo"
              className="flex-1 text-[10px] py-2"
              onClick={() => downloadTemplate("inventario_laboratorio")}
            >
              <Download size={14} className="mr-1" />
              Plantilla Laboratorio
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar evaluación"
        message="¿Está seguro de guardar la evaluación técnica de este equipo?"
        onCancel={closeConfirm}
        onConfirm={() => performProcesarTriaje(confirmTarget)}
      />
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Eliminar activo"
        message="¿Está seguro de eliminar este activo de la lista de triaje? Esta acción no se puede deshacer."
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={performDelete}
      />

      {/* Modal de Detalle del Activo */}
      <Modal
        isOpen={detailModalOpen}
        onClose={closeDetail}
        title="Detalle del Activo"
        className="max-w-2xl"
      >
        {loadingDetail ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-primary/30 border-t-emerald-primary rounded-full animate-spin" />
          </div>
        ) : selectedActivo ? (
          <div className="space-y-5 text-[11px] md:text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Serial
                </span>
                <p className="font-mono font-bold text-emerald-primary mt-0.5">
                  {selectedActivo.serial}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Estado Actual
                </span>
                <p className="font-bold mt-0.5">
                  {selectedActivo.estado_actual?.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Equipo
                </span>
                <p className="font-bold mt-0.5">
                  {selectedActivo.item?.nombre_equipo || "---"}
                </p>
                {selectedActivo.item?.referencia && (
                  <p className="text-content-muted text-[10px]">
                    Ref: {selectedActivo.item.referencia}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Marca
                </span>
                <p className="mt-0.5">{selectedActivo.item?.marca || "---"}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Condición Física
                </span>
                <p className="mt-0.5">
                  {selectedActivo.condicion_fisica?.replace(/_/g, " ") || "---"}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Calificación Técnica
                </span>
                <p className="mt-0.5">
                  {selectedActivo.calificacion_tecnica || "Pendiente"}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Ubicación
                </span>
                <p className="mt-0.5">
                  {selectedActivo.ubicacion_fisica || "---"}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold">
                  Área Asignada
                </span>
                <p className="mt-0.5">
                  {selectedActivo.area_asignada || "---"}
                </p>
              </div>
            </div>

            {(selectedActivo.proyecto || selectedActivo.cliente_actual) && (
              <div className="border-t border-bg4 pt-4">
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold block mb-2">
                  Origen
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedActivo.proyecto && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-primary/10 border border-emerald-primary/20 text-emerald-primary text-[9px] font-bold uppercase tracking-widest">
                      PROY: {selectedActivo.proyecto.nombre_proyecto}
                    </span>
                  )}
                  {selectedActivo.cliente_actual && (
                    <span className="px-2.5 py-1 rounded-full bg-chart-blue/10 border border-chart-blue/20 text-chart-blue text-[9px] font-bold uppercase tracking-widest">
                      CLI:{" "}
                      {selectedActivo.cliente_actual.nombre_comercial ||
                        selectedActivo.cliente_actual.nombre}
                    </span>
                  )}
                </div>
              </div>
            )}

            {selectedActivo.observaciones && (
              <div className="border-t border-bg4 pt-4">
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold block mb-1">
                  Observaciones
                </span>
                <p className="text-content-secondary leading-relaxed">
                  {selectedActivo.observaciones}
                </p>
              </div>
            )}

            <div className="border-t border-bg4 pt-3 flex gap-3 text-[9px] text-content-muted">
              {selectedActivo.fecha_ingreso_laboratorio && (
                <span>
                  Ingreso:{" "}
                  {new Date(
                    selectedActivo.fecha_ingreso_laboratorio,
                  ).toLocaleDateString()}
                </span>
              )}
              {selectedActivo.fecha_triaje && (
                <span>
                  Evaluado:{" "}
                  {new Date(selectedActivo.fecha_triaje).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-10 text-content-muted">
            No se pudo cargar la información del activo.
          </p>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Desmontes;
