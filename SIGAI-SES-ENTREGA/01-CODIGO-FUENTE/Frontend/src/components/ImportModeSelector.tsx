import React from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

export type ImportStockMode = "sumar" | "reemplazar";

interface Props {
  value: ImportStockMode;
  onChange: (mode: ImportStockMode) => void;
}

export default function ImportModeSelector({ value, onChange }: Props) {
  const options: {
    mode: ImportStockMode;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      mode: "sumar",
      title: "Sumar al stock existente (Recomendado)",
      desc: "Los items que ya existen no se pisan: el stock del Excel se suma al actual. Ideal cuando varias ciudades cargan el mismo inventario.",
      icon: <PlusCircle size={14} className="text-emerald-primary" />,
    },
    {
      mode: "reemplazar",
      title: "Reemplazar stock existente",
      desc: "El stock de los items existentes queda igual al valor del Excel (puede bajar). Usar solo si el archivo es la fuente única y confiable.",
      icon: <RefreshCw size={14} className="text-gold" />,
    },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-primary">
        Modo de actualización del stock
      </h4>
      <div className="space-y-2">
        {options.map((opt) => {
          const active = value === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => onChange(opt.mode)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                active
                  ? "border-emerald-primary bg-emerald-primary/10"
                  : "border-bg4 bg-bg3/50 hover:border-bg4/80"
              }`}
            >
              <div className="flex items-center gap-2">
                {opt.icon}
                <span className="text-[11px] font-bold text-content-secondary">
                  {opt.title}
                </span>
              </div>
              <p className="text-[10px] text-content-muted mt-1 leading-relaxed">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
