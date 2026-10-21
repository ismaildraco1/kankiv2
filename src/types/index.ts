import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type CategoryId =
  | 'motivation'
  | 'philosophy'
  | 'success'
  | 'peace'
  | 'daily'
  | 'love'
  | 'heartbreak'
  | 'ramiz'
  | 'kurtlar-vadisi'
  | 'ataturk'
  | 'revolutionary'
  | 'cult-movies'
  | 'courage'
  | 'poverty'
  | 'poetry'
  | 'turkish-cinema';

export interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
  icon: IconName;
  /** Kart ve paylaşım görseli için iki duraklı gradient */
  gradient: readonly [string, string];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  categoryId: CategoryId;
}

export interface TimeOfDay {
  hour: number; // 0-23
  minute: number; // 0-59
}

export type NotificationMode = 'random' | 'fixed';

export interface NotificationSettings {
  enabled: boolean;
  mode: NotificationMode;
  /** "random" modunda kullanılan zaman penceresi */
  windowStart: TimeOfDay;
  windowEnd: TimeOfDay;
  /** "random" modunda günlük bildirim sayısı */
  perDay: number;
  /** "fixed" modunda kullanıcının seçtiği saatler */
  fixedTimes: TimeOfDay[];
  /** Aktif günler — JS Date.getDay() formatı (0 = Pazar … 6 = Cumartesi) */
  activeDays: number[];
}

export type ThemeId = 'oled' | 'vibrant' | 'warm';
export type ThemePreference = ThemeId | 'system' | 'light' | 'dark';

/** Planlanmış (veya teslim edilmiş) bir bildirimin kaydı */
export interface ScheduledEntry {
  notificationId: string;
  quoteId: string;
  fireAt: number; // epoch ms
}

/* ───────────────────────── Hikaye Paylaşım Stüdyosu Tipleri ───────────────────────── */

export type StoryBgPreset =
  | 'obsidian'
  | 'aurora'
  | 'dawn'
  | 'rose'
  | 'emerald'
  | 'slate'
  | 'champagne';

export type StoryPosition = 'center' | 'top' | 'bottom';
export type StoryTypography = 'serifItalic' | 'serifBold' | 'sansBold' | 'sansRegular';
export type StoryCardStyle = 'glass' | 'minimal' | 'solid';

export interface StoryCustomization {
  bgPreset: StoryBgPreset;
  customImageUri: string | null;
  overlayDarkness: number; // 0 to 0.8
  position: StoryPosition;
  typography: StoryTypography;
  cardStyle: StoryCardStyle;
  /** Serbest sürükleme ofsetleri (canvas koordinatlarında) */
  offsetX?: number;
  offsetY?: number;
  /** Yazı boyutu ince ayarı (-8 ile +12 arası pt) */
  fontSizeDelta?: number;
  /** Kart genişliği yüzdesi (75 ile 100 arası) */
  cardWidthPercent?: number;
  /** Metin okunabilirlik gölgesi */
  enableTextShadow?: boolean;
}

