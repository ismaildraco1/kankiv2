import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

interface Props {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  strong?: boolean;
  padded?: boolean;
  glowColor?: string;
  /** İçerik kutusunun stili (kart minHeight ile büyüdüğünde içeriği hizalamak için) */
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Lüks Glassmorphism Kart:
 * - Gerçek blur katmanı
 * - Kadife renk tabanı (cihazlarda bulanıklık olmasa bile zengin durur)
 * - Üst kenarda ince kristal parıltı (specular highlight)
 * - Yumuşak derinlik gölgesi
 */
export function GlassCard({
  children,
  style,
  intensity = 45,
  strong,
  padded = true,
  glowColor,
  contentStyle,
}: PropsWithChildren<Props>) {
  const t = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: glowColor ? `${glowColor}55` : t.glassBorder,
          shadowColor: glowColor ?? (t.scheme === 'dark' ? '#000000' : '#4C3077'),
        },
        style,
      ]}
    >
      {/* 1. Blur katmanı */}
      <BlurView
        intensity={intensity}
        tint={t.blurTint}
        blurMethod={Platform.OS === 'android' ? 'none' : undefined}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Zengin taban dolgusu */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? t.glassStrong : t.glass },
        ]}
      />

      {/* 3. Üst kenar kristal parıltısı (Specular Highlight) */}
      <LinearGradient
        colors={[t.glassGleam, 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topGleam}
      />

      {/* 4. İçerik */}
      <View style={[styles.content, padded && styles.pad, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  topGleam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  // Kart minHeight ile uzasa bile içerik kutusu tamamını doldurur (iç gradient'ler boşta kalmaz)
  content: {
    flexGrow: 1,
  },
  pad: {
    padding: 22,
  },
});
