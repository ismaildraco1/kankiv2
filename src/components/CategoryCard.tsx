import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { Category } from '@/types';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { PressableScale } from './PressableScale';

export function CategoryCard({
  category,
  active,
  onToggle,
}: {
  category: Category;
  active: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();

  return (
    <PressableScale
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`${category.title} seti`}
      scaleTo={0.96}
      style={styles.wrap}
    >
      <GlassCard
        padded={false}
        strong={active}
        glowColor={active ? category.gradient[0] : undefined}
        style={[
          styles.card,
          active && {
            borderColor: `${category.gradient[0]}99`,
            borderWidth: 1.5,
          },
        ]}
      >
        {/* Kategori aurası ve parlama geçişi */}
        <LinearGradient
          colors={[
            `${category.gradient[0]}${active ? '35' : '10'}`,
            `${category.gradient[1]}${active ? '15' : '02'}`,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Üst kenar renk vurgusu */}
        {active && (
          <LinearGradient
            colors={[category.gradient[0], category.gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topAccent}
          />
        )}

        <View style={styles.inner}>
          {/* İkon ve Aktif Durum Rozeti */}
          <View style={styles.topRow}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={category.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Ionicons name={category.icon} size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>

            {/* Glowing toggle pill */}
            <View
              style={[
                styles.togglePill,
                active
                  ? { backgroundColor: category.gradient[0], borderColor: `${category.gradient[0]}AA` }
                  : { backgroundColor: t.glassStrong, borderColor: t.glassBorder },
              ]}
            >
              {active ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <View style={[styles.inactiveDot, { backgroundColor: t.textFaint }]} />
              )}
            </View>
          </View>

          {/* Metin Bilgileri */}
          <View style={styles.content}>
            <AppText variant="title" style={styles.title}>
              {category.title}
            </AppText>
            <AppText variant="label" tone="muted" numberOfLines={2} style={styles.subtitle}>
              {category.subtitle}
            </AppText>
          </View>

        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  card: {
    borderRadius: radius.lg,
    minHeight: 160,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  inner: {
    padding: 18,
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    marginVertical: 12,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    marginBottom: 4,
    fontFamily: 'DMSans_700Bold',
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});
