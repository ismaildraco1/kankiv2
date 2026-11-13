import { getCategory } from '@/data/categories';
import { getMood, MOODS, resolveQuotePool } from '@/data/moods';
import { getQuote, QUOTES } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import type { Quote } from '@/types';
import { dayKey } from '@/utils/format';
import { quoteOfTheDay } from '@/utils/schedule';

/**
 * Widget'ın her iki platformdaki kimliği.
 * - iOS: app.json → expo-widgets → widgets[].name ve createWidget(name)
 * - Android: app.json → react-native-android-widget → widgets[].name
 */
export const WIDGET_NAME = 'KankiQuote';
/** Ruh hali widget'ının kimliği (app.json'daki iki widget kaydıyla aynı olmalı) */
export const MOOD_WIDGET_NAME = 'KankiMood';

/** Widget'a gönderilen veri (iOS'ta JSON olarak paylaşılır, sade tutulmalı) */
export interface QuoteWidgetProps {
  text: string;
  author: string;
  category: string;
  /** Kategori gradient'inin ilk rengi (#RRGGBB) */
  accent: string;
  /** Widget'a dokununca açılacak derin bağlantı */
  url: string;
}

export interface WidgetTimelineItem {
  date: Date;
  props: QuoteWidgetProps;
}

export function toWidgetProps(quote: Quote): QuoteWidgetProps {
  const category = getCategory(quote.categoryId);
  return {
    text: quote.text,
    author: quote.author,
    category: category.title,
    accent: category.gradient[0],
    url: `kanki://quote/${quote.id}`,
  };
}

function fallbackQuote(date: Date): Quote | undefined {
  const { enabledCategories, homeMood } = useAppStore.getState();
  const pool = resolveQuotePool(enabledCategories, homeMood);
  return quoteOfTheDay(pool.length > 0 ? pool : QUOTES, date);
}

/**
 * Şu an widget'ta görünmesi gereken söz:
 * zamanı gelmiş son planlı söz; yoksa "Günün Sözü".
 * Bildirimler kapalı olsa bile plan üretildiği için widget aynı ritimde değişir.
 */
export function currentWidgetQuote(now = Date.now()): Quote | undefined {
  const { scheduleLog } = useAppStore.getState();
  for (let i = scheduleLog.length - 1; i >= 0; i--) {
    if (scheduleLog[i].fireAt <= now) {
      const quote = getQuote(scheduleLog[i].quoteId);
      if (quote) return quote;
      break;
    }
  }
  return fallbackQuote(new Date(now));
}

/**
 * iOS WidgetKit zaman çizelgesi: şimdiki söz + her planlı anın sözü.
 * Böylece uygulama kapalıyken bile kilit ekranı ve ana ekran widget'ı
 * bildirim saatleriyle birebir aynı anda yeni söze geçer.
 */
export function buildWidgetTimeline(now = Date.now()): WidgetTimelineItem[] {
  const items: WidgetTimelineItem[] = [];
  const current = currentWidgetQuote(now);
  if (current) items.push({ date: new Date(now), props: toWidgetProps(current) });

  const { scheduleLog } = useAppStore.getState();
  for (const entry of scheduleLog) {
    if (entry.fireAt <= now) continue;
    const quote = getQuote(entry.quoteId);
    if (quote) items.push({ date: new Date(entry.fireAt), props: toWidgetProps(quote) });
  }

  // Planlı söz yoksa (ör. hiç aktif gün seçilmemişse) her gece yarısı Günün Sözü'ne geç
  if (items.length <= 1) {
    const base = new Date(now);
    for (let d = 1; d <= 7; d++) {
      const midnight = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d);
      const quote = fallbackQuote(midnight);
      if (quote) items.push({ date: midnight, props: toWidgetProps(quote) });
    }
  }
  return items;
}

/** Ruh hali widget'ına gönderilen veri (iOS'ta JSON olarak paylaşılır, sade tutulmalı) */
export interface MoodWidgetProps {
  /** Bugünün ruh hali adı; kayıt yoksa boş */
  mood: string;
  /** Bugünün emojisi; kayıt yoksa nötr işaret */
  emoji: string;
  /** Son 7 gün (eskiden yeniye) emojileri; kayıt olmayan gün için "·" */
  week: string[];
  /** Son 7 günün kısa gün adları, week ile aynı sırada */
  days: string[];
  /** Haftanın özeti, ör. "Bu hafta en çok 🌿 Huzurlu" */
  summary: string;
  /** Dokununca günlük ekranını açan derin bağlantı */
  url: string;
}

export function buildMoodWidgetProps(now = new Date()): MoodWidgetProps {
  const { moodLog } = useAppStore.getState();
  const week: string[] = [];
  const days: string[] = [];
  const counts = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const entry = moodLog[dayKey(d)];
    const mood = getMood(entry?.mood);
    week.push(mood ? mood.emoji : '·');
    days.push(d.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 3));
    if (entry) counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }

  let topId: string | undefined;
  let topN = 0;
  counts.forEach((n, id) => {
    if (n > topN) {
      topN = n;
      topId = id;
    }
  });
  const top = MOODS.find((m) => m.id === topId);

  const today = getMood(moodLog[dayKey(now)]?.mood);
  return {
    mood: today?.label ?? '',
    emoji: today?.emoji ?? '🙂',
    week,
    days,
    summary: top ? `Bu hafta en çok ${top.emoji} ${top.label}` : 'Bugün nasıl hissediyorsun?',
    url: 'kanki://journal',
  };
}