import React, { useEffect, useState } from "react";
import { ExportMenu } from "../components/ExportMenu";
import {
  Search,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  ClipboardList,
  Download,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
  ConfirmModal,
  Alert,
  NeoTextarea,
} from "../components/Fusion";
import { SearchableSelect } from "../components/SearchableSelect";
import { useToast } from "../lib/toast";
import {
  useGarantias,
  useCreateGarantia,
  useUpdateGarantia,
  useDeleteGarantia,
  type GarantiaPayload,
} from "../hooks/useGuarantees";
import { useProveedores, useCreateProveedor } from "../hooks/useProveedores";
import { useActivos } from "../hooks/useActivos";
import { downloadTemplate, importInventory } from "../services/inventory";
import { logger } from "../lib/logger";

interface GarantiaRow {
  id_garantia: number;
  id_activo?: number;
  id_proveedor?: number;
  numero_caso_interno?: string;
  rma_proveedor?: string;
  estado_proceso?: string;
  falla_reportada?: string;
  numero_factura_compra?: string;
  area_origen?: string;
  credenciales_equipo?: string;
  id_acta_devolucion?: string | number;
  comentarios_proceso?: string;
  fecha_envio?: string | null;
  fecha_limite_estimada?: string | null;
  fecha_inicio_garantia?: string | null;
  meses_garantia?: number | null;
  tipo_resolucion?: string;
  fecha_recibido_reparado?: string | null;
  activo?: {
    serial?: string;
    item?: { nombre_equipo?: string; referencia?: string };
  };
}

interface ProveedorRow {
  id_proveedor: number;
  nombre: string;
}

interface ActivoRow {
  id_activo: number;
  serial?: string;
  item?: { nombre_equipo?: string; referencia?: string };
}

interface GarantiaFormValues {
  id_activo: string;
  id_proveedor: string;
  numero_caso_interno: string;
  rma_proveedor: string;
  numero_factura_compra: string;
  fecha_envio: string;
  fecha_limite_estimada: string;
  fecha_inicio_garantia: string;
  meses_garantia: string;
  fecha_recibido_reparado: string;
  falla_reportada: string;
  estado_proceso: string;
  tipo_resolucion: string;
  area_origen: string;
  credenciales_equipo: string;
  id_acta_devolucion: string;
  comentarios_proceso: string;
}

