import type {
  StoryBgPreset,
  StoryCardStyle,
  StoryCustomization,
  StoryPosition,
  StoryTypography,
} from '@/types';

export interface BgPresetConfig {
  id: StoryBgPreset;
  title: string;
  gradient: readonly [string, string, string];
  orbs: readonly [string, string];
  textColor: string;
  isDark: boolean;
}

export const BG_PRESETS: readonly BgPresetConfig[] = [
  {
    id: 'obsidian',
    title: 'Obsidiyen',
    gradient: ['#070610', '#100B26', '#090D1C'],
    orbs: ['#8B5CF6', '#F43F5E'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'aurora',
    title: 'Aurora',
    gradient: ['#050B1E', '#140D36', '#061726'],
    orbs: ['#06B6D4', '#8B5CF6'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'dawn',
    title: 'Şafak',
    gradient: ['#1F0E07', '#381A08', '#1A0B05'],
    orbs: ['#F59E0B', '#F97316'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'rose',
    title: 'Gül',
    gradient: ['#1E0713', '#3B0D27', '#180510'],
    orbs: ['#EC4899', '#F43F5E'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'emerald',
    title: 'Zümrüt',
    gradient: ['#04140D', '#0B291A', '#030F0A'],
    orbs: ['#10B981', '#059669'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'slate',
    title: 'Kömür',
    gradient: ['#0A0A0E', '#14141A', '#09090C'],
    orbs: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'],
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'champagne',
    title: 'Şampanya',
    gradient: ['#FAF5EE', '#F3ECE0', '#ECE2D0'],
    orbs: ['#E2D4C0', '#F5EBE0'],
    textColor: '#1A1524',
    isDark: false,
  },
];

export const POSITION_OPTIONS: { id: StoryPosition; title: string; icon: string }[] = [
  { id: 'top', title: 'Sol Üst', icon: 'arrow-up-circle-outline' },
  { id: 'center', title: 'Ortada', icon: 'reorder-two-outline' },
  { id: 'bottom', title: 'Altta', icon: 'arrow-down-circle-outline' },
];

export const TYPOGRAPHY_OPTIONS: {
  id: StoryTypography;
  title: string;
  font: string;
  sample: string;
}[] = [
  {
    id: 'serifItalic',
    title: 'Edebi',
    font: 'Fraunces_400Regular_Italic',
    sample: 'Şiirsel & Zarif',
  },
  {
    id: 'serifBold',
    title: 'Klasik',
    font: 'Fraunces_600SemiBold',
    sample: 'Heybetli Serif',
  },
  {
    id: 'sansBold',
    title: 'Modern',
    font: 'DMSans_700Bold',
    sample: 'Cesur & Güçlü',
  },
  {
    id: 'sansRegular',
    title: 'Minimal',
    font: 'DMSans_500Medium',
    sample: 'Duru & Sade',
  },
];

export const CARD_STYLE_OPTIONS: { id: StoryCardStyle; title: string; icon: string }[] = [
  { id: 'glass', title: 'Buzlu Cam', icon: 'browsers-outline' },
  { id: 'minimal', title: 'Çerçevesiz', icon: 'scan-outline' },
  { id: 'solid', title: 'Opak Kutu', icon: 'square-outline' },
];

export const DEFAULT_STORY_CUSTOMIZATION: StoryCustomization = {
  bgPreset: 'obsidian',
  customImageUri: null,
  overlayDarkness: 0.45,
  position: 'center',
  typography: 'serifItalic',
  cardStyle: 'glass',
  offsetX: 0,
  offsetY: 0,
  fontSizeDelta: 0,
  cardWidthPercent: 100,
  enableTextShadow: true,
};
