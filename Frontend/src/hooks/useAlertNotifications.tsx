import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "../lib/toast";
import { getActiveAlerts } from "../services/alerts";
import {
  requestNotificationPermission,
  showSystemNotification,
} from "../lib/notifications";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api/v1`;

const SEEN_KEY = "sigai-alert-seen";
const POLL_INTERVAL = 30000;

interface ActiveAlert {
  id: number;
  titulo?: string;
  descripcion?: string | null;
  prioridad?: string;
  tipo?: string;
}

interface AlertEventData {
  type?: string;
  alert?: ActiveAlert;
}

function loadSeen(): Set<number> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<number>) {
  sessionStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
}

function isEventSourceSupported() {
  return typeof window !== "undefined" && "EventSource" in window;
}

export const AlertNotifier: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();
  const seenRef = useRef<Set<number>>(loadSeen());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user) return;

    requestNotificationPermission();

    const notify = (alerta: ActiveAlert) => {
      if (!alerta?.id || seenRef.current.has(alerta.id)) return;
      seenRef.current.add(alerta.id);
      saveSeen(seenRef.current);

      const title = alerta.titulo || "Nueva alerta";
      const description = alerta.descripcion || "";
      const prioridad = alerta.prioridad || "media";

      if (prioridad === "critica") {
        toast.error(title, { description, duration: 6000 });
      } else {
        toast.warning(title, { description, duration: 6000 });
      }

      showSystemNotification({ id: alerta.id, title, body: description });

      queryClient.invalidateQueries({ queryKey: ["alertsSummary"] });
    };

    const token = sessionStorage.getItem("token");
    if (!token) return;

    // Conexion SSE (aviso instantaneo cuando esta disponible).
    if (isEventSourceSupported()) {
      const url = `${API_BASE_URL}/alerts/stream?token=${encodeURIComponent(token)}`;
      let retry = 0;

      const connect = () => {
        if (esRef.current) {
          esRef.current.close();
          esRef.current = null;
        }
        const es = new EventSource(url);
        esRef.current = es;

        es.onopen = () => {
          retry = 0;
        };

        es.addEventListener("alert", (e) => {
          let data: AlertEventData;
          try {
            data = JSON.parse((e as MessageEvent).data);
          } catch {
            return;
          }
          if (data.type !== "alert.created") return;
          if (data.alert) notify(data.alert);
        });

        es.onerror = () => {
          es.close();
          esRef.current = null;
          retry += 1;
          const delay = Math.min(1000 * 2 ** Math.min(retry, 5), 30000);
          setTimeout(connect, delay);
        };
      };

      connect();
    }

    // Fallback por polling: garantiza que las notificaciones funcionen en
    // cualquier despliegue (multiproceso, servidores sin SSE, etc.).
    const poll = async () => {
      try {
        const alerts = await getActiveAlerts();
        alerts.forEach(notify);
      } catch {
        // Error de red/autenticacion: se reintenta en el siguiente ciclo.
      }
    };

    poll();
    const pollId = window.setInterval(poll, POLL_INTERVAL);

    return () => {
      window.clearInterval(pollId);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [user, toast, queryClient]);

  return null;
};
