import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { IconName, NotificationMode } from '@/types';

interface StepNotificationsProps {
  mode: NotificationMode;
  onSelectMode: (mode: NotificationMode) => void;
}

interface DeliveryOption {
  mode: NotificationMode;
  title: string;
  badge: string;
  description: string;
  subdetail: string;
  icon: IconName;
  previewTimes: string[];
}

const DELIVERY_OPTIONS: readonly DeliveryOption[] = [
  {
    mode: 'random',
    title: 'Rastgele Akış',
    badge: '✨ Doğal & Sürpriz',
    description: 'Günün sürpriz saatlerinde doğal bir dağılımla ruhuna dokunsun.',
    subdetail: '09:00 - 22:00 aralığında günün telaşında beklenmedik bir nefes anı sunar.',
    icon: 'shuffle',
    previewTimes: ['Günde 3 Kez', 'Doğal Aralıklar', 'Öngörülemez'],
  },
  {
    mode: 'fixed',
    title: 'Özel Saatler',
    badge: '⏰ Düzenli Ritüel',
    description: 'Kullanıcının belirleyeceği sabit ve sakin zaman dilimleri.',
    subdetail: 'Sabah uyanışında, gün ortası molasında ve akşam dinginliğinde gelir.',
    icon: 'time',
    previewTimes: ['08:30 Sabah', '13:00 Öğle', '21:00 Akşam'],
  },
];

/**
 * 4. Adım: Bildirim ve Zamanlama Tercihi
 * Rastgele Akış vs Özel Saatler seçimi ve bildirim hazırlığı.
 */
export function StepNotifications({ mode, onSelectMode }: StepNotificationsProps) {
  const t = useTheme();

  const handleSelect = (m: NotificationMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectMode(m);
  };

  return (
    <View style={styles.container}>
      {/* ── Başlık ve Açıklama ── */}
      <View style={styles.header}>
        <AppText variant="overline" style={[styles.stepOverline, { color: t.accent }]}>
          4. ADIM • ZAMANLAMA
        </AppText>

        <AppText variant="display" style={styles.title}>
          Bildirimlerini nasıl alalım?
        </AppText>

        <AppText variant="body" tone="muted" style={styles.subtitle}>
          Kanki gününe nasıl eşlik etsin? Dilediğin an Ayarlar sekmesinden saatleri güncelleyebilirsin.
        </AppText>
      </View>

      {/* ── 2 Temel Seçenek Kartları ── */}
      <View style={styles.cardsWrap}>
        {DELIVERY_OPTIONS.map((item) => {
          const isSelected = mode === item.mode;

          return (
            <PressableScale
              key={item.mode}
              onPress={() => handleSelect(item.mode)}
              scaleTo={0.98}
              style={styles.cardContainer}
            >
              <GlassCard
                strong={isSelected}
                intensity={isSelected ? 60 : 30}
                glowColor={isSelected ? t.accent : undefined}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: t.accent,
                    backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.88)',
                  },
                ]}
              >
                {/* Üst Satır */}
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleGroup}>
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
                        name={item.icon}
                        size={19}
                        color={isSelected ? (t.scheme === 'dark' ? '#000000' : '#FFFFFF') : t.textMuted}
                      />
                    </View>

                    <View>
                      <AppText variant="title" style={styles.cardTitle}>
                        {item.title}
                      </AppText>
                      <AppText variant="label" tone="accent" style={styles.badgeText}>
                        {item.badge}
                      </AppText>
                    </View>
                  </View>

                  {/* Radio İkonu */}
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
                <AppText variant="body" tone="default" style={styles.description}>
                  {item.description}
                </AppText>

                <AppText variant="label" tone="muted" style={styles.subdetail}>
                  {item.subdetail}
                </AppText>

                {/* Minik Zaman Önizleme Hapları */}
                <View style={styles.previewPillsRow}>
                  {item.previewTimes.map((label, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.timePill,
                        {
                          backgroundColor: isSelected
                            ? t.accentSoft
                            : t.scheme === 'dark'
                            ? 'rgba(255,255,255,0.04)'
                            : 'rgba(0,0,0,0.04)',
                          borderColor: isSelected ? t.accent : t.glassBorder,
                        },
                      ]}
                    >
                      <AppText
                        variant="label"
                        style={{
                          fontSize: 11,
                          fontFamily: 'Inter_600SemiBold',
                          color: isSelected ? t.text : t.textMuted,
                        }}
                      >
                        {label}
                      </AppText>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </PressableScale>
          );
        })}
      </View>

      {/* Alt Güven / İzin Bilgilendirmesi */}
      <GlassCard padded={false} strong={false} intensity={20} style={styles.permissionCard}>
        <View style={styles.permissionContent}>
          <Ionicons name="notifications-outline" size={18} color={t.accent} />
          <AppText variant="label" tone="muted" style={styles.permissionText}>
            Bir sonraki adımda Kanki için bildirim izni isteyeceğiz. Asla spam yapmaz, yalnızca seçtiğin anlarda zihnini aydınlatırız.
          </AppText>
        </View>
      </GlassCard>
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
    fontFamily: 'Inter_700Bold',
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
  cardsWrap: {
    gap: 14,
    marginBottom: 16,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    borderRadius: radius.lg,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
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
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  subdetail: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  previewPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  permissionCard: {
    borderRadius: radius.md,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  permissionText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
});
