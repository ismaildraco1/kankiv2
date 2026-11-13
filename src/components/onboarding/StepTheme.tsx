import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { THEMES } from '@/theme/palette';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { IconName, ThemeId } from '@/types';

interface StepThemeProps {
  selectedTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  icon: IconName;
  previewColors: readonly [string, string, string];
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'oled',
    name: 'Gece Yarısı',
    badge: 'Saf Siyah & Buz Mavisi',
    description: 'Piksel kapatıcı siyah zemin, serin turkuaz vurgular ve derin huzur.',
    icon: 'moon',
    previewColors: THEMES.oled.previewColors,
  },
  {
    id: 'vibrant',
    name: 'Kızıl Akşam',
    badge: 'Közden Mercana Işıltı',
    description: 'Erik moru zeminde mercan ve amber ışıltılar, sıcak ve canlı bir gece.',
    icon: 'sparkles',
    previewColors: THEMES.vibrant.previewColors,
  },
  {
    id: 'warm',
    name: 'Adaçayı',
    badge: 'Kâğıt & Yeşil Mürekkep',
    description: 'Açık adaçayı zemin ve koyu yeşil mürekkep, sakin bir okuma hissi.',
    icon: 'sunny',
    previewColors: THEMES.warm.previewColors,
  },
];

/**
 * 2. Adım: Tema / Atmosfer Seçimi
 * Kullanıcı seçim yaptığı anda aktif tema canlı olarak değişir.
 */
export function StepTheme({ selectedTheme, onSelectTheme }: StepThemeProps) {
  const t = useTheme();

  const handleSelect = (id: ThemeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    onSelectTheme(id);
  };

  return (
    <View style={styles.container}>
      {/* ── Başlık ve Açıklama ── */}
      <View style={styles.header}>
        <AppText variant="overline" style={[styles.stepOverline, { color: t.accent }]}>
          2. ADIM • ATMOSFER
        </AppText>

        <AppText variant="display" style={styles.title}>
          Ruhuna en uygun atmosferi seç...
        </AppText>

        <AppText variant="body" tone="muted" style={styles.subtitle}>
          Seçtiğin atmosfer anında uygulanır. Kanki'yi hangi ışıkta deneyimlemek istersin?
        </AppText>
      </View>

      {/* ── 3 Tema Kartı ── */}
      <View style={styles.optionsList}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = selectedTheme === option.id;

          return (
            <PressableScale
              key={option.id}
              onPress={() => handleSelect(option.id)}
              scaleTo={0.98}
              style={styles.cardWrapper}
            >
              <GlassCard
                strong={isSelected}
                intensity={isSelected ? 55 : 30}
                glowColor={isSelected ? t.accent : undefined}
                style={[
                  styles.themeCard,
                  isSelected && {
                    borderColor: t.accent,
                    backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleGroup}>
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: isSelected ? t.accent : t.glassStrong,
                          borderColor: isSelected ? t.accent : t.glassBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={isSelected ? (t.scheme === 'dark' ? '#000000' : '#FFFFFF') : t.textMuted}
                      />
                    </View>

                    <View>
                      <AppText variant="title" style={styles.themeName}>
                        {option.name}
                      </AppText>
                      <AppText variant="label" tone="muted" style={styles.badgeText}>
                        {option.badge}
                      </AppText>
                    </View>
                  </View>

                  {/* Seçim Rozeti (Radio / Check) */}
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? t.accent : t.glassBorder,
                        backgroundColor: isSelected ? t.accent : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={t.scheme === 'dark' ? '#000000' : '#FFFFFF'}
                      />
                    )}
                  </View>
                </View>

                {/* Açıklama */}
                <AppText variant="body" tone="muted" style={styles.cardDescription}>
                  {option.description}
                </AppText>

                {/* Renk Paleti Minik Daireleri */}
                <View style={styles.paletteRow}>
                  <AppText variant="overline" style={[styles.paletteLabel, { color: t.textFaint }]}>
                    Renk Paleti
                  </AppText>
                  <View style={styles.paletteCircles}>
                    {option.previewColors.map((color, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: color,
                            borderColor: t.glassBorder,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </GlassCard>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepOverline: {
    letterSpacing: 2,
    fontSize: 10.5,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 6,
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  optionsList: {
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
  },
  themeCard: {
    borderRadius: radius.lg,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'DMSans_600SemiBold',
  },
  badgeText: {
    fontSize: 11,
    marginTop: 1,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 10,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 8,
  },
  paletteLabel: {
    fontSize: 9.5,
    letterSpacing: 1.2,
  },
  paletteCircles: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
