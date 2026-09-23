import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display !== "denied";
    }
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  } catch {
    return false;
  }
}

export function showSystemNotification(opts: {
  id: number;
  title: string;
  body?: string;
}): void {
  try {
    if (isNativePlatform()) {
      LocalNotifications.schedule({
        notifications: [
          {
            id: opts.id,
            title: opts.title,
            body: opts.body || "",
            schedule: { at: new Date() },
            iconColor: "#10b981",
          },
        ],
      }).catch(() => {});
      return;
    }
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification(opts.title, {
        body: opts.body,
        tag: `alert-${opts.id}`,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    }
  } catch {
    // Si falla el sistema de notificaciones, se ignora (el toast in-app sigue).
  }
}
