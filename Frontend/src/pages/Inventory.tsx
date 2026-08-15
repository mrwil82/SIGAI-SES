import React, { useEffect, useState } from "react";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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
} from "../components/Fusion";
import { useToast } from "../lib/toast";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  importInventory,
  downloadTemplate,
  createActivo,
} from "../services/inventory";
import { SearchableSelect } from "../components/SearchableSelect";
import { ExportMenu } from "../components/ExportMenu";
import { useInventory } from "../hooks/useInventory";
import { useClientes } from "../hooks/useClients";
import { useProyectos } from "../hooks/useProjects";
import { useProveedores } from "../hooks/useProveedores";

interface InventoryItemRow {
  id_item: number;
  nombre_equipo?: string;
  categoria?: string;
  sub_categoria?: string;
  marca?: string;
  referencia?: string;
  codigo_item_interno?: string;
  costo_unitario?: number | string;
  moneda?: string;
  stock_minimo?: number;
  compra_maxima?: number;
  unidad_medida?: string;
  deleted_at?: string | null;
  stock_bulk?: { cantidad_actual?: number };
}

interface InventoryFormValues {
  nombre_equipo: string;
  categoria: string;
  sub_categoria: string;
  marca: string;
  referencia: string;
  codigo_item_interno: string;
  costo_unitario: number;
  moneda: string;
  unidad_medida: string;
  stock_minimo: number;
  compra_maxima: number;
  cantidad_inicial: number;
  ubicacion: string;
}

interface ActivoFormValues {
  id_item: string;
  serial: string;
  estado_actual: string;
  condicion_fisica: string;
  area_asignada: string;
  responsable_sitio: string;
  ubicacion_fisica: string;
  id_proyecto_actual: string;
  id_cliente_actual: string;
  id_proveedor_compra: string;
  numero_factura_compra: string;
  fecha_compra: string;
  activo_fijo_securitas: string;
  credenciales_tecnicas: string;
  observaciones: string;
}

interface SimpleRow {
  id_cliente?: number;
  id_proyecto?: number;
  id_proveedor?: number;
  nombre?: string;
  nombre_proyecto?: string;
}

const UBICACIONES = [
  { id: "BODEGA_PRINCIPAL", nombre: "Bodega Principal" },
  { id: "BODEGA_SECUNDARIA", nombre: "Bodega Secundaria" },
  { id: "LABORATORIO", nombre: "Laboratorio" },
  { id: "ESTANTE_A1", nombre: "Estante A1" },
  { id: "ESTANTE_A2", nombre: "Estante A2" },
  { id: "ESTANTE_B1", nombre: "Estante B1" },
  { id: "ESTANTE_B2", nombre: "Estante B2" },
  { id: "ESTANTE_C1", nombre: "Estante C1" },
  { id: "ESTANTE_C2", nombre: "Estante C2" },
  { id: "CUARTO_SEGURO", nombre: "Cuarto Seguro" },
  { id: "VEHICULO_TECNICO", nombre: "Vehículo Técnico" },
  { id: "SITIO_CLIENTE", nombre: "Sitio Cliente" },
  { id: "PROVEEDOR", nombre: "Proveedor (Garantía)" },
];

