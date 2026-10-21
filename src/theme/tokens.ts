import type { TextStyle } from 'react-native';

/** useFonts ile yüklenen font ailelerinin adları (app/_layout.tsx) */
export const fonts = {
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  serifBold: 'PlayfairDisplay_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 24, lineHeight: 34 },
  quoteSmall: { fontFamily: fonts.serifItalic, fontSize: 19, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
