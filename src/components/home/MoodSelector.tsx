import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { getMood, MOODS, type Mood } from '@/data/moods';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

export function MoodSelector() {
  const t = useTheme();
  const homeMood = useAppStore((s) => s.homeMood);
  const setHomeMood = useAppStore((s) => s.setHomeMood);
  const logMood = useAppStore((s) => s.logMood);
  const [pending, setPending] = useState<Mood | null>(null);

  const active = getMood(homeMood);

  const onPick = (m: Mood) => {
    Haptics.selectionAsync().catch(() => {});
    logMood(m.id); // seçim bugünün günlük kaydı olur (set onayından bağımsız)
    if (m.id === homeMood) return;
    setPending(m);
  };

  const confirm = () => {
    if (pending) setHomeMood(pending.id);
    setPending(null);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="title">Bugün nasıl hissediyorsunuz?</AppText>
        {active && (
          <PressableScale onPress={() => setHomeMood(null)} accessibilityLabel="Ruh hali setini kaldır">
            <AppText variant="label" tone="accent" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Sıfırla
            </AppText>
          </PressableScale>
        )}
      </View>

      {active && (
        <AppText variant="label" tone="muted">
          Ana sayfa şu an “{active.setName}” setini gösteriyor.
        </AppText>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MOODS.map((m) => {
          const selected = m.id === homeMood;
          return (
            <PressableScale
              key={m.id}
              onPress={() => onPick(m)}
              scaleTo={0.94}
              accessibilityLabel={`${m.label} ruh hali`}
              style={[
                styles.mood,
                {
                  backgroundColor: selected ? t.accentSoft : t.glass,
                  borderColor: selected ? t.accent : t.glassBorder,
                },
              ]}
            >
              <AppText style={styles.emoji}>{m.emoji}</AppText>
              <AppText variant="label" tone={selected ? 'accent' : 'default'}>
                {m.label}
              </AppText>
            </PressableScale>
          );
        })}
      </ScrollView>

      <Modal visible={pending !== null} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <View style={styles.backdrop}>
          <GlassCard style={styles.dialog}>
            <View style={{ gap: 14 }}>
              <AppText style={styles.dialogEmoji}>{pending?.emoji}</AppText>
              <AppText variant="body" style={styles.dialogText}>
                Seçtiğiniz ruh haline özel hazırladığımız{' '}
                <AppText variant="body" tone="accent" style={{ fontFamily: 'DMSans_700Bold' }}>
                  {pending?.setName}
                </AppText>{' '}
                söz setini ana sayfama ayarlayayım mı?
              </AppText>
              <View style={styles.actions}>
                <PressableScale
                  onPress={() => setPending(null)}
                  style={[styles.btn, { backgroundColor: t.glassStrong, borderColor: t.glassBorder, borderWidth: 1 }]}
                >
                  <AppText variant="label">Hayır</AppText>
                </PressableScale>
                <PressableScale onPress={confirm} style={[styles.btn, { backgroundColor: t.accent }]}>
                  <AppText variant="label" tone="inverse" style={{ fontFamily: 'DMSans_700Bold' }}>
                    Evet
                  </AppText>
                </PressableScale>
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { gap: 10, paddingRight: 20 },
  mood: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 82,
  },
  emoji: { fontSize: 26, lineHeight: 32 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialog: { borderRadius: radius.lg },
  dialogEmoji: { fontSize: 40, lineHeight: 48, textAlign: 'center' },
  dialogText: { textAlign: 'center', lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
});
