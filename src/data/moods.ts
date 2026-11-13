import { CATEGORIES } from '@/data/categories';
import { getQuotesByCategories } from '@/data/quotes';
import type { CategoryId, Quote } from '@/types';

export type MoodId = 'energetic' | 'calm' | 'loving' | 'heartbroken' | 'determined' | 'thoughtful';

export interface Mood {
  id: MoodId;
  emoji: string;
  label: string;
  /** Onay penceresinde ve ana sayfada gösterilen söz seti adı */
  setName: string;
  /** Bu ruh haline eşlenen kategoriler (ilk eleman asıl kategori) */
  categories: readonly CategoryId[];
}

export const MOODS: readonly Mood[] = [
  { id: 'energetic', emoji: '⚡', label: 'Enerjik', setName: 'Motivasyon', categories: ['motivation', 'success'] },
  { id: 'calm', emoji: '🌿', label: 'Huzurlu', setName: 'Huzur', categories: ['peace', 'philosophy'] },
  { id: 'loving', emoji: '💗', label: 'Aşık', setName: 'Sevgi', categories: ['love', 'poetry'] },
  { id: 'heartbroken', emoji: '🥀', label: 'Kırgın', setName: 'Acılı Sözler', categories: ['heartbreak', 'poetry'] },
  { id: 'determined', emoji: '🔥', label: 'Kararlı', setName: 'Cesaret', categories: ['courage', 'success'] },
  { id: 'thoughtful', emoji: '🤔', label: 'Düşünceli', setName: 'Felsefe', categories: ['philosophy', 'latin'] },
];

export function getMood(id: MoodId | null | undefined): Mood | undefined {
  return id ? MOODS.find((m) => m.id === id) : undefined;
}

/** Günlükteki tek bir gün kaydı. Anahtar yerel tarihtir (YYYY-MM-DD). */
export interface MoodEntry {
  mood: MoodId;
  note: string;
  /** Son güncelleme zamanı (epoch ms) */
  at: number;
}

export type MoodLog = Record<string, MoodEntry>;

/**
 * Ana sayfa, bildirim ve widget'ların ortak söz havuzu:
 * ruh hali seti atanmışsa o; yoksa seçili kategoriler.
 */
export function resolveQuotePool(enabled: readonly CategoryId[], homeMood: MoodId | null): Quote[] {
  const moodPool = homeMood ? getQuotesForMood(homeMood) : [];
  return moodPool.length > 0 ? moodPool : getQuotesByCategories(enabled);
}

/**
 * Ruh haline uygun söz havuzu. Eşlenen kategorilerin hiçbirinde söz yoksa
 * (veri değişirse) boş döner; çağıran taraf genel havuza düşmelidir.
 */
export function getQuotesForMood(id: MoodId): Quote[] {
  const mood = getMood(id);
  if (!mood) return [];
  const known = new Set(CATEGORIES.map((c) => c.id));
  return getQuotesByCategories(mood.categories.filter((c) => known.has(c)));
}
