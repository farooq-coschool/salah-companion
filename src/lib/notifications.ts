export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

/**
 * Fires a browser notification at `fireAt`. Only works while this tab/app is open —
 * there is no service worker push wired up, so background/closed-app delivery isn't possible
 * without a server component.
 */
export function scheduleNotification(title: string, body: string, fireAt: Date): () => void {
  const delay = fireAt.getTime() - Date.now();
  if (delay <= 0 || !notificationsSupported() || Notification.permission !== 'granted') {
    return () => {};
  }
  const timer = window.setTimeout(() => {
    try {
      new Notification(title, { body, icon: '/icon.svg' });
    } catch {
      // Notification construction can fail silently on some platforms (e.g. iOS Safari); ignore.
    }
  }, delay);
  return () => window.clearTimeout(timer);
}
