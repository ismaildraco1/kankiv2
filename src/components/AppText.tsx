import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { type as typeScale } from '@/theme/tokens';

type Variant = keyof typeof typeScale;
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'inverse';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: Props) {
  const t = useTheme();
  const color = {
    default: t.text,
    muted: t.textMuted,
    faint: t.textFaint,
    accent: t.accent,
    inverse: '#FFFFFF',
  }[tone];
  return <Text {...rest} style={[typeScale[variant], { color }, style]} />;
}
