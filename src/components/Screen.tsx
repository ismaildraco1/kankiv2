import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';
import { GradientBackground } from './GradientBackground';

interface Props {
  header?: ReactNode;
  overline?: string;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}

/**
 * Lüks ve ferah ekran iskeleti.
 * Her ekranın zeminine doğrudan GradientBackground ve tema arka plan rengini
 * bağlayarak React Navigation'ın varsayılan beyaz/açık gri zeminini kesin olarak ezer.
 */
export function Screen({
  header,
  overline,
  title,
  subtitle,
  right,
  children,
}: PropsWithChildren<Props>) {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: t.background[0] }]}>
      <GradientBackground />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {header}

        {(title || overline || subtitle || right) && (
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              {overline && (
                <View style={styles.overlineRow}>
                  <View style={[styles.dot, { backgroundColor: t.accent }]} />
                  <AppText
                    variant="overline"
                    style={[styles.overlineText, { color: t.accent }]}
                  >
                    {overline}
                  </AppText>
                </View>
              )}

              {title && (
                <AppText variant="display" accessibilityRole="header" style={styles.titleText}>
                  {title}
                </AppText>
              )}

              {subtitle && (
                <AppText variant="body" tone="muted" style={styles.subtitleText}>
                  {subtitle}
                </AppText>
              )}
            </View>

            {right}
          </View>
        )}

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  overlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overlineText: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.8,
    fontSize: 11,
  },
  titleText: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    letterSpacing: -0.4,
  },
  subtitleText: {
    marginTop: 6,
    fontSize: 14.5,
    lineHeight: 21,
  },
});
