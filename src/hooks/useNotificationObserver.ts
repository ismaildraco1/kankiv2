import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Bildirime dokunulduğunda ilgili sözün ekranını açar.
 * Hem uygulama kapalıyken (soğuk başlatma) hem de arka plandayken çalışır.
 */
export function useNotificationObserver(ready: boolean) {
  useEffect(() => {
    if (!ready) return;

    const redirect = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    };

    try {
      // Uygulama bildirimle açıldıysa
      const last = Notifications.getLastNotificationResponse();
      if (last?.notification) {
        redirect(last.notification);
        Notifications.clearLastNotificationResponse();
      }

      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        redirect(response.notification);
        Notifications.clearLastNotificationResponse();
      });
      return () => sub.remove();
    } catch (e) {
      console.warn('[notifications] useNotificationObserver warning:', e);
    }
  }, [ready]);
}
