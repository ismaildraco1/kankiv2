import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { relativeTime } from '@/utils/format';

export function StatusPill({ nextAt, notificationsOn }: { nextAt?: number; notificationsOn: boolean }) {
  const t = useTheme();
  const hasNext = nextAt !== undefined;
  const dotColor = hasNext ? (notificationsOn ? t.success : t.accent) : t.textFaint;

  const label =
    hasNext && notificationsOn
      ? `Sıradaki söz: ${relativeTime(nextAt)}`
      : hasNext
      ? `Sıradaki widget sözü: ${relativeTime(nextAt)}`
      : 'Kilit ekranı & widget hazır';

  return (
    <PressableScale onPress={() => router.push('/settings')} scaleTo={0.98}>
      <GlassCard padded={false} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.dot, { backgroundColor: dotColor }]}>
              {hasNext && <View style={[styles.ring, { borderColor: dotColor }]} />}
            </View>
            <AppText variant="label" style={styles.text}>
              {label}
            </AppText>
          </View>
          <View style={[styles.arrow, { backgroundColor: t.glassStrong }]}>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </View>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.pill },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dot: { width: 9, height: 9, borderRadius: 4.5, justifyContent: 'center', alignItems: 'center' },
  ring: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    opacity: 0.45,
  },
  text: { flex: 1, fontSize: 13, fontFamily: 'DMSans_500Medium' },
  arrow: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
