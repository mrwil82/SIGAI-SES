import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  searchTerms?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = search
    ? options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.searchTerms && o.searchTerms.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {selected && !isOpen ? (
        <div
          onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
          className="flex items-center gap-2 w-full h-10 px-3 rounded-xl border border-bg3 bg-bg2 text-xs text-content-primary cursor-pointer hover:border-emerald-500/30 transition-colors min-w-0"
        >
          <Check size={14} className="text-emerald-primary shrink-0" />
          <span className="flex-1 min-w-0 truncate">{selected.label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="p-0.5 rounded hover:bg-white/5 text-content-muted hover:text-danger transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full h-10 px-3 rounded-xl border border-bg3 bg-bg2 focus-within:border-emerald-500/30 transition-colors min-w-0">
          <Search size={14} className="text-content-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selected ? selected.label : placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 bg-transparent text-xs text-content-primary outline-none placeholder:text-content-muted truncate"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5 rounded hover:bg-white/5 text-content-muted transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-bg3 bg-bg2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-[10px] text-content-muted uppercase tracking-widest">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                  opt.value === value
                    ? 'bg-emerald-muted text-emerald-primary'
                    : 'text-content-primary hover:bg-bg2'
                }`}
              >
                {opt.value === value && <Check size={14} className="text-emerald-primary shrink-0" />}
                <span className={opt.value === value ? 'flex-1' : 'flex-1 ml-6'}>{opt.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
