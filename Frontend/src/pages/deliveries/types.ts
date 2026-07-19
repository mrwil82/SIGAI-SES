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
  HERRAMIENTA:     'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  EQUIPO:          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  CONSUMIBLE:      'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  EPP:             'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  MONITOREO:       'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  MANTENIMIENTO:   'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  INSTALACION:     'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  SOLUCIONES:      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  HERRAMIENTA_LAB: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

export const ACTA_TYPES = ['ENTREGA_HERRAMIENTA', 'ENTREGA_EPP', 'DESPACHO_PROYECTO', 'DEVOLUCION', 'INGRESO_DESMONTE'];
export const ACTA_ESTADOS = ['BORRADOR', 'ENVIADA', 'COMPLETADA'];
