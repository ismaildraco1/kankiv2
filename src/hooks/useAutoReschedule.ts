import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { refillIfNeeded, rescheduleAll } from '@/services/notifications/scheduler';
import { useAppStore } from '@/store/useAppStore';

/**
 * - Bildirim ayarları veya aktif setler değişince (debounce ile) yeniden planlar
 * - Uygulama ön plana her geldiğinde pencereyi gerekirse doldurur
 */
export function useAutoReschedule(ready: boolean) {
  const notification = useAppStore((s) => s.notification);
  const categories = useAppStore((s) => s.enabledCategories);
  const first = useRef(true);

  useEffect(() => {
    if (!ready) return;
    // İlk açılışta tüm planı silmek yerine sadece eksikse doldur
    if (first.current) {
      first.current = false;
      refillIfNeeded().catch(console.warn);
      return;
    }
    const t = setTimeout(() => rescheduleAll().catch(console.warn), 600);
    return () => clearTimeout(t);
  }, [ready, notification, categories]);

  useEffect(() => {
    if (!ready) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refillIfNeeded().catch(console.warn);
    });
    return () => sub.remove();
  }, [ready]);
}
