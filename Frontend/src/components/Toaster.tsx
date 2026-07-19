import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext, useToastStore, type Toast, type ToastType } from '../lib/toast';

/* ── Configuracion ── */

const CONFIG: Record<ToastType, {
  icon: React.ElementType;
  iconBg: string; iconColor: string;
  titleColor: string; border: string; progressColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-primary/10', iconColor: 'text-emerald-primary',
    titleColor: 'text-emerald-primary', border: 'border-emerald-primary/20',
    progressColor: 'bg-emerald-primary',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-red-500/10', iconColor: 'text-red-500',
    titleColor: 'text-red-500', border: 'border-red-500/20',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-gold/10', iconColor: 'text-gold',
    titleColor: 'text-gold', border: 'border-gold/20',
    progressColor: 'bg-gold',
  },
  info: {
    icon: Info,
    iconBg: 'bg-chart-blue/10', iconColor: 'text-chart-blue',
    titleColor: 'text-chart-blue', border: 'border-chart-blue/20',
    progressColor: 'bg-chart-blue',
  },
};

/* Componente de toast individual */

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast, onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  useEffect(() => {
    if (toast.duration === 0) return;
    const t = setTimeout(() => handleDismiss(), toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  return (
    <div
      className={[
        'relative w-full overflow-hidden rounded-[14px]',
        'bg-bg2 border',
        cfg.border,
        'shadow-[4px_4px_16px_rgba(0,0,0,0.5)]',
        'transition-all duration-300',
        visible && !leaving
          ? 'translate-y-0 opacity-100 scale-100'
          : leaving
          ? 'translate-x-[110%] opacity-0'
          : '-translate-y-2 opacity-0 scale-95',
      ].join(' ')}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.iconBg}`}>
          <Icon size={14} className={cfg.iconColor} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[0.1em] leading-snug ${cfg.titleColor}`}>
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-[10px] text-content-secondary mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="w-5 h-5 rounded-[6px] flex items-center justify-center bg-white/5 text-content-muted hover:bg-white/10 hover:text-content-primary transition-colors flex-shrink-0 -mt-0.5"
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="h-[2px] w-full bg-white/5">
          <div
            className={`h-full ${cfg.progressColor} origin-left`}
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/* Portal del toster */
const ToasterPortal: React.FC<{ toasts: Toast[]; dismiss: (id: string) => void }> = ({
  toasts, dismiss,
}) => {
  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-[340px] pointer-events-none"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
};

/* Proveedor de toast */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useToastStore();
  return (
    <ToastContext.Provider value={store}>
      {children}
      <ToasterPortal toasts={store.toasts} dismiss={store.dismiss} />
    </ToastContext.Provider>
  );
};
