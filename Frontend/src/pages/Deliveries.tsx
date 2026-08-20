import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Package,
  Download,
  Trash2,
  Search,
  CheckSquare,
  Pen,
} from "lucide-react";
import {
  DashboardLayout,
  Card,
  Button,
  NeoInput,
  NeoSelect,
  NeoTextarea,
  FormGroup,
  SectionTitle,
  TableContainer,
  THead,
  TBody,
  TH,
  TR,
  TD,
  Alert,
  Modal,
  ConfirmModal,
} from "../components/Fusion";
import { formatServerDateTime } from "../utils/dates";
import { ExportMenu } from "../components/ExportMenu";
import { SearchableSelect } from "../components/SearchableSelect";
import { useToast } from "../lib/toast";
import { logger } from "../lib/logger";
import api from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useActas, useSaveActa } from "../hooks/useActas";
import { useProyectos } from "../hooks/useProjects";
import { useClientes } from "../hooks/useClients";
import { useUsers } from "../hooks/useUsers";
import { useInventoryItems } from "../hooks/useActivos";
import { useRegionales, useCreateRegional } from "../hooks/useRegionales";
import { useAuth, type User } from "../hooks/useAuth";
import ItemModal from "./deliveries/ItemModal";
import EditActaModal from "./deliveries/EditActaModal";
import ActaViewModal from "./deliveries/ActaViewModal";
import {
  InventoryItem,
  ActaItem,
  ActaFormData,
  Acta,
  ACTA_TYPES,
} from "./deliveries/types";
import { downloadPostBlob } from "../services/download";

interface ProyectoRow {
  id_proyecto: number;
  nombre_proyecto: string;
}

interface ClienteRow {
  id_cliente: number;
  nombre: string;
}

interface RegionalRow {
  id_regional: number;
  nombre: string;
  ciudad?: string;
}

interface ActaListRow extends Acta {
  id_acta: number;
  fecha_entrega?: string | null;
}

const initFormData = (user?: User): ActaFormData => ({
  numero_acta: "",
  id_usuario_tecnico: 0,
  id_usuario_representante: user?.id_usuario || 0,
  nombre_tecnico: "",
  cedula: "",
  codigo: "",
  regional: user?.regional || "SES BARRANQUILLA",
  id_regional: "",
  fecha: new Date().toISOString().split("T")[0],
  estado_acta: "BORRADOR",
  observaciones_generales: "",
  nombre_representante: user?.nombre || "",
  cedula_representante: user?.cedula || "",
  codigo_representante: user?.codigo_empleado || "",
  id_proyecto: "",
  id_cliente: "",
  tipo_acta: "ENTREGA_HERRAMIENTA",
});

const normalizeError = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { detail?: unknown } } };
  const detail = e?.response?.data?.detail;
  if (Array.isArray(detail))
    return detail
      .map((d: { msg?: string }) => d.msg)
      .filter(Boolean)
      .join("; ");
  if (typeof detail === "string") return detail;
  return fallback;
};

