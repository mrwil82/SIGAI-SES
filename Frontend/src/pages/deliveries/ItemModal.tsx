import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, X } from 'lucide-react';
import { Button } from '../../components/Fusion';
import { InventoryItem, TIPO_ACTA_CATEGORIAS, TODAS_CATEGORIAS, CAT_LABELS, CAT_COLORS } from './types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: { item: InventoryItem; cantidad: number }[]) => void;
  inventoryItems: InventoryItem[];
  tipoActa: string;
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  inventoryItems,
  tipoActa,
}) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selections, setSelections] = useState<Record<number, number>>({}); 
  const overlayRef = useRef<HTMLDivElement>(null);

  const allowedCats = TIPO_ACTA_CATEGORIAS[tipoActa] ?? Object.keys(CAT_LABELS);

  const filtered = inventoryItems.filter((it) => {
    const cat = it.categoria ?? 'OTROS';
    const matchesCat = catFilter === 'all' || cat === catFilter;
    const matchesType = !CAT_LABELS[cat] || allowedCats.includes(cat);
    const term = search.toLowerCase();
    const safeIncludes = (val: string | null | undefined) => val?.toLowerCase().includes(term) ?? false;
    const matchesSearch =
      !term ||
      safeIncludes(it.nombre_equipo) ||
      safeIncludes(it.marca) ||
      safeIncludes(it.referencia);
    return matchesCat && matchesType && matchesSearch;
  });

  const selectedCount = Object.keys(selections).length;

  const toggle = (id: number) => {
    setSelections((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const setQty = (id: number, val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    setSelections((prev) => ({ ...prev, [id]: n }));
  };

  const handleConfirm = () => {
    const result = Object.entries(selections).map(([idStr, cantidad]) => {
      const item = inventoryItems.find((i) => i.id_item === parseInt(idStr))!;
      return { item, cantidad };
    });
    onConfirm(result);
    setSelections({});
    setSearch('');
    setCatFilter('all');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelections({});
      setSearch('');
      setCatFilter('all');
    }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.18s ease' }}
    >
      <div
        className="flex flex-col w-full max-w-[820px] mx-4 max-h-[85vh] rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg1, rgb(var(--bg1)))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.06)',
          animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-bg4"
             style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.05), transparent)' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
               style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <Package size={16} className="text-emerald-primary" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-content">Seleccionar Items</p>
            <p className="text-[10px] uppercase tracking-widest text-content-muted mt-0.5">
              Filtrado · {tipoActa.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-content-muted hover:text-content hover:bg-bg2 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-bg4 flex-wrap"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          {['all', ...TODAS_CATEGORIAS].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all border ${
                catFilter === cat
                  ? 'bg-emerald-muted border-emerald-500/40 text-emerald-primary'
                  : 'bg-bg1/80 border-bg3 text-content-muted hover:border-emerald-500/20 hover:text-content'
              }`}
            >
              {cat === 'all' ? 'Todos' : CAT_LABELS[cat]}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-bg4/80 px-3 py-1.5"
               style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Search size={12} className="text-content-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent text-[11px] text-content outline-none w-40 placeholder:text-content-muted"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th className="w-10 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm"></th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">Descripción / Equipo</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">Categoría</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">Marca</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">Referencia</th>
                <th className="w-24 px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-content-muted border-b border-bg4 sticky top-0 bg-bg1/95 backdrop-blur-sm">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Package size={36} className="mb-3" />
                      <p className="text-xs font-bold uppercase tracking-widest">Sin items disponibles</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((it) => {
                  const isSelected = selections[it.id_item] !== undefined;
                  const cat = it.categoria ?? 'HERRAMIENTA';
                  return (
                    <tr
                      key={it.id_item}
                      onClick={() => toggle(it.id_item)}
                      className="cursor-pointer border-b border-bg3/50 transition-colors"
                      style={{ background: isSelected ? 'rgba(52,211,153,0.06)' : undefined }}
                    >
                      <td className="px-4 py-2.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-400 text-bg1'
                            : 'border border-bg3'
                        }`}>
                          {isSelected && <span className="text-[9px] font-bold">✓</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-content">{it.nombre_equipo}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${CAT_COLORS[cat] ?? ''}`}>
                          {CAT_LABELS[cat] ?? cat}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-content-muted">{it.marca}</td>
                      <td className="px-4 py-2.5 text-[11px] text-content-muted">{it.referencia}</td>
                      <td className="px-4 py-2.5" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <input
                          id={`qty-${it.id_item}`}
                          name={`qty-${it.id_item}`}
                          aria-label={`Cantidad para ${it.nombre_equipo}`}
                          type="number"
                          min={1}
                          value={selections[it.id_item] ?? 1}
                          disabled={!isSelected}
                          onChange={(e) => setQty(it.id_item, e.target.value)}
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

        <div className="flex items-center gap-3 px-6 py-3.5 border-t border-bg4"
             style={{ background: 'rgba(255,255,255,0.01)' }}>
          <span className="text-[10px] uppercase tracking-widest text-emerald-primary">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex gap-3">
            <Button variant="neo" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={selectedCount === 0}>
              Agregar al Acta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
