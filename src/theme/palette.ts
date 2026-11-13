import type { ThemeId } from '@/types';

export interface Palette {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  scheme: 'light' | 'dark';
  /** Ekran arka planı için çok katmanlı lüks gradient */
  background: readonly [string, string, string];
  /** Arka planda süzülen aurora ışıkları */
  orbs: readonly [string, string, string, string];
  text: string;
  textMuted: string;
  textFaint: string;
  /** Kart yüzeyi */
  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassGleam: string;
  /** Ana ve vurgu renkleri */
  accent: string;
  accentSoft: string;
  accentGradient: readonly [string, string];
  gold: string;
  goldSoft: string;
  danger: string;
  success: string;
  blurTint: 'light' | 'dark';
  statusBar: 'light' | 'dark';
  /** Ayarlar ekranında önizleme rozetleri için renkler: [arka plan, vurgu, kart] */
  previewColors: readonly [string, string, string];
}

/**
 * 1. "Gece Yarısı" teması:
 * Tamamen siyah zemin (#000000), minimalist ve göz yormayan derin yapı.
 * Piksel kapatıcı saf siyah, gümüş/platin vurgular ve maksimum pil tasarrufu.
 */
export const oledPalette: Palette = {
  id: 'oled',
  name: 'Gece Yarısı',
  subtitle: 'Saf Siyah & Buz Mavisi',
  description: 'Saf siyah zemin, serin turkuaz vurgular ve maksimum pil tasarrufu.',
  scheme: 'dark',
  background: ['#000000', '#030303', '#000000'],
  orbs: [
    'rgba(40, 40, 48, 0.22)',
    'rgba(28, 28, 36, 0.16)',
    'rgba(20, 20, 28, 0.18)',
    'rgba(32, 32, 42, 0.14)',
  ],
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  textFaint: '#52525B',
  glass: 'rgba(16, 16, 20, 0.78)',
  glassStrong: 'rgba(24, 24, 28, 0.94)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassGleam: 'rgba(255, 255, 255, 0.20)',
  accent: '#5EEAD4',
  accentSoft: 'rgba(94, 234, 212, 0.14)',
  accentGradient: ['#5EEAD4', '#38BDF8'],
  gold: '#F59E0B',
  goldSoft: 'rgba(245, 158, 11, 0.16)',
  danger: '#F43F5E',
  success: '#10B981',
  blurTint: 'dark',
  statusBar: 'light',
  previewColors: ['#000000', '#5EEAD4', '#18181C'],
};

/**
 * 2. "Kızıl Akşam" teması:
 * Dinamik gradient geçişleri, mor/indigo neon detaylar ve canlı vurgular.
 */
export const vibrantPalette: Palette = {
  id: 'vibrant',
  name: 'Kızıl Akşam',
  subtitle: 'Közden Mercana Işıltı',
  description: 'Erik moru zemin üzerinde mercan ve amber ışıltılar, sıcak ve canlı bir gece.',
  scheme: 'dark',
  background: ['#150812', '#241024', '#0E0B1C'],
  orbs: [
    'rgba(255, 138, 107, 0.42)', // Coral Ember
    'rgba(232, 84, 140, 0.34)', // Dusk Magenta
    'rgba(45, 180, 170, 0.22)', // Lagoon Teal
    'rgba(251, 191, 36, 0.22)', // Amber Glow
  ],
  text: '#FFFFFF',
  textMuted: 'rgba(255, 240, 236, 0.74)',
  textFaint: 'rgba(255, 240, 236, 0.44)',
  glass: 'rgba(44, 20, 38, 0.66)',
  glassStrong: 'rgba(58, 28, 48, 0.88)',
  glassBorder: 'rgba(255, 170, 140, 0.20)',
  glassGleam: 'rgba(255, 255, 255, 0.30)',
  accent: '#FF8A6B',
  accentSoft: 'rgba(255, 138, 107, 0.18)',
  accentGradient: ['#FF8A6B', '#E8548C'],
  gold: '#F6C56F',
  goldSoft: 'rgba(246, 197, 111, 0.20)',
  danger: '#FB7185',
  success: '#34D399',
  blurTint: 'dark',
  statusBar: 'light',
  previewColors: ['#1A0A16', '#FF8A6B', '#3A1C30'],
};

/**
 * 3. "Adaçayı" teması:
 * Gözü yormayan pastel/kahve/krem tonları, kağıt/kitap hissi veren klasik zarafet.
 */
export const warmPalette: Palette = {
  id: 'warm',
  name: 'Adaçayı',
  subtitle: 'Kâğıt Dokusu & Yeşil Mürekkep',
  description: 'Gözü yormayan açık adaçayı zemin ve koyu yeşil mürekkep, sakin bir okuma hissi.',
  scheme: 'light',
  background: ['#F5F7F1', '#ECF0E4', '#E2E8D8'],
  orbs: [
    'rgba(170, 200, 160, 0.42)',
    'rgba(205, 220, 170, 0.35)',
    'rgba(150, 185, 170, 0.30)',
    'rgba(215, 205, 160, 0.28)',
  ],
  text: '#18241C',
  textMuted: 'rgba(24, 36, 28, 0.70)',
  textFaint: 'rgba(24, 36, 28, 0.42)',
  glass: 'rgba(252, 254, 249, 0.82)',
  glassStrong: 'rgba(253, 255, 251, 0.94)',
  glassBorder: 'rgba(110, 140, 115, 0.24)',
  glassGleam: 'rgba(255, 255, 255, 0.95)',
  accent: '#2F6B4A',
  accentSoft: 'rgba(47, 107, 74, 0.12)',
  accentGradient: ['#2F6B4A', '#5E9A76'],
  gold: '#A8742B',
  goldSoft: 'rgba(168, 116, 43, 0.16)',
  danger: '#DC2626',
  success: '#15803D',
  blurTint: 'light',
  statusBar: 'dark',
  previewColors: ['#F5F7F1', '#2F6B4A', '#FCFEF9'],
};

export const THEMES: Record<ThemeId, Palette> = {
  oled: oledPalette,
  vibrant: vibrantPalette,
  warm: warmPalette,
};

export const THEME_LIST: readonly Palette[] = [
  oledPalette,
  vibrantPalette,
  warmPalette,
];

/** Geriye dönük uyumluluk takma adları */
export const darkPalette = vibrantPalette;
export const lightPalette = warmPalette;