const Deliveries: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const handleCreateRegional = async () => {
    if (!newRegionalNombre.trim()) {
      setError("El nombre de la regional es obligatorio.");
      return;
    }
    setCreatingRegional(true);
    try {
      const regional = await createRegionalMut.mutateAsync({
        nombre: newRegionalNombre.trim(),
        ciudad: newRegionalCiudad.trim() || undefined,
      });
      setFormData((prev) => ({
        ...prev,
        id_regional: String(regional.id_regional),
        regional: regional.nombre,
      }));
      setRegionalModalOpen(false);
      setNewRegionalNombre("");
      setNewRegionalCiudad("");
      toast.success("Regional creada correctamente.");
    } catch (err) {
      logger.error("Error creando regional:", err);
      setError("Error al crear la regional.");
    } finally {
      setCreatingRegional(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<ActaFormData>(
    initFormData(currentUser ?? undefined),
  );
  const [items, setItems] = useState<ActaItem[]>([]);
  const [actasPage, setActasPage] = useState(1);
  const actasPageSize = 50;
  const [searchActas, setSearchActas] = useState("");
  const [filterActaType, setFilterActaType] = useState("");
  const [editActa, setEditActa] = useState<Acta | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewActa, setViewActa] = useState<Acta | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmActaId, setConfirmActaId] = useState<number | null>(null);
  const [regionalModalOpen, setRegionalModalOpen] = useState(false);
  const [newRegionalNombre, setNewRegionalNombre] = useState("");
  const [newRegionalCiudad, setNewRegionalCiudad] = useState("");
  const [creatingRegional, setCreatingRegional] = useState(false);

  const { data: actasData } = useActas(actasPage, actasPageSize);
  const actas = (actasData?.items || []) as ActaListRow[];
  const actasTotal = actasData?.total || 0;
  const saveActaMut = useSaveActa();
  const { data: projectsData } = useProyectos(1, 500);
  const projects = (projectsData?.items || []) as ProyectoRow[];
  const { data: clientsData } = useClientes(1, 500);
  const clients = (clientsData?.items || []) as ClienteRow[];
  const { data: usersData } = useUsers(1, 500);
  const allUsers = (usersData?.items || []) as User[];
  const users = allUsers.filter((x) =>
    ["TECNICO", "TECNICO_LABORATORIO"].includes(x.rol),
  );
  const representatives = allUsers.filter((x) => ["ADMIN"].includes(x.rol));
  const { data: inventoryData } = useInventoryItems();
  const inventoryItems = (inventoryData?.items || []) as InventoryItem[];
  const { data: regionales } = useRegionales();
  const regionalesList = (regionales || []) as RegionalRow[];
  const createRegionalMut = useCreateRegional();

  useEffect(() => {
    if (!currentUser) return;
    setFormData((prev) => ({
      ...prev,
      id_usuario_representante:
        prev.id_usuario_representante || currentUser.id_usuario,
      nombre_representante:
        !prev.nombre_representante ||
        prev.nombre_representante === "ELKIN DAVID VELASQUEZ HERNANDEZ"
          ? currentUser.nombre
          : prev.nombre_representante,
      cedula_representante:
        prev.cedula_representante || currentUser.cedula || "",
      codigo_representante:
        prev.codigo_representante || currentUser.codigo_empleado || "",
      regional: prev.regional || currentUser.regional || prev.regional,
    }));
  }, [currentUser]);

  const resetForm = () => {
    setFormData(initFormData(currentUser ?? undefined));
    setItems([]);
    setError(null);
  };

  const matchRegionalId = (name?: string | null) => {
    if (!name) return "";
    const found = regionalesList.find(
      (r) => r.nombre.toLowerCase() === name.trim().toLowerCase(),
    );
    return found ? String(found.id_regional) : "";
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) {
      setFormData({
        ...formData,
        id_usuario_tecnico: 0,
        nombre_tecnico: "",
        cedula: "",
        codigo: "",
        regional: currentUser?.regional || "SES BARRANQUILLA",
        id_regional: matchRegionalId(currentUser?.regional),
      });
      return;
    }
    const u = users.find((x) => x.id_usuario.toString() === userId);
    if (u)
      setFormData({
        ...formData,
        id_usuario_tecnico: u.id_usuario,
        nombre_tecnico: u.nombre,
        cedula: u.cedula || "",
        codigo: u.codigo_empleado || "",
        regional: u.regional || "SES BARRANQUILLA",
        id_regional: matchRegionalId(u.regional),
      });
  };

  const handleRepresentativeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const userId = e.target.value;
    const u = representatives.find((x) => x.id_usuario.toString() === userId);
    if (u) {
      setFormData({
        ...formData,
        id_usuario_representante: u.id_usuario,
        nombre_representante: u.nombre,
        cedula_representante: u.cedula || "",
        codigo_representante: u.codigo_empleado || "",
      });
      return;
    }
    setFormData({
      ...formData,
      id_usuario_representante: currentUser?.id_usuario || 0,
      nombre_representante:
        currentUser?.nombre || formData.nombre_representante,
      cedula_representante:
        currentUser?.cedula || formData.cedula_representante,
      codigo_representante:
        currentUser?.codigo_empleado || formData.codigo_representante,
    });
  };

  const handleModalConfirm = (
    selected: { item: InventoryItem; cantidad: number }[],
  ) => {
    const newItems: ActaItem[] = selected.map(({ item, cantidad }) => ({
      id_item: item.id_item.toString(),
      id_activo: "",
      descripcion: item.nombre_equipo,
      marca: item.marca,
      referencia: item.referencia,
      serie: "",
      cantidad,
      observaciones: "NUEVO",
    }));
    setItems((prev) => {
      const merged = [...prev];
      newItems.forEach((ni) => {
        const existing = merged.find((m) => m.id_item === ni.id_item);
        if (existing) existing.cantidad += ni.cantidad;
        else merged.push(ni);
      });
      return merged;
    });
    setModalOpen(false);
  };

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const saveActaOnly = async () => {
    if (!formData.id_usuario_tecnico || formData.id_usuario_tecnico === 0) {
      setError("Debe seleccionar un técnico de la lista");
      return;
    }
    if (!formData.nombre_tecnico) {
      setError("Debe seleccionar un técnico");
      return;
    }
    if (items.length === 0) {
      setError("Debe agregar al menos un item");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveActaMut.mutateAsync({
        numero_acta: formData.numero_acta || null,
        estado_acta: formData.estado_acta,
        id_usuario_tecnico: formData.id_usuario_tecnico,
        id_usuario_representante:
          formData.id_usuario_representante || currentUser?.id_usuario || 1,
        id_proyecto: formData.id_proyecto
          ? parseInt(formData.id_proyecto)
          : null,
        id_cliente: formData.id_cliente ? parseInt(formData.id_cliente) : null,
        id_regional: formData.id_regional
          ? parseInt(formData.id_regional)
          : null,
        tipo_acta: formData.tipo_acta,
        observaciones: formData.observaciones_generales,
        detalles: items.map((it) => ({
          id_item: parseInt(it.id_item),
          id_activo: it.id_activo ? parseInt(it.id_activo) : null,
          cantidad: it.cantidad,
          notas_estado: it.observaciones,
        })),
      });
      setSuccess("Acta guardada correctamente");
      resetForm();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      logger.error("Error guardando acta:", err);
      setError(normalizeError(err, "Error al guardar el acta"));
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!formData.nombre_tecnico) {
      setError("Debe seleccionar un técnico");
      return;
    }
    if (items.length === 0) {
      setError("Debe agregar al menos un item");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const filename = `Acta_Entrega_${formData.nombre_tecnico.replace(/ /g, "_")}_${formData.fecha}.pdf`;
      await downloadPostBlob(
        "/business/actas/generate",
        { ...formData, items },
        filename,
      );
      setSuccess("PDF generado correctamente");
      toast.success("PDF generado correctamente");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      logger.error("Error generando PDF:", err);
      setError(normalizeError(err, "Error generando PDF"));
    } finally {
      setLoading(false);
    }
  };

  const generateActaPDF = async (actaId: number) => {
    setLoading(true);
    setError(null);
    try {
      await downloadPostBlob(
        `/business/actas/${actaId}/generate`,
        {},
        `Acta_${actaId}.pdf`,
      );
      try {
        const res = await api.post(`/business/actas/${actaId}/downloaded`);
        toast.success(res?.data?.message || "Descarga registrada");
      } catch {
        toast.info("PDF generado (registro de descarga falló)");
      }
      setSuccess("PDF del acta generado");
      toast.success("PDF generado");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      logger.error("Error generando PDF del acta:", err);
      setError(normalizeError(err, "Error generando PDF del acta"));
      toast.error(normalizeError(err, "Error generando PDF"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditActa = (acta: Acta) => {
    setEditActa(acta);
    setEditModalOpen(true);
  };
  const handleViewActa = async (actaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/business/actas/${actaId}`);
      setViewActa((res.data || res) as Acta);
      setViewModalOpen(true);
    } catch (err) {
      logger.error("Error cargando acta:", err);
      setError(normalizeError(err, "Error cargando acta"));
      toast.error(normalizeError(err, "Error cargando acta"));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteActa = (actaId: number) => {
    setConfirmActaId(actaId);
    setConfirmOpen(true);
  };
  const performDeleteActa = async (actaId: number | null) => {
    if (!actaId) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/business/actas/${actaId}`);
      setSuccess("Acta eliminada correctamente");
      toast.success("Acta eliminada");
      qc.invalidateQueries({ queryKey: ["actas"] });
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      logger.error("Error eliminando acta:", err);
      setError(normalizeError(err, "Error eliminando acta"));
      toast.error(normalizeError(err, "Error eliminando acta"));
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmActaId(null);
    }
  };

  const getProjectName = (id: number | null | undefined) =>
    projects.find((p) => p.id_proyecto === id)?.nombre_proyecto ||
    (id ? String(id) : "—");
  const getUserName = (id: number | null | undefined) =>
    users.find((u) => u.id_usuario === id)?.nombre || (id ? String(id) : "—");

  const filteredActas = actas.filter((acta) => {
    const s = searchActas.toLowerCase();
    return (
      (!s ||
        acta.numero_acta?.toLowerCase().includes(s) ||
        acta.tipo_acta?.toLowerCase().includes(s) ||
        acta.estado_acta?.toLowerCase().includes(s) ||
        acta.observaciones?.toLowerCase().includes(s)) &&
      (!filterActaType || acta.tipo_acta === filterActaType)
    );
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Actas de Entrega
          </h1>
          <p className="text-content-muted text-xs uppercase tracking-widest mt-1">
            Generación de actas institucionales Securitas
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportMenu module="actas" />
          <Button variant="neo" onClick={resetForm}>
            Limpiar
          </Button>
          <Button variant="neo" onClick={saveActaOnly} disabled={saving}>
            {saving ? (
              "Guardando..."
            ) : (
              <>
                <CheckSquare size={14} className="mr-2" /> Guardar Acta
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={loading}>
            {loading ? (
              "Generando..."
            ) : (
              <>
                <Download size={16} className="mr-2" /> Descargar / Imprimir
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <SectionTitle>1. Información Técnico</SectionTitle>
            <FormGroup label="Seleccionar Técnico" htmlFor="id_usuario_tecnico">
              <SearchableSelect
                options={users.map((u) => ({
                  value: String(u.id_usuario),
                  label: u.nombre,
                  searchTerms: `${u.nombre} ${u.email || ""} ${u.cedula || ""}`,
                }))}
                value={formData.id_usuario_tecnico?.toString() || ""}
                onChange={(val) =>
                  handleUserSelect({
                    target: { value: val },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Escriba para buscar técnico..."
              />
            </FormGroup>
            <FormGroup label="Nombre Completo" htmlFor="nombre_tecnico">
              <NeoInput
                id="nombre_tecnico"
                value={formData.nombre_tecnico}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_tecnico: e.target.value })
                }
              />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Cédula" htmlFor="cedula">
                <NeoInput
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) =>
                    setFormData({ ...formData, cedula: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup label="Código" htmlFor="codigo">
                <NeoInput
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                />
              </FormGroup>
            </div>
            <FormGroup label="Regional" htmlFor="regional">
              <div className="flex gap-2 items-start">
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    options={regionalesList.map((r) => ({
                      value: String(r.id_regional),
                      label: r.nombre,
                    }))}
                    value={formData.id_regional}
                    onChange={(val) => {
                      const reg = regionalesList.find(
                        (r) => String(r.id_regional) === val,
                      );
                      setFormData({
                        ...formData,
                        id_regional: val,
                        regional: reg ? reg.nombre : formData.regional,
                      });
                    }}
                    placeholder="Escriba para buscar regional..."
                  />
                </div>
                <Button
                  variant="neo"
                  type="button"
                  className="h-10 px-2.5 shrink-0 text-[10px]"
                  onClick={() => setRegionalModalOpen(true)}
                  title="Crear nueva regional"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </FormGroup>
            <FormGroup label="Fecha de Entrega" htmlFor="fecha">
              <NeoInput
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Proyecto" htmlFor="id_proyecto">
              <SearchableSelect
                options={projects.map((p) => ({
                  value: String(p.id_proyecto),
                  label: p.nombre_proyecto,
                }))}
                value={formData.id_proyecto}
                onChange={(val) =>
                  setFormData({ ...formData, id_proyecto: val })
                }
                placeholder="Escriba para buscar proyecto..."
              />
            </FormGroup>
            <FormGroup label="Cliente" htmlFor="id_cliente">
              <SearchableSelect
                options={clients.map((c) => ({
                  value: String(c.id_cliente),
                  label: c.nombre,
                }))}
                value={formData.id_cliente}
                onChange={(val) =>
                  setFormData({ ...formData, id_cliente: val })
                }
                placeholder="Escriba para buscar cliente..."
              />
            </FormGroup>
            <FormGroup label="Tipo de Acta" htmlFor="tipo_acta">
              <NeoSelect
                id="tipo_acta"
                value={formData.tipo_acta}
                onChange={(e) => {
                  setFormData({ ...formData, tipo_acta: e.target.value });
                  if (items.length > 0) setItems([]);
                }}
              >
                {ACTA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </NeoSelect>
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Número de Acta" htmlFor="numero_acta">
                <NeoInput
                  id="numero_acta"
                  value={formData.numero_acta}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_acta: e.target.value })
                  }
                  placeholder="Ej: SES-ACT-2024-001 (opcional)"
                />
              </FormGroup>
              <FormGroup label="Estado del Acta" htmlFor="estado_acta">
                <NeoSelect
                  id="estado_acta"
                  value={formData.estado_acta}
                  onChange={(e) =>
                    setFormData({ ...formData, estado_acta: e.target.value })
                  }
                >
                  <option value="BORRADOR">Borrador</option>
                  <option value="FIRMADA">Firmada</option>
                  <option value="ANULADA">Anulada</option>
                </NeoSelect>
              </FormGroup>
            </div>
          </Card>

          <Card>
            <SectionTitle>Firmas & Autorización</SectionTitle>
            <FormGroup
              label="Representante Securitas"
              htmlFor="id_usuario_representante"
            >
              <SearchableSelect
                options={[
                  { value: "", label: "Usar usuario en sesión" },
                  ...representatives.map((u) => ({
                    value: String(u.id_usuario),
                    label: `${u.nombre} (${u.rol})`,
                  })),
                ]}
                value={formData.id_usuario_representante?.toString() || ""}
                onChange={(val) =>
                  handleRepresentativeSelect({
                    target: { value: val },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Escriba para buscar representante..."
              />
            </FormGroup>
            <FormGroup
              label="Nombre representante"
              htmlFor="nombre_representante"
            >
              <NeoInput
                id="nombre_representante"
                value={formData.nombre_representante}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre_representante: e.target.value,
                  })
                }
              />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup
                label="Cédula representante"
                htmlFor="cedula_representante"
              >
                <NeoInput
                  id="cedula_representante"
                  value={formData.cedula_representante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cedula_representante: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                label="Código representante"
                htmlFor="codigo_representante"
              >
                <NeoInput
                  id="codigo_representante"
                  value={formData.codigo_representante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      codigo_representante: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-bg4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-bg2/30">
              <div className="flex items-center gap-3">
                <Package className="text-emerald-primary" size={18} />
                <SectionTitle>
                  2. Herramienta, Equipos, Consumibles y EPPs
                </SectionTitle>
              </div>
              <Button
                variant="neo"
                className="text-[10px] h-9"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={14} className="mr-2" /> Agregar Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <TableContainer>
                <THead>
                  <TH className="w-10">#</TH>
                  <TH>Descripción / Equipo</TH>
                  <TH>Marca</TH>
                  <TH>Referencia</TH>
                  <TH>Serie</TH>
                  <TH className="w-20">Cant.</TH>
                  <TH className="w-10" />
                </THead>
                <TBody>
                  {items.length === 0 ? (
                    <TR>
                      <TD colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center opacity-30">
                          <FileText size={48} className="mb-4" />
                          <p className="text-sm font-bold uppercase tracking-widest">
                            No hay items en el acta
                          </p>
                        </div>
                      </TD>
                    </TR>
                  ) : (
                    items.map((item, index) => (
                      <TR key={index}>
                        <TD className="font-bold text-emerald-primary">
                          {index + 1}
                        </TD>
                        <TD>
                          <p className="text-xs font-semibold">
                            {item.descripcion}
                          </p>
                        </TD>
                        <TD>
                          <p className="text-xs text-content-muted">
                            {item.marca || "—"}
                          </p>
                        </TD>
                        <TD>
                          <p className="text-xs text-content-muted">
                            {item.referencia || "—"}
                          </p>
                        </TD>
                        <TD>
                          <p className="text-xs text-content-muted font-mono">
                            {item.serie || "—"}
                          </p>
                        </TD>
                        <TD>
                          <p className="text-xs font-bold text-center">
                            {item.cantidad}
                          </p>
                        </TD>
                        <TD>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-content-muted hover:text-danger transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </TableContainer>
            </div>
          </Card>

          <Card>
            <SectionTitle>3. Observaciones Generales</SectionTitle>
            <NeoTextarea
              placeholder="Notas adicionales..."
              value={formData.observaciones_generales}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observaciones_generales: e.target.value,
                })
              }
            />
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTitle>Actas Guardadas</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full sm:w-auto">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                size={16}
              />
              <input
                id="searchActas"
                type="text"
                value={searchActas}
                onChange={(e) => setSearchActas(e.target.value)}
                placeholder="Buscar acta..."
                className="w-full rounded-xl border border-bg3 bg-bg1/80 py-3 pl-10 pr-4 text-sm text-content outline-none focus:border-emerald-primary/50"
              />
            </div>
            <NeoSelect
              id="filterActaType"
              value={filterActaType}
              onChange={(e) => setFilterActaType(e.target.value)}
              className="h-11 text-xs"
            >
              <option value="">Todos los tipos</option>
              {ACTA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </NeoSelect>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-4">
          <SectionTitle>Listado de Actas</SectionTitle>
          <div className="overflow-x-auto mt-3">
            <TableContainer>
              <THead>
                <TH className="w-10">#</TH>
                <TH>Número</TH>
                <TH className="hidden sm:table-cell">Tipo</TH>
                <TH className="hidden md:table-cell">Proyecto</TH>
                <TH className="hidden lg:table-cell">Regional</TH>
                <TH className="hidden xl:table-cell">Técnico</TH>
                <TH>Estado</TH>
                <TH className="hidden sm:table-cell">Fecha</TH>
                <TH className="w-32">Acciones</TH>
              </THead>
              <TBody>
                {filteredActas.length === 0 ? (
                  <TR>
                    <TD colSpan={9} className="text-center py-8">
                      No hay actas guardadas
                    </TD>
                  </TR>
                ) : (
                  filteredActas.map((a, idx: number) => (
                    <TR
                      key={a.id_acta || idx}
                      onClick={() => handleViewActa(a.id_acta)}
                      className="cursor-pointer"
                    >
                      <TD className="font-bold">{idx + 1}</TD>
                      <TD>
                        <p className="text-xs font-semibold">
                          {a.numero_acta || "—"}
                        </p>
                      </TD>
                      <TD className="hidden sm:table-cell">
                        <p className="text-xs">
                          {a.tipo_acta?.replace(/_/g, " ")}
                        </p>
                      </TD>
                      <TD className="hidden md:table-cell">
                        <p className="text-xs">
                          {getProjectName(a.id_proyecto)}
                        </p>
                      </TD>
                      <TD className="hidden lg:table-cell">
                        <p className="text-xs">
                          {a.regional_rel?.nombre || "—"}
                        </p>
                      </TD>
                      <TD className="hidden xl:table-cell">
                        <p className="text-xs">
                          {getUserName(a.id_usuario_tecnico)}
                        </p>
                      </TD>
                      <TD>
                        <p className="text-xs">{a.estado_acta || "—"}</p>
                      </TD>
                      <TD className="hidden sm:table-cell">
                        <p className="text-xs">
                          {a.fecha_entrega
                            ? formatServerDateTime(a.fecha_entrega)
                            : "—"}
                        </p>
                      </TD>
                      <TD>
                        <div className="flex gap-2">
                          <button
                            title="Ver"
                            onClick={(e) => { e.stopPropagation(); handleViewActa(a.id_acta); }}
                            className="p-1 text-content-muted hover:text-content"
                          >
                            <FileText size={16} />
                          </button>
                          {currentUser?.rol === "ADMIN" && (
                            <button
                              title="Editar"
                              onClick={(e) => { e.stopPropagation(); handleEditActa(a); }}
                              className="p-1 text-content-muted hover:text-content"
                            >
                              <Pen size={16} />
                            </button>
                          )}
                          <button
                            title="Descargar"
                            onClick={(e) => { e.stopPropagation(); generateActaPDF(a.id_acta); }}
                            className="p-1 text-content-muted hover:text-content"
                          >
                            <Download size={16} />
                          </button>
                          {currentUser?.rol === "ADMIN" && (
                            <button
                              title="Eliminar"
                              onClick={(e) => { e.stopPropagation(); handleDeleteActa(a.id_acta); }}
                              className="p-1 text-content-muted hover:text-danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </TableContainer>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold">
          Mostrando {actas.length} de {actasTotal} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={actasPage === 1}
            onClick={() => {
              setActasPage(actasPage - 1);
            }}
          >
            Anterior
          </Button>
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={actasTotal <= actasPage * actasPageSize}
            onClick={() => {
              setActasPage(actasPage + 1);
            }}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <ItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        inventoryItems={inventoryItems}
        tipoActa={formData.tipo_acta}
      />
      <EditActaModal
        key={editActa?.id_acta || "new"}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        acta={editActa ?? undefined}
        onSaved={() => qc.invalidateQueries({ queryKey: ["actas"] })}
      />
      <ActaViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        acta={viewActa ?? undefined}
        projectName={getProjectName(viewActa?.id_proyecto)}
        userName={getUserName(viewActa?.id_usuario_tecnico)}
        onDownload={generateActaPDF}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar eliminación"
        message="¿Eliminar acta? Esta acción no se puede deshacer."
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmActaId(null);
        }}
        onConfirm={() => performDeleteActa(confirmActaId)}
      />
      <Modal
        isOpen={regionalModalOpen}
        onClose={() => setRegionalModalOpen(false)}
        title="Crear Regional"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRegionalModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRegional} disabled={creatingRegional}>
              {creatingRegional ? "Creando..." : "Crear Regional"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-[11px] md:text-xs">
          <FormGroup label="Nombre de la Regional">
            <NeoInput
              value={newRegionalNombre}
              onChange={(e) => setNewRegionalNombre(e.target.value)}
              placeholder="Ej: REGIONAL RESIDENCIAL"
            />
          </FormGroup>
          <FormGroup label="Ciudad (opcional)">
            <NeoInput
              value={newRegionalCiudad}
              onChange={(e) => setNewRegionalCiudad(e.target.value)}
              placeholder="Ej: Medellín"
            />
          </FormGroup>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Deliveries;
