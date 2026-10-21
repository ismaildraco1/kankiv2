import type { NotificationSettings, Quote, TimeOfDay } from '@/types';

export const toMinutes = (t: TimeOfDay) => t.hour * 60 + t.minute;

export const formatTime = (t: TimeOfDay) =>
  `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/** Fisher–Yates karıştırma (kopya döner) */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Bildirim zamanlarını üretir.
 *
 * "random" modu: pencere `perDay` eşit dilime bölünür ve her dilimin
 * %15–%85'lik bölümünde rastgele bir an seçilir. Böylece zamanlar hem
 * tahmin edilemez olur hem de iki bildirim art arda gelmez.
 *
 * "fixed" modu: kullanıcının seçtiği saatler birebir kullanılır.
 */
export function buildFireDates(
  settings: NotificationSettings,
  maxCount: number,
  now: Date = new Date(),
  maxDays = 14,
): Date[] {
  const perDay = settings.mode === 'random' ? settings.perDay : settings.fixedTimes.length;
  if (perDay <= 0 || settings.activeDays.length === 0) return [];

  const dates: Date[] = [];
  const minLead = now.getTime() + 60_000; // en az 1 dk sonrası

  for (let d = 0; d <= maxDays && dates.length < maxCount; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    if (!settings.activeDays.includes(day.getDay())) continue;

    let minutesOfDay: number[];
    if (settings.mode === 'random') {
      const start = toMinutes(settings.windowStart);
      const end = toMinutes(settings.windowEnd);
      const span = end - start;
      if (span <= 0) return [];
      const slot = span / perDay;
      minutesOfDay = Array.from({ length: perDay }, (_, i) =>
        start + i * slot + randomBetween(slot * 0.15, slot * 0.85),
      );
    } else {
      minutesOfDay = settings.fixedTimes.map(toMinutes).sort((a, b) => a - b);
    }

    for (const m of minutesOfDay) {
      const fire = new Date(day);
      fire.setHours(0, Math.floor(m), 0, 0);
      if (fire.getTime() > minLead) dates.push(fire);
      if (dates.length >= maxCount) break;
    }
  }
  return dates;
}

/**
 * Havuzdan `count` adet söz seçer. Son gösterilenler mümkün olduğunca
 * dışarıda bırakılır; havuz küçükse karıştırılmış tur tekrar başlar.
 */
export function pickQuotes(pool: readonly Quote[], count: number, recentIds: readonly string[]): Quote[] {
  if (pool.length === 0) return [];
  const recent = new Set(recentIds);
  const fresh = shuffle(pool.filter((q) => !recent.has(q.id)));
  const stale = shuffle(pool.filter((q) => recent.has(q.id)));
  const ordered = [...fresh, ...stale];

  const result: Quote[] = [];
  while (result.length < count) {
    const round = result.length === 0 ? ordered : shuffle(pool);
    for (const q of round) {
      // ardışık iki bildirimde aynı söz olmasın
      if (result.at(-1)?.id === q.id) continue;
      result.push(q);
      if (result.length >= count) break;
    }
  }
  return result;
}

/** Tarihe göre deterministik "Günün Sözü" */
export function quoteOfTheDay(pool: readonly Quote[], date = new Date()): Quote | undefined {
  if (pool.length === 0) return undefined;
  const key = date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
  // basit tamsayı hash
  let h = key;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return pool[Math.abs(h) % pool.length];
}
