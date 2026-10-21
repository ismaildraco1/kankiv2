import * as Notifications from 'expo-notifications';

import { getQuotesByCategories } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import type { ScheduledEntry } from '@/types';
import { buildFireDates, pickQuotes } from '@/utils/schedule';
import { syncWidgets } from '../widgets/syncWidgets';
import { getPermissionState, QUOTE_CHANNEL_ID } from './setup';

export const APP_NAME = 'Kanki';

/**
 * iOS aynı anda en fazla 64 bekleyen yerel bildirime izin verir.
 * Biraz pay bırakıp "kayan pencere" mantığıyla en fazla 60 tane planlıyoruz;
 * uygulama açıldıkça ve arka plan görevi çalıştıkça pencere yeniden doldurulur.
 */
export const MAX_PENDING = 60;
/** Bekleyen bildirim sayısı bunun altına düşünce yeniden planla */
export const REFILL_THRESHOLD = 20;

let inFlight: Promise<number> | null = null;

/**
 * Tüm söz bildirimlerini iptal edip mevcut ayarlara göre yeniden planlar.
 * Eşzamanlı çağrılar tek bir işleme birleştirilir.
 * @returns planlanan bildirim sayısı
 */
export function rescheduleAll(): Promise<number> {
  inFlight ??= doReschedule().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doReschedule(): Promise<number> {
  const store = useAppStore.getState();
  const { notification, enabledCategories, recentQuoteIds } = store;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn('[notifications] cancelAllScheduledNotificationsAsync error:', e);
  }

  const pool = getQuotesByCategories(enabledCategories);
  if (pool.length === 0) {
    store.replaceUpcoming([]);
    await syncWidgets().catch(console.warn);
    return 0;
  }

  const fireDates = buildFireDates(notification, MAX_PENDING);
  const quotes = pickQuotes(pool, fireDates.length, recentQuoteIds);
  const shouldSendAlert = notification.enabled && (await getPermissionState()) === 'granted';

  const entries: ScheduledEntry[] = [];
  for (let i = 0; i < fireDates.length; i++) {
    const quote = quotes[i];
    const fireTime = fireDates[i].getTime();

    let notificationId = `widget-only-${quote.id}-${fireTime}`;

    if (shouldSendAlert) {
      try {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: APP_NAME,
            body: `“${quote.text}”\n— ${quote.author}`,
            data: { quoteId: quote.id, url: `/quote/${quote.id}` },
            sound: 'default',
            // iOS 15+: Odak modlarında gereksiz yere araya girmesin
            interruptionLevel: 'passive',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireDates[i],
            channelId: QUOTE_CHANNEL_ID,
          },
        });
      } catch (e) {
        console.warn('[notifications] scheduleNotificationAsync error:', e);
      }
    }

    entries.push({ notificationId, quoteId: quote.id, fireAt: fireTime });
  }

  store.replaceUpcoming(entries);
  store.pushRecent(quotes.map((q) => q.id));

  // Widget'ları hemen yeni plana göre güncelle
  await syncWidgets().catch(console.warn);

  return shouldSendAlert ? entries.length : 0;
}

/**
 * Bekleyen plan azaldıysa pencereyi yeniden doldurur ve widget'ları senkronize eder.
 * Uygulama ön plana geldiğinde ve arka plan görevinde çağrılır.
 */
export async function refillIfNeeded(): Promise<boolean> {
  const store = useAppStore.getState();
  const { notification, scheduleLog } = store;

  let needRefill = false;

  if (notification.enabled) {
    try {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      needRefill = pending.length < REFILL_THRESHOLD;
    } catch {
      needRefill = true;
    }
  } else {
    const now = Date.now();
    const upcomingCount = scheduleLog.filter((e) => e.fireAt > now).length;
    needRefill = upcomingCount < REFILL_THRESHOLD;
  }

  if (needRefill) {
    await rescheduleAll();
    return true;
  }

  // Yeniden planlama gerekmediyse bile widget'ı son söze güncelle
  await syncWidgets().catch(console.warn);
  return false;
}

/** Ayarlar ekranındaki "Test bildirimi" butonu için */
export async function sendTestNotification(delaySeconds = 3) {
  try {
    const { enabledCategories } = useAppStore.getState();
    const pool = getQuotesByCategories(enabledCategories);
    const [quote] = pickQuotes(pool, 1, []);
    if (!quote) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${APP_NAME} · Test`,
        body: `“${quote.text}”\n— ${quote.author}`,
        data: { quoteId: quote.id, url: `/quote/${quote.id}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        channelId: QUOTE_CHANNEL_ID,
      },
    });
  } catch (e) {
    console.warn('[notifications] sendTestNotification error:', e);
  }
}