const Guarantees: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingGarantia, setEditingGarantia] = useState<GarantiaRow | null>(
    null,
  );
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [provModalOpen, setProvModalOpen] = useState(false);
  const [newProvNombre, setNewProvNombre] = useState("");
  const [newProvNit, setNewProvNit] = useState("");
  const [newProvTelefono, setNewProvTelefono] = useState("");
  const [creatingProv, setCreatingProv] = useState(false);

  const { data: garData, isLoading } = useGarantias(currentPage, pageSize);
  const garantias = (garData?.items || []) as GarantiaRow[];
  const totalGarantias = garData?.total || 0;
  const { data: provData } = useProveedores();
  const proveedores = (provData?.items || []) as ProveedorRow[];
  const { data: actData } = useActivos();
  const activos = (actData?.items || []) as ActivoRow[];
  const createGarantiaMut = useCreateGarantia();
  const updateGarantiaMut = useUpdateGarantia();
  const deleteGarantiaMut = useDeleteGarantia();
  const createProveedorMut = useCreateProveedor();

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 4500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const handleCreateProveedor = async () => {
    if (!newProvNombre.trim()) {
      setAlert({ type: "error", message: "El nombre del proveedor es obligatorio." });
      return;
    }
    setCreatingProv(true);
    try {
      const prov = await createProveedorMut.mutateAsync({
        nombre: newProvNombre.trim(),
        nit: newProvNit.trim() || undefined,
        telefono: newProvTelefono.trim() || undefined,
      });
      setValue("id_proveedor", String(prov.id_proveedor));
      setProvModalOpen(false);
      setNewProvNombre("");
      setNewProvNit("");
      setNewProvTelefono("");
      toast.success("Proveedor creado correctamente.");
    } catch (error) {
      logger.error("Error creando proveedor:", error);
      setAlert({ type: "error", message: "Error al crear el proveedor." });
    } finally {
      setCreatingProv(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GarantiaFormValues>();

  const handleEdit = (gar: GarantiaRow) => {
    setEditingGarantia(gar);
    setValue("id_activo", String(gar.id_activo ?? ""));
    setValue("id_proveedor", String(gar.id_proveedor ?? ""));
    setValue("numero_caso_interno", gar.numero_caso_interno ?? "");
    setValue("rma_proveedor", gar.rma_proveedor ?? "");
    setValue("numero_factura_compra", gar.numero_factura_compra ?? "");
    setValue("fecha_envio", gar.fecha_envio ?? "");
    setValue("fecha_limite_estimada", gar.fecha_limite_estimada ?? "");
    setValue("falla_reportada", gar.falla_reportada ?? "");
    setValue("estado_proceso", gar.estado_proceso ?? "");
    setValue("tipo_resolucion", gar.tipo_resolucion ?? "");
    setValue("fecha_inicio_garantia", gar.fecha_inicio_garantia ?? "");
    setValue(
      "meses_garantia",
      gar.meses_garantia != null ? String(gar.meses_garantia) : "",
    );
    setValue("area_origen", gar.area_origen || "");
    setValue("credenciales_equipo", gar.credenciales_equipo || "");
    setValue("fecha_recibido_reparado", gar.fecha_recibido_reparado || "");
    setValue("id_acta_devolucion", String(gar.id_acta_devolucion ?? ""));
    setValue("comentarios_proceso", gar.comentarios_proceso || "");
    setIsModalOpen(true);
  };

  const openConfirm = (id: number, message?: string) => {
    setConfirmId(id);
    setConfirmMessage(
      message || "¿Está seguro de eliminar este registro de garantía?",
    );
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (confirmId == null) return;
    try {
      await deleteGarantiaMut.mutateAsync(confirmId);
      toast.success("Registro de garantía eliminado correctamente.");
      setAlert(null);
    } catch (error) {
      toast.error("Error al eliminar el registro.");
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGarantia(null);
    reset();
  };

  const onSubmit = async (data: GarantiaFormValues) => {
    try {
      const payload: Record<string, unknown> = { ...data };
      [
        "fecha_envio",
        "fecha_limite_estimada",
        "fecha_recibido_reparado",
        "fecha_inicio_garantia",
      ].forEach((f) => {
        if (!payload[f]) delete payload[f];
      });
      if (payload.meses_garantia !== undefined && payload.meses_garantia !== "") {
        payload.meses_garantia = Number(payload.meses_garantia);
      } else {
        delete payload.meses_garantia;
      }
      if (payload.id_acta_devolucion === "") {
        delete payload.id_acta_devolucion;
      } else if (payload.id_acta_devolucion !== undefined) {
        payload.id_acta_devolucion = Number(payload.id_acta_devolucion);
      }
      if (payload.id_proveedor === "") {
        delete payload.id_proveedor;
      } else if (payload.id_proveedor !== undefined) {
        payload.id_proveedor = Number(payload.id_proveedor);
      }
      if (payload.id_activo !== undefined) {
        payload.id_activo = Number(payload.id_activo);
      }
      const body = payload as unknown as GarantiaPayload;
      if (editingGarantia) {
        await updateGarantiaMut.mutateAsync({
          id: editingGarantia.id_garantia,
          data: body,
        });
        setAlert({
          type: "success",
          message: "Garantía actualizada correctamente.",
        });
      } else {
        await createGarantiaMut.mutateAsync(body);
        setAlert({
          type: "success",
          message: "Proceso de garantía iniciado correctamente.",
        });
      }
      closeModal();
    } catch (error) {
      const detail = (
        error as { response?: { data?: { detail?: unknown } } }
      ).response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail
            .map((e: { msg?: string }) => e.msg)
            .filter(Boolean)
            .join("; ")
        : typeof detail === "string"
          ? detail
          : "Error al procesar la solicitud.";
      setAlert({ type: "error", message: msg });
    }
  };

  const formatDateTime = (d: string | null | undefined) => {
    if (!d) return "---";
    try {
      return new Date(d).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "REGISTRADO":
        return (
          <Badge
            label="REGISTRADO"
            color="var(--content-muted)"
            bg="rgba(255,255,255,0.05)"
          />
        );
      case "ENVIADO_PROVEEDOR":
        return (
          <Badge
            label="EN PROVEEDOR"
            color="var(--chart-blue)"
            bg="rgba(0,163,255,0.1)"
          />
        );
      case "RECIBIDO_PROVEEDOR":
        return (
          <Badge
            label="EN REVISIÓN"
            color="var(--gold)"
            bg="rgba(255,184,0,0.1)"
          />
        );
      case "RESUELTO_REEMPLAZADO":
        return (
          <Badge
            label="SOLUCIONADO"
            color="var(--emerald)"
            bg="var(--emerald-muted)"
          />
        );
      case "ENTREGADO_CLIENTE":
        return (
          <Badge
            label="ENTREGADO A CLIENTE"
            color="var(--chart-teal)"
            bg="rgba(0,200,150,0.1)"
          />
        );
      default:
        return <Badge label={status || "S.N."} color="white" bg="gray" />;
    }
  };

  const filteredGarantias = garantias.filter(
    (garantia) =>
      garantia.numero_caso_interno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      garantia.activo?.serial
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      garantia.rma_proveedor?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Garantías
          </h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">
            Seguimiento de procesos de retorno y soporte técnico
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
          <ExportMenu module="guarantees" />
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => downloadTemplate("garantias")}
          >
            <Download size={14} />
            Plantilla
          </Button>
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload size={16} />
            Carga Excel
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nueva Garantía
          </Button>
        </div>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <Card className="mb-8">
        <div className="relative max-w-md">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
            size={16}
          />
          <NeoInput
            placeholder="Buscar por caso, serial o RMA..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-bg4">
        <TableContainer>
          <THead>
            <TH>Caso / Trazabilidad</TH>
            <TH className="hidden sm:table-cell">Equipo Serializado</TH>
            <TH>Estado</TH>
            <TH className="hidden md:table-cell">Fechas</TH>
            <TH className="hidden lg:table-cell">Falla / Diagnóstico</TH>
            <TH></TH>
          </THead>
          <TBody>
            {isLoading ? (
              <TR>
                <TD colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-chart-teal/30 border-t-chart-teal rounded-full animate-spin" />
                    <span className="text-chart-teal uppercase tracking-[0.2em] font-bold text-[10px]">
                      Sincronizando...
                    </span>
                  </div>
                </TD>
              </TR>
            ) : filteredGarantias.length > 0 ? (
              filteredGarantias.map((garantia) => (
                <TR
                  key={garantia.id_garantia}
                  onClick={() => handleEdit(garantia)}
                  className="cursor-pointer"
                >
                  <TD>
                    <div className="space-y-1">
                      <div className="font-bold text-xs md:text-sm text-content-primary font-mono">
                        {garantia.numero_caso_interno}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-content-muted flex items-center gap-1.5">
                        <ClipboardList
                          size={10}
                          className="text-chart-teal shrink-0"
                        />
                        <span className="truncate max-w-[80px] sm:max-w-none">
                          RMA: {garantia.rma_proveedor || "PEND"}
                        </span>
                      </div>
                      <div className="sm:hidden text-[9px] text-emerald-primary font-mono">
                        S/N: {garantia.activo?.serial}
                      </div>
                    </div>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-content-primary truncate max-w-[120px] md:max-w-[180px] lg:max-w-[250px]">
                        {garantia.activo?.item?.nombre_equipo}
                      </span>
                      <span className="text-[10px] text-emerald-primary font-mono mt-0.5">
                        S/N: {garantia.activo?.serial}
                      </span>
                    </div>
                  </TD>
                  <TD>{getStatusBadge(garantia.estado_proceso)}</TD>
                  <TD className="hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-content-secondary">
                        <Calendar size={12} className="text-content-muted" />
                        <span className="text-[10px] whitespace-nowrap">
                          {formatDateTime(garantia.fecha_envio)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gold">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold whitespace-nowrap">
                          Límite:{" "}
                          {formatDateTime(garantia.fecha_limite_estimada)}
                        </span>
                      </div>
                      {garantia.fecha_recibido_reparado && (
                        <div className="flex items-center gap-2 text-emerald-primary">
                          <Calendar size={12} />
                          <span className="text-[10px] whitespace-nowrap">
                            Retorno:{" "}
                            {formatDateTime(garantia.fecha_recibido_reparado)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TD>
                  <TD className="hidden lg:table-cell">
                    <div className="max-w-[180px] xl:max-w-[250px]">
                      <p className="text-[10px] text-content-muted italic line-clamp-2 leading-relaxed">
                        {garantia.falla_reportada || "Sin descripción"}
                      </p>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1.5 md:gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(garantia); }}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-bg4"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openConfirm(garantia.id_garantia); }}
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-danger transition-all shadow-neo border border-bg4"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        className="p-2 md:p-2.5 rounded-lg bg-bg3 text-content-muted hover:text-content-primary transition-all shadow-neo border border-bg4"
                        onClick={(e) => { e.stopPropagation(); navigate(`/guarantees/${garantia.id_garantia}`); }}
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD
                  colSpan={6}
                  className="text-center py-20 text-content-muted italic text-xs md:text-sm"
                >
                  Sin registros.
                </TD>
              </TR>
            )}
          </TBody>
        </TableContainer>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold text-center sm:text-left">
          Mostrando {filteredGarantias.length} de {totalGarantias} registros
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
            disabled={totalGarantias <= currentPage * pageSize}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal de Garantía / Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingGarantia
            ? "Editar Seguimiento de Garantía"
            : "Registrar Proceso de Garantía"
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>
              {editingGarantia
                ? "Actualizar Seguimiento"
                : "Iniciar Seguimiento"}
            </Button>
          </>
        }
      >
        <form className="space-y-4 text-[11px] md:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Estado del Proceso">
              <NeoSelect {...register("estado_proceso")}>
                <option value="REGISTRADO">Registrado</option>
                <option value="ENVIADO_PROVEEDOR">Enviado a Proveedor</option>
                <option value="RECIBIDO_PROVEEDOR">
                  Recibido (En Revisión)
                </option>
                <option value="RESUELTO_REEMPLAZADO">
                  Resuelto / Reemplazado
                </option>
                <option value="ENTREGADO_CLIENTE">Entregado a Cliente</option>
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Tipo de Resolución">
              <NeoSelect {...register("tipo_resolucion")}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="REPARADO">Reparado</option>
                <option value="REEMPLAZADO">Reemplazado</option>
                <option value="SIN_COBERTURA">Sin Cobertura</option>
              </NeoSelect>
            </FormGroup>
          </div>

          <FormGroup
            label="Activo (Serial)"
            error={errors.id_activo?.message as string}
          >
            <SearchableSelect
              options={activos.map((a) => ({
                value: String(a.id_activo),
                label: `${a.serial} - ${a.item?.nombre_equipo || ""}`,
                searchTerms: `${a.serial} ${a.item?.nombre_equipo || ""} ${a.item?.referencia || ""}`,
              }))}
              value={String(watch("id_activo") || "")}
              onChange={(val) => setValue("id_activo", val)}
              placeholder="Escriba para buscar activo (serial)..."
              disabled={!!editingGarantia}
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Proveedor de Garantía">
              <div className="flex gap-2 items-start">
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    options={proveedores.map((p) => ({
                      value: String(p.id_proveedor),
                      label: p.nombre,
                    }))}
                    value={String(watch("id_proveedor") || "")}
                    onChange={(val) => setValue("id_proveedor", val)}
                    placeholder="Escriba para buscar proveedor..."
                  />
                </div>
                <Button
                  variant="neo"
                  type="button"
                  className="h-10 px-2.5 shrink-0 text-[10px]"
                  onClick={() => setProvModalOpen(true)}
                  title="Crear nuevo proveedor"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </FormGroup>
            <FormGroup label="Número de Caso Interno">
              <NeoInput
                {...register("numero_caso_interno")}
                placeholder="Ej: SES-G-2024-001"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Área Solicitante / Origen">
              <NeoInput
                {...register("area_origen")}
                placeholder="Ej: Comercial, Monitoreo"
              />
            </FormGroup>
            <FormGroup label="Credenciales Equipo (IP/Claves)">
              <NeoInput
                {...register("credenciales_equipo")}
                placeholder="Ej: 192.168.1.10 / admin:123"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Seguimiento Proveedor">
              <NeoInput
                {...register("rma_proveedor")}
                placeholder="Ej: RMA-HK-12345"
              />
            </FormGroup>
            <FormGroup label="Número Factura Compra">
              <NeoInput
                {...register("numero_factura_compra")}
                placeholder="Ej: FAC-9988"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha de Envío">
              <NeoInput type="date" {...register("fecha_envio")} />
            </FormGroup>
            <FormGroup label="Fecha Límite Estimada">
              <NeoInput type="date" {...register("fecha_limite_estimada")} />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Inicio de Garantía">
              <NeoInput type="date" {...register("fecha_inicio_garantia")} />
            </FormGroup>
            <FormGroup label="Meses de Garantía">
              <NeoInput
                type="number"
                min={0}
                {...register("meses_garantia")}
                placeholder="Ej: 12"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha Retorno (Reparado)">
              <NeoInput type="date" {...register("fecha_recibido_reparado")} />
            </FormGroup>
            <FormGroup label="ID Acta Devolución">
              <NeoInput
                type="number"
                {...register("id_acta_devolucion")}
                placeholder="Si aplica"
              />
            </FormGroup>
          </div>

          <FormGroup label="Falla Reportada">
            <NeoTextarea
              {...register("falla_reportada")}
              placeholder="Describa detalladamente el problema del equipo..."
            />
          </FormGroup>

          <FormGroup label="Comentarios / Avances del Proceso">
            <NeoTextarea
              {...register("comentarios_proceso")}
              placeholder="Notas sobre el estado técnico o logístico..."
            />
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
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Carga Masiva de Garantías (Excel)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cerrar
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="p-4 border-2 border-dashed border-bg3 rounded-xl bg-bg3/50 text-center">
            <input
              type="file"
              id="garantias-excel-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImporting(true);
                  try {
                    const res = await importInventory(file);
                    setAlert({ type: "success", message: res.mensaje });
                    setCurrentPage(1);
                    setIsImportModalOpen(false);
                  } catch (err) {
                    const detail = (
                      err as { response?: { data?: { detail?: unknown } } }
                    ).response?.data?.detail;
                    setAlert({
                      type: "error",
                      message:
                        typeof detail === "string"
                          ? detail
                          : "Error al importar archivo",
                    });
                  } finally {
                    setImporting(false);
                  }
                }
              }}
            />
            <label
              htmlFor="garantias-excel-upload"
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
                  Soporta el formato ASIGNACION_NUMERO_DE_CASO (.xlsx)
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="neo"
              className="flex-1 text-[10px] py-2"
              onClick={() => downloadTemplate("garantias")}
            >
              <Download size={14} className="mr-1" />
              Plantilla Garantías
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-primary">
              Instrucciones
            </h4>
            <ul className="text-[10px] text-content-secondary space-y-2 list-disc pl-4">
              <li>
                El sistema detecta automáticamente el formato de asignación de
                casos de garantía.
              </li>
              <li>
                Los activos deben existir en el inventario (se buscan por
                serial).
              </li>
              <li>Se recomienda limpiar filas vacías antes de cargar.</li>
            </ul>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={provModalOpen}
        onClose={() => setProvModalOpen(false)}
        title="Crear Proveedor"
        footer={
          <>
            <Button variant="ghost" onClick={() => setProvModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProveedor} disabled={creatingProv}>
              {creatingProv ? "Creando..." : "Crear Proveedor"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-[11px] md:text-xs">
          <FormGroup label="Nombre del Proveedor">
            <NeoInput
              value={newProvNombre}
              onChange={(e) => setNewProvNombre(e.target.value)}
              placeholder="Ej: LG Electronics Colombia"
            />
          </FormGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="NIT (opcional)">
              <NeoInput
                value={newProvNit}
                onChange={(e) => setNewProvNit(e.target.value)}
                placeholder="Ej: 900123456-1"
              />
            </FormGroup>
            <FormGroup label="Teléfono (opcional)">
              <NeoInput
                value={newProvTelefono}
                onChange={(e) => setNewProvTelefono(e.target.value)}
                placeholder="+57 300..."
              />
            </FormGroup>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Guarantees;