const Inventory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const effectivePageSize = debouncedSearch ? 1000 : pageSize;
  const skip = (currentPage - 1) * effectivePageSize;

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useInventory(
    skip,
    effectivePageSize,
    debouncedSearch,
    refreshVersion,
    showDeleted,
  );
  const items = (data?.items || []) as InventoryItemRow[];
  const totalItems = data?.total || 0;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemRow | null>(null);
  const [isActivoModalOpen, setIsActivoModalOpen] = useState(false);
  const [creatingActivo, setCreatingActivo] = useState(false);
  const [clientes, setClientes] = useState<SimpleRow[]>([]);
  const [proyectos, setProyectos] = useState<SimpleRow[]>([]);
  const [proveedores, setProveedores] = useState<SimpleRow[]>([]);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  const { data: clientesCache } = useClientes();
  const { data: proyectosCache } = useProyectos();
  const { data: proveedoresCache } = useProveedores();

  const {
    register: registerActivo,
    handleSubmit: handleSubmitActivo,
    reset: resetActivo,
    watch: watchActivo,
  } = useForm<ActivoFormValues>({
    defaultValues: {
      estado_actual: "DISPONIBLE",
      condicion_fisica: "NUEVO",
    },
  });

  useEffect(() => {
    if (clientesCache) setClientes(clientesCache.items || []);
    if (proyectosCache) setProyectos(proyectosCache.items || []);
    if (proveedoresCache) setProveedores(proveedoresCache.items || []);
  }, [clientesCache, proyectosCache, proveedoresCache]);

  const closeActivoModal = () => {
    setIsActivoModalOpen(false);
    resetActivo();
  };

  const onSubmitActivo = async (data: ActivoFormValues) => {
    if (!data.id_item || !data.serial.trim()) {
      toast.error("Debe seleccionar un ítem y escribir el serial.");
      return;
    }
    setCreatingActivo(true);
    try {
      const payload = {
        id_item: parseInt(data.id_item),
        serial: data.serial.trim(),
        estado_actual: data.estado_actual,
        condicion_fisica: data.condicion_fisica,
        area_asignada: data.area_asignada || null,
        responsable_sitio: data.responsable_sitio || null,
        ubicacion_fisica: data.ubicacion_fisica || null,
        id_proyecto_actual: data.id_proyecto_actual
          ? parseInt(data.id_proyecto_actual)
          : null,
        id_cliente_actual: data.id_cliente_actual
          ? parseInt(data.id_cliente_actual)
          : null,
        id_proveedor_compra: data.id_proveedor_compra
          ? parseInt(data.id_proveedor_compra)
          : null,
        numero_factura_compra: data.numero_factura_compra || null,
        fecha_compra: data.fecha_compra || null,
        activo_fijo_securitas: data.activo_fijo_securitas || null,
        credenciales_tecnicas: data.credenciales_tecnicas || null,
        observaciones: data.observaciones || null,
      };
      await createActivo(payload);
      toast.success("Activo creado exitosamente.");
      closeActivoModal();
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
          : "Error al crear el activo.";
      toast.error(msg);
    } finally {
      setCreatingActivo(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormValues>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const s = searchParams.get("search") || searchParams.get("serial");
    if (s) {
      setSearchTerm(s);
    }
  }, [searchParams]);

  const fetchData = () => {
    setRefreshVersion((value) => value + 1);
  };

  const handleEdit = (item: InventoryItemRow) => {
    setEditingItem(item);
    setValue("nombre_equipo", item.nombre_equipo ?? "");
    setValue("categoria", item.categoria ?? "");
    setValue("sub_categoria", item.sub_categoria || "");
    setValue("marca", item.marca || "");
    setValue("referencia", item.referencia || "");
    setValue("codigo_item_interno", item.codigo_item_interno || "");
    setValue("costo_unitario", Number(item.costo_unitario) || 0);
    setValue("moneda", item.moneda || "COP");
    setValue("stock_minimo", item.stock_minimo ?? 5);
    setValue("compra_maxima", item.compra_maxima || 20);
    setValue("unidad_medida", item.unidad_medida ?? "UND");
    setIsModalOpen(true);
  };

  const openConfirm = (id: number, message?: string) => {
    setConfirmId(id);
    setConfirmMessage(
      message || "¿Está seguro de eliminar este item del catálogo?",
    );
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (confirmId == null) return;
    try {
      await deleteInventoryItem(confirmId);
      toast.success("Item eliminado correctamente.");
      setAlert(null);
      setCurrentPage(1);
      fetchData();
    } catch {
      toast.error("Error al eliminar el item.");
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      if (editingItem) {
        await updateInventoryItem(String(editingItem.id_item), data);
        toast.success("Ítem actualizado exitosamente.");
        setAlert({
          type: "success",
          message: "Ítem actualizado exitosamente.",
        });
      } else {
        const cantidadInicial =
          typeof data.cantidad_inicial === "number" &&
          !isNaN(data.cantidad_inicial)
            ? data.cantidad_inicial
            : 0;
        const payload = {
          ...data,
          cantidad_inicial: cantidadInicial,
        };
        await createInventoryItem(payload);
        toast.success("Ítem creado exitosamente.");
        setAlert({ type: "success", message: "Ítem creado exitosamente." });
      }
      closeModal();
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      toast.error("Error al guardar los datos.");
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
          : "Error al guardar los datos.";
      setAlert({ type: "error", message: msg });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = filterCategory
      ? item.categoria === filterCategory
      : true;
    const stockMin = item.stock_minimo ?? 0;
    const matchesStock =
      filterStockStatus === "BAJO"
        ? (item.stock_bulk?.cantidad_actual || 0) <= stockMin
        : filterStockStatus === "OK"
          ? (item.stock_bulk?.cantidad_actual || 0) > stockMin
          : true;

    return matchesCategory && matchesStock;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Inventario
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Administra tu catálogo de equipos, herramientas y consumibles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <ExportMenu module="inventory" />
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => downloadTemplate("inventario_laboratorio")}
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
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nuevo Registro
          </Button>
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => setIsActivoModalOpen(true)}
            title="Crear un activo serializado individual"
          >
            <Plus size={16} />
            Nuevo Activo
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
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
              size={16}
            />
            <NeoInput
              placeholder="Buscar por nombre, referencia o marca..."
              className="pl-10 pr-10 h-11 md:h-12 text-xs md:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-emerald-primary transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 md:gap-3">
            <div className="flex flex-wrap gap-2">
              <NeoSelect
                className="h-11 md:h-12 text-xs md:text-sm w-full sm:w-auto"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="MONITOREO">Monitoreo</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="INSTALACION">Instalación</option>
                <option value="SOLUCIONES">Soluciones</option>
                <option value="EPP">EPP</option>
                <option value="CONSUMIBLE">Consumible</option>
                <option value="HERRAMIENTA_LAB">Herramienta Lab</option>
              </NeoSelect>
              <NeoSelect
                className="h-11 md:h-12 text-xs md:text-sm w-full sm:w-auto"
                onChange={(e) => setFilterStockStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="OK">Existencias OK</option>
                <option value="BAJO">Existencias Bajas</option>
              </NeoSelect>
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`h-11 md:h-12 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                  showDeleted
                    ? "bg-danger/10 border-danger/40 text-danger/80"
                    : "border-bg3 text-content-muted hover:border-danger/30 hover:text-danger/80"
                }`}
              >
                <Trash2 size={14} className="inline mr-1.5" />
                {showDeleted ? "Con eliminados" : "Eliminados"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-bg4">
        <TableContainer>
          <>
            <THead>
              <TH>Equipo</TH>
              <TH className="hidden md:table-cell">Categoría</TH>
              <TH className="hidden sm:table-cell">Referencia</TH>
              <TH>Existencias</TH>
              <TH className="hidden lg:table-cell">Costo Total</TH>
              <TH>Estado</TH>
              <TH></TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TR>
                  <TD colSpan={7} className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-emerald-primary/30 border-t-emerald-primary rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-emerald-primary uppercase tracking-widest font-bold text-[10px]">
                      Cargando Inventario...
                    </span>
                  </TD>
                </TR>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TR
                    key={item.id_item}
                    className={
                      item.deleted_at
                        ? "opacity-50 [&_td]:line-through [&_td]:decoration-danger/30 [&_td]:decoration-1"
                        : ""
                    }
                  >
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg3 flex items-center justify-center text-emerald-primary border border-bg4 shadow-neo">
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-content-primary">
                            {item.nombre_equipo}
                          </div>
                          <div className="text-[9px] text-content-muted uppercase tracking-wider">
                            {item.marca || "Sin marca"}
                          </div>
                        </div>
                      </div>
                    </TD>
                    <TD className="hidden md:table-cell">
                      <Badge
                        label={item.categoria ?? "S.N."}
                        color="var(--chart-blue)"
                        bg="rgba(0, 163, 255, 0.05)"
                      />
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <div className="font-mono text-content-secondary text-[10px] bg-bg3/50 px-2 py-1 rounded border border-bg4">
                        {item.referencia || "N/A"}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-md text-content-primary">
                          {item.stock_bulk?.cantidad_actual || 0}
                        </span>
                        <span className="text-[9px] text-content-muted font-bold">
                          {item.unidad_medida}
                        </span>
                      </div>
                    </TD>
                    <TD className="hidden lg:table-cell">
                      <div className="text-content-primary font-mono font-bold">
                        $
                        {Number(
                          (Number(item.costo_unitario) || 0) *
                            (Number(item.stock_bulk?.cantidad_actual) || 0),
                        ).toLocaleString("es-CO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {item.moneda}
                      </div>
                    </TD>
                    <TD>
                      {(item.stock_bulk?.cantidad_actual || 0) <=
                      (item.stock_minimo ?? 0) ? (
                        <Badge
                          label="BAJO"
                          color="var(--gold)"
                          bg="rgba(255, 184, 0, 0.1)"
                        />
                      ) : (
                        <Badge
                          label="OK"
                          color="var(--emerald)"
                          bg="var(--emerald-muted)"
                        />
                      )}
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-bg4"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openConfirm(item.id_item)}
                          className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-danger transition-all shadow-neo border border-bg4"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))
              ) : (
                <TR>
                  <TD colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-content-muted">
                      <Package size={24} className="text-content-muted/60" />
                      <span className="font-semibold">
                        No se encontraron resultados
                      </span>
                      <span className="text-sm">
                        Prueba con otro término o limpia los filtros para ver
                        todo el inventario.
                      </span>
                    </div>
                  </TD>
                </TR>
              )}
            </TBody>
          </>
        </TableContainer>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Editar Item de Catálogo" : "Registrar Nuevo Item"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4 text-[11px] md:text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup
              label="Nombre del Equipo"
              error={errors.nombre_equipo?.message as string}
            >
              <NeoInput
                {...register("nombre_equipo", { required: "Obligatorio" })}
              />
            </FormGroup>
            <FormGroup label="Marca">
              <NeoInput {...register("marca")} />
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Categoría">
              <NeoSelect {...register("categoria")}>
                <option value="MONITOREO">Monitoreo</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="INSTALACION">Instalación</option>
                <option value="SOLUCIONES">Soluciones</option>
                <option value="EPP">EPP</option>
                <option value="CONSUMIBLE">Consumible</option>
                <option value="HERRAMIENTA_LAB">Herramienta Lab</option>
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Sub-Categoría">
              <NeoInput {...register("sub_categoria")} />
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Referencia">
              <NeoInput {...register("referencia")} />
            </FormGroup>
            <FormGroup label="Código Interno">
              <NeoInput {...register("codigo_item_interno")} />
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Costo Unitario">
              <NeoInput
                type="number"
                step="0.01"
                {...register("costo_unitario", { valueAsNumber: true })}
              />
            </FormGroup>
            <FormGroup label="Moneda">
              <NeoSelect {...register("moneda")}>
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </NeoSelect>
            </FormGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Unidad">
              <NeoSelect {...register("unidad_medida")}>
                <option value="UND">UND</option>
                <option value="MT">MT</option>
                <option value="GL">GL</option>
                <option value="KIT">KIT</option>
              </NeoSelect>
            </FormGroup>
            <div />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Existencias Mínimas">
              <NeoInput
                type="number"
                {...register("stock_minimo")}
                defaultValue={5}
              />
            </FormGroup>
            <FormGroup label="Compra Máxima">
              <NeoInput
                type="number"
                {...register("compra_maxima")}
                defaultValue={20}
              />
            </FormGroup>
          </div>
          {!editingItem && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Cantidad Inicial (Unidades que ingresan)">
                <NeoInput
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 10"
                  {...register("cantidad_inicial", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Debe ser 0 o más" },
                  })}
                  defaultValue={0}
                />
              </FormGroup>
              <FormGroup label="Ubicación">
                <NeoSelect {...register("ubicacion")}>
                  <option value="">Seleccione ubicación...</option>
                  {UBICACIONES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nombre}
                    </option>
                  ))}
                </NeoSelect>
              </FormGroup>
            </div>
          )}
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
        title="Carga Masiva de Datos (Excel/CSV)"
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
              id="excel-upload"
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
                    fetchData();
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
                  Soporta formatos reales de Securitas (.xlsx) y CSV
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="neo"
              className="flex-1 text-[10px] py-2"
              onClick={() => downloadTemplate("inventario_laboratorio")}
            >
              <Download size={14} className="mr-1" />
              Plantilla Laboratorio
            </Button>
            <Button
              variant="neo"
              className="flex-1 text-[10px] py-2"
              onClick={() => downloadTemplate("inventario_clientes")}
            >
              <Download size={14} className="mr-1" />
              Plantilla Clientes
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-primary">
              Instrucciones
            </h4>
            <ul className="text-[10px] text-content-secondary space-y-2 list-disc pl-4">
              <li>
                El sistema detecta automáticamente columnas como "Equipo",
                "Marca", "Referencia" y "Existencias".
              </li>
              <li>
                Si usa el formato de Corporativos, el sistema buscará la hoja
                "Inventario Consolidado".
              </li>
              <li>Se recomienda limpiar filas vacías antes de cargar.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-bg4">
        <div className="text-[10px] text-content-muted uppercase tracking-widest font-bold text-center sm:text-left">
          Mostrando {items.length} de {totalItems} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => p - 1);
              fetchData();
            }}
          >
            Anterior
          </Button>
          <Button
            variant="neo"
            className="h-8 text-[10px] px-3"
            disabled={totalItems <= currentPage * pageSize}
            onClick={() => {
              setCurrentPage((p) => p + 1);
              fetchData();
            }}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isActivoModalOpen}
        onClose={closeActivoModal}
        title="Nuevo Activo Serializado"
        footer={
          <>
            <Button variant="ghost" onClick={closeActivoModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitActivo(onSubmitActivo)}
              disabled={creatingActivo}
            >
              {creatingActivo ? "Creando..." : "Crear Activo"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleSubmitActivo(onSubmitActivo)}
          className="space-y-4 text-[11px] md:text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Ítem (Equipo)">
              <SearchableSelect
                options={items.map((i) => ({
                  value: String(i.id_item),
                  label: `${i.nombre_equipo} - ${i.referencia || ""}`.trim(),
                }))}
                value={watchActivo("id_item") || ""}
                onChange={(val) => resetActivo({ ...watchActivo(), id_item: val })}
                placeholder="Escriba para buscar ítem..."
              />
            </FormGroup>
            <FormGroup label="Serial *">
              <NeoInput
                {...registerActivo("serial")}
                placeholder="Ej: SN-2024-000123"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Estado Actual">
              <NeoSelect {...registerActivo("estado_actual")}>
                <option value="DISPONIBLE">Disponible</option>
                <option value="INSTALADO">Instalado</option>
                <option value="EN_GARANTIA">En Garantía</option>
                <option value="REPARADO">Reparado</option>
                <option value="LABORATORIO">Laboratorio</option>
                <option value="DESMONTE">Desmonte</option>
                <option value="BAJA">Baja</option>
                <option value="OBSOLETO">Obsoleto</option>
              </NeoSelect>
            </FormGroup>
            <FormGroup label="Condición Física">
              <NeoSelect {...registerActivo("condicion_fisica")}>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO_BUENO">Usado Bueno</option>
                <option value="PARA_REPARAR">Para Reparar</option>
                <option value="SULFATADO">Sulfatado</option>
                <option value="SIN_CONTRAPESOS">Sin Contrapesos</option>
                <option value="DAÑADO">Dañado</option>
              </NeoSelect>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Área Asignada">
              <NeoInput
                {...registerActivo("area_asignada")}
                placeholder="Ej: Bodega Principal"
              />
            </FormGroup>
            <FormGroup label="Responsable en Sitio">
              <NeoInput
                {...registerActivo("responsable_sitio")}
                placeholder="Ej: Juan Pérez"
              />
            </FormGroup>
          </div>

          <FormGroup label="Ubicación Física">
            <NeoInput
              {...registerActivo("ubicacion_fisica")}
              placeholder="Ej: Estante B2 / Sitio Cliente"
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Proyecto Actual">
              <SearchableSelect
                options={proyectos.map((p) => ({
                  value: String(p.id_proyecto),
                  label: p.nombre_proyecto || "",
                }))}
                value={watchActivo("id_proyecto_actual") || ""}
                onChange={(val) =>
                  resetActivo({ ...watchActivo(), id_proyecto_actual: val })
                }
                placeholder="Opcional..."
              />
            </FormGroup>
            <FormGroup label="Cliente Actual">
              <SearchableSelect
                options={clientes.map((c) => ({
                  value: String(c.id_cliente),
                  label: c.nombre || "",
                }))}
                value={watchActivo("id_cliente_actual") || ""}
                onChange={(val) =>
                  resetActivo({ ...watchActivo(), id_cliente_actual: val })
                }
                placeholder="Opcional..."
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Proveedor de Compra">
              <SearchableSelect
                options={proveedores.map((p) => ({
                  value: String(p.id_proveedor),
                  label: p.nombre || "",
                }))}
                value={watchActivo("id_proveedor_compra") || ""}
                onChange={(val) =>
                  resetActivo({ ...watchActivo(), id_proveedor_compra: val })
                }
                placeholder="Opcional..."
              />
            </FormGroup>
            <FormGroup label="Número Factura Compra">
              <NeoInput
                {...registerActivo("numero_factura_compra")}
                placeholder="Ej: FAC-1002"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha de Compra">
              <NeoInput type="date" {...registerActivo("fecha_compra")} />
            </FormGroup>
            <FormGroup label="Activo Fijo Securitas">
              <NeoInput
                {...registerActivo("activo_fijo_securitas")}
                placeholder="Ej: AF-00991"
              />
            </FormGroup>
          </div>

          <FormGroup label="Credenciales Técnicas (IP / Claves)">
            <NeoInput
              {...registerActivo("credenciales_tecnicas")}
              placeholder="Ej: 192.168.1.10 / admin:1234"
            />
          </FormGroup>

          <FormGroup label="Observaciones">
            <NeoInput
              {...registerActivo("observaciones")}
              placeholder="Notas adicionales..."
            />
          </FormGroup>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Inventory;
