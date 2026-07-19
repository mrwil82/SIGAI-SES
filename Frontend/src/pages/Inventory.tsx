import React, { useEffect, useState } from "react";
import { utils, writeFile } from "xlsx";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  importInventory,
} from "../services/inventory";
import { ExportMenu } from "../components/ExportMenu";
import { useInventory } from "../hooks/useInventory";

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
  const items = data?.items || [];
  const totalItems = data?.total || 0;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); } }, [alert]);

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
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

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setValue("nombre_equipo", item.nombre_equipo);
    setValue("categoria", item.categoria);
    setValue("sub_categoria", item.sub_categoria || "");
    setValue("marca", item.marca || "");
    setValue("referencia", item.referencia || "");
    setValue("codigo_item_interno", item.codigo_item_interno || "");
    setValue("costo_unitario", item.costo_unitario);
    setValue("moneda", item.moneda || "COP");
    setValue("stock_minimo", item.stock_minimo);
    setValue("compra_maxima", item.compra_maxima || 20);
    setValue("unidad_medida", item.unidad_medida);
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
    } catch (error: any) {
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

  const onSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id_item, data);
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
    } catch (error: any) {
      toast.error("Error al guardar los datos.");
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).filter(Boolean).join('; ') : (detail || "Error al guardar los datos.");
      setAlert({ type: "error", message: msg });
    }
  };

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = filterCategory
      ? item.categoria === filterCategory
      : true;
    const matchesStock =
      filterStockStatus === "BAJO"
        ? (item.stock_bulk?.cantidad_actual || 0) <= item.stock_minimo
        : filterStockStatus === "OK"
          ? (item.stock_bulk?.cantidad_actual || 0) > item.stock_minimo
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            variant="neo"
            className="flex items-center gap-2"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Download size={16} className="rotate-180" />
            Carga Excel / CSV
          </Button>
          <ExportMenu module="inventory" />
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nuevo Registro
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
              onChange={(e: any) => setSearchTerm(e.target.value)}
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
                onChange={(e: any) => setFilterCategory(e.target.value)}
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
                onChange={(e: any) => setFilterStockStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="OK">Existencias OK</option>
                <option value="BAJO">Existencias Bajas</option>
              </NeoSelect>
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`h-11 md:h-12 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                  showDeleted
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : 'border-white/10 text-content-muted hover:border-red-500/30 hover:text-red-400'
                }`}
              >
                <Trash2 size={14} className="inline mr-1.5" />
                {showDeleted ? 'Con eliminados' : 'Eliminados'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-white/5">
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
                filteredItems.map((item: any) => (
                  <TR key={item.id_item} className={item.deleted_at ? "opacity-50 [&_td]:line-through [&_td]:decoration-red-500/30 [&_td]:decoration-1" : ""}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg3 flex items-center justify-center text-emerald-primary border border-white/5 shadow-neo">
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
                        label={item.categoria}
                        color="var(--chart-blue)"
                        bg="rgba(0, 163, 255, 0.05)"
                      />
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <div className="font-mono text-content-secondary text-[10px] bg-bg3/50 px-2 py-1 rounded border border-white/5">
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
                        ${Number((Number(item.costo_unitario) || 0) * (Number(item.stock_bulk?.cantidad_actual) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        {item.moneda}
                      </div>
                    </TD>
                    <TD>
                      {(item.stock_bulk?.cantidad_actual || 0) <=
                      item.stock_minimo ? (
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
                          className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-emerald-primary transition-all shadow-neo border border-white/5"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openConfirm(item.id_item)}
                          className="p-2 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-all shadow-neo border border-white/5"
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
          <div className="p-4 border-2 border-dashed border-white/10 rounded-xl bg-bg3/50 text-center">
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={async (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImporting(true);
                  try {
                    const res = await importInventory(file);
                    setAlert({ type: "success", message: res.mensaje });
                    setCurrentPage(1);
                    fetchData();
                    setIsImportModalOpen(false);
                  } catch (err: any) {
                    setAlert({
                      type: "error",
                      message:
                        err.response?.data?.detail ||
                        "Error al importar archivo",
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

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg2 p-4 rounded-xl border border-white/5">
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

    </DashboardLayout>
  );
};

export default Inventory;
