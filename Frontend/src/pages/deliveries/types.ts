export interface InventoryItem {
  id_item: number;
  nombre_equipo: string;
  marca: string;
  referencia: string;
  categoria?: string;
  tipo_acta_permitido?: string[];
}

export interface Activo {
  id_activo: number;
  id_item: number;
  serial: string;
}

export interface ActaItem {
  id_item: string;
  id_activo: string;
  descripcion: string;
  marca: string;
  referencia: string;
  serie: string;
  cantidad: number;
  observaciones: string;
}

export interface ActaDetalle {
  descripcion?: string;
  id_item?: number | string;
  cantidad?: number;
  notas_estado?: string;
  observaciones?: string;
}

export interface Acta {
  id_acta?: number;
  numero_acta?: string;
  tipo_acta?: string;
  estado_acta?: string;
  observaciones?: string;
  id_proyecto?: number | null;
  id_usuario_tecnico?: number | null;
  detalles?: ActaDetalle[];
}

export interface ActaFormData {
  id_usuario_tecnico: number;
  id_usuario_representante: number;
  nombre_tecnico: string;
  cedula: string;
  codigo: string;
  regional: string;
  fecha: string;
  observaciones_generales: string;
  nombre_representante: string;
  cedula_representante: string;
  codigo_representante: string;
  id_proyecto: string;
  id_cliente: string;
  tipo_acta: string;
}

export const TODAS_CATEGORIAS = [
  'HERRAMIENTA', 'EQUIPO', 'CONSUMIBLE', 'EPP',
  'MONITOREO', 'MANTENIMIENTO', 'INSTALACION', 'SOLUCIONES', 'HERRAMIENTA_LAB'
];

export const TIPO_ACTA_CATEGORIAS: Record<string, string[]> = {
  ENTREGA_HERRAMIENTA: TODAS_CATEGORIAS,
  ENTREGA_EPP:         TODAS_CATEGORIAS,
  DESPACHO_PROYECTO:   TODAS_CATEGORIAS,
  DEVOLUCION:          TODAS_CATEGORIAS,
  INGRESO_DESMONTE:    TODAS_CATEGORIAS,
};

export const CAT_LABELS: Record<string, string> = {
  HERRAMIENTA:     'Herramienta',
  EQUIPO:          'Equipo',
  CONSUMIBLE:      'Consumible',
  EPP:             'EPP',
  MONITOREO:       'Monitoreo',
  MANTENIMIENTO:   'Mantenimiento',
  INSTALACION:     'Instalación',
  SOLUCIONES:      'Soluciones',
  HERRAMIENTA_LAB: 'Herramienta Lab',
};

export const CAT_COLORS: Record<string, string> = {
  HERRAMIENTA:     'bg-chart-blue/10 text-chart-blue border border-chart-blue/20',
  EQUIPO:          'bg-emerald-primary/10 text-emerald-primary border border-emerald-primary/20',
  CONSUMIBLE:      'bg-chart-purple/10 text-chart-purple border border-chart-purple/20',
  EPP:             'bg-gold/10 text-gold border border-gold/20',
  MONITOREO:       'bg-cyan/10 text-cyan border border-cyan/20',
  MANTENIMIENTO:   'bg-chart-orange/10 text-chart-orange border border-chart-orange/20',
  INSTALACION:     'bg-chart-purple/10 text-chart-purple border border-chart-purple/20',
  SOLUCIONES:      'bg-chart-blue/10 text-chart-blue border border-chart-blue/20',
  HERRAMIENTA_LAB: 'bg-content-muted/10 text-content-muted border border-content-muted/20',
};

export const ACTA_TYPES = ['ENTREGA_HERRAMIENTA', 'ENTREGA_EPP', 'DESPACHO_PROYECTO', 'DEVOLUCION', 'INGRESO_DESMONTE'];
export const ACTA_ESTADOS = ['BORRADOR', 'ENVIADA', 'COMPLETADA'];
