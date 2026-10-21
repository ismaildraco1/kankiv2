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
 * 1. "Daha Koyu (OLED Dark) Tema":
 * Tamamen siyah zemin (#000000), minimalist ve göz yormayan derin yapı.
 * Piksel kapatıcı saf siyah, gümüş/platin vurgular ve maksimum pil tasarrufu.
 */
export const oledPalette: Palette = {
  id: 'oled',
  name: 'OLED Dark',
  subtitle: 'Sonsuz Derinlik & OLED Siyah',
  description: 'Tamamen siyah zemin (#000000), minimalist ve göz yormayan derin yapı.',
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
  accent: '#E4E4E7',
  accentSoft: 'rgba(255, 255, 255, 0.10)',
  accentGradient: ['#FFFFFF', '#71717A'],
  gold: '#F59E0B',
  goldSoft: 'rgba(245, 158, 11, 0.16)',
  danger: '#F43F5E',
  success: '#10B981',
  blurTint: 'dark',
  statusBar: 'light',
  previewColors: ['#000000', '#E4E4E7', '#18181C'],
};

/**
 * 2. "Renkli / Vibrant Tema":
 * Dinamik gradient geçişleri, mor/indigo neon detaylar ve canlı vurgular.
 */
export const vibrantPalette: Palette = {
  id: 'vibrant',
  name: 'Renkli',
  subtitle: 'Kozmik Aurora & Neon Vurgular',
  description: 'Dinamik gradient geçişleri, mor/indigo neon detaylar ve canlı vurgular.',
  scheme: 'dark',
  background: ['#07051A', '#120A2E', '#0A0E24'],
  orbs: [
    'rgba(139, 92, 246, 0.48)', // Astral Violet
    'rgba(244, 63, 94, 0.36)',  // Neon Rose
    'rgba(6, 182, 212, 0.30)',  // Cyan Nebula
    'rgba(245, 158, 11, 0.24)', // Sunset Amber
  ],
  text: '#FFFFFF',
  textMuted: 'rgba(243, 240, 255, 0.74)',
  textFaint: 'rgba(243, 240, 255, 0.44)',
  glass: 'rgba(24, 18, 46, 0.68)',
  glassStrong: 'rgba(34, 26, 62, 0.88)',
  glassBorder: 'rgba(192, 132, 252, 0.20)',
  glassGleam: 'rgba(255, 255, 255, 0.30)',
  accent: '#A78BFA',
  accentSoft: 'rgba(167, 139, 250, 0.20)',
  accentGradient: ['#8B5CF6', '#EC4899'],
  gold: '#F6C56F',
  goldSoft: 'rgba(246, 197, 111, 0.20)',
  danger: '#FB7185',
  success: '#34D399',
  blurTint: 'dark',
  statusBar: 'light',
  previewColors: ['#0E0A28', '#A78BFA', '#241A42'],
};

/**
 * 3. "Yumuşak / Warm Minimal Tema":
 * Gözü yormayan pastel/kahve/krem tonları, kağıt/kitap hissi veren klasik zarafet.
 */
export const warmPalette: Palette = {
  id: 'warm',
  name: 'Yumuşak (Warm Minimal)',
  subtitle: 'Kitap Sayfası & Sıcak Parşömen',
  description: 'Gözü yormayan pastel/kahve/krem tonları, kağıt/kitap hissi veren klasik zarafet.',
  scheme: 'light',
  background: ['#F8F5EE', '#F2ECE1', '#EBE3D5'],
  orbs: [
    'rgba(217, 180, 142, 0.42)',
    'rgba(235, 200, 168, 0.35)',
    'rgba(202, 175, 145, 0.30)',
    'rgba(224, 192, 160, 0.28)',
  ],
  text: '#241C15',
  textMuted: 'rgba(36, 28, 21, 0.70)',
  textFaint: 'rgba(36, 28, 21, 0.42)',
  glass: 'rgba(255, 253, 249, 0.82)',
  glassStrong: 'rgba(255, 254, 251, 0.94)',
  glassBorder: 'rgba(180, 150, 120, 0.22)',
  glassGleam: 'rgba(255, 255, 255, 0.95)',
  accent: '#9A5B32',
  accentSoft: 'rgba(154, 91, 50, 0.12)',
  accentGradient: ['#9A5B32', '#C6804E'],
  gold: '#B87333',
  goldSoft: 'rgba(184, 115, 51, 0.16)',
  danger: '#DC2626',
  success: '#15803D',
  blurTint: 'light',
  statusBar: 'dark',
  previewColors: ['#F8F5EE', '#9A5B32', '#FFFDF9'],
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
