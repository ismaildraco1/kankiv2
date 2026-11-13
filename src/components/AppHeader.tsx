import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

/**
 * Türkçe tarih formatlayıcı (örn: 12 Ekim Pazartesi)
 * Hermes, JSC ve tarayıcı ortamlarında %100 kararlı ve tutarlı yerelleştirme.
 */
export function formatTurkishDate(date: Date = new Date()): string {
  const day = date.getDate();
  const months = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];
  const days = [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
  ];
  return `${day} ${months[date.getMonth()]} ${days[date.getDay()]}`;
}

interface AppHeaderProps {
  /** Ayarlar butonuna basıldığında özel aksiyon (varsayılan: /settings sekmesine yönlendirir) */
  onSettingsPress?: () => void;
  /** Ayarlar butonunun gösterilip gösterilmeyeceği */
  showSettings?: boolean;
  /** Tarih etiketinin gösterilip gösterilmeyeceği */
  showDate?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Kanki Üst Bilgi Paneli (Header / Navbar):
 * - Sol taraf: "Kanki" markası & kristal logo rozeti
 * - Sağ taraf: Güncel anlık Türkçe tarih (örn: 12 Ekim Pazartesi) ve minimalist ayarlar simgesi
 */
export function AppHeader({
  onSettingsPress,
  showSettings = true,
  showDate = true,
  style,
}: AppHeaderProps) {
  const t = useTheme();

  const formattedDate = useMemo(() => formatTurkishDate(new Date()), []);

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push('/settings');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* ── Sol: "Kanki" Markası & Logo ── */}
      <View style={styles.brandGroup}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.brandTextWrap}>
          <AppText
            variant="display"
            style={[
              styles.brandTitle,
              { color: t.text },
            ]}
          >
            Kanki
          </AppText>
        </View>
      </View>

      {/* ── Sağ: Türkçe Anlık Tarih & Ayarlar Simgesi ── */}
      <View style={styles.rightGroup}>
        {showDate && (
          <View
            style={[
              styles.datePill,
              {
                backgroundColor: t.glassStrong,
                borderColor: t.glassBorder,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={12}
              color={t.accent}
              style={{ marginRight: 4 }}
            />
            <AppText
              variant="label"
              style={[styles.dateText, { color: t.textMuted }]}
              numberOfLines={1}
            >
              {formattedDate}
            </AppText>
          </View>
        )}

        {showSettings && (
          <PressableScale
            onPress={handleSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Ayarları Aç"
            scaleTo={0.92}
            hitSlop={8}
            style={[
              styles.settingsBtn,
              {
                backgroundColor: t.glassStrong,
                borderColor: t.glassBorder,
              },
            ]}
          >
            <Ionicons name="settings-outline" size={17} color={t.text} />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    shadowColor: '#FF8A6B',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 9,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: 'Fraunces_600SemiBold',
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
