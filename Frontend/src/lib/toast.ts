import { createContext, useContext, useState, useCallback, useMemo } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id" | "createdAt">) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastStore() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((partial: Omit<Toast, "id" | "createdAt">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => {
      const next = [...prev, { ...partial, id, createdAt: Date.now() }];
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, add, dismiss };
}

export type ToastOpts = { description?: string; duration?: number };

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");

  const add = ctx.add;
  const dismiss = ctx.dismiss;

  const fire = useCallback(
    (type: ToastType, title: string, opts?: ToastOpts) =>
      add({
        type,
        title,
        description: opts?.description,
        duration: opts?.duration ?? 4000,
      }),
    [add],
  );

  const success = useCallback(
    (title: string, opts?: ToastOpts) => fire("success", title, opts),
    [fire],
  );
  const error = useCallback(
    (title: string, opts?: ToastOpts) => fire("error", title, opts),
    [fire],
  );
  const warning = useCallback(
    (title: string, opts?: ToastOpts) => fire("warning", title, opts),
    [fire],
  );
  const info = useCallback(
    (title: string, opts?: ToastOpts) => fire("info", title, opts),
    [fire],
  );

  return useMemo(
    () => ({ success, error, warning, info, dismiss }),
    [success, error, warning, info, dismiss],
  );
}
