import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { QuoteCard } from '@/components/QuoteCard';
import { Screen } from '@/components/Screen';
import { getMood, getQuotesForMood, MOODS, type MoodEntry } from '@/data/moods';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { dayKey } from '@/utils/format';
import { quoteOfTheDay } from '@/utils/schedule';

const NOTE_MAX = 140;

function lastDays(n: number) {
  const out: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ key: dayKey(d), label: d.toLocaleDateString('tr-TR', { weekday: 'short' }) });
  }
  return out;
}

export default function JournalScreen() {
  const t = useTheme();
  const moodLog = useAppStore((s) => s.moodLog);
  const logMood = useAppStore((s) => s.logMood);
  const setTodayNote = useAppStore((s) => s.setTodayNote);
  const clearMoodLog = useAppStore((s) => s.clearMoodLog);

  const todayKey = dayKey();
  const today: MoodEntry | undefined = moodLog[todayKey];
  const todayMood = getMood(today?.mood);

  const [note, setNote] = useState(today?.note ?? '');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setNote(today?.note ?? '');
  }, [today?.mood, todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const week = useMemo(() => lastDays(7).map((d) => ({ ...d, entry: moodLog[d.key] })), [moodLog]);

  const topMood = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of week) if (d.entry) counts.set(d.entry.mood, (counts.get(d.entry.mood) ?? 0) + 1);
    let best: { id: string; n: number } | null = null;
    counts.forEach((n, id) => {
      if (!best || n > best.n) best = { id, n };
    });
    return best as { id: string; n: number } | null;
  }, [week]);
  const topMoodInfo = topMood ? MOODS.find((m) => m.id === topMood.id) : undefined;

  const history = useMemo(
    () =>
      Object.entries(moodLog)
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .slice(0, 30),
    [moodLog],
  );

  const suggestion = useMemo(() => {
    if (!today) return undefined;
    const pool = getQuotesForMood(today.mood);
    return pool.length ? quoteOfTheDay(pool) : undefined;
  }, [today?.mood]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveNote = () => {
    setTodayNote(note.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Screen title="Ruh Hali Günlüğü" subtitle="Her gün nasıl hissettiğini not et, haftalık eğilimini gör.">
      {/* Bugün */}
      <GlassCard>
        <View style={{ gap: 12 }}>
          <AppText variant="overline" tone="accent">
            BUGÜN
          </AppText>
          <AppText variant="title">
            {todayMood ? `${todayMood.emoji} ${todayMood.label} hissediyorsun` : 'Bugün nasıl hissediyorsun?'}
          </AppText>

          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const selected = today?.mood === m.id;
              return (
                <PressableScale
                  key={m.id}
                  onPress={() => logMood(m.id)}
                  accessibilityLabel={`${m.label} olarak kaydet`}
                  scaleTo={0.92}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor: selected ? t.accentSoft : t.glassStrong,
                      borderColor: selected ? t.accent : t.glassBorder,
                    },
                  ]}
                >
                  <AppText style={styles.moodEmoji}>{m.emoji}</AppText>
                </PressableScale>
              );
            })}
          </View>

          {today && (
            <View style={{ gap: 10 }}>
              <TextInput
                value={note}
                onChangeText={(v) => setNote(v.slice(0, NOTE_MAX))}
                placeholder="Bugünü kısaca not et (isteğe bağlı)"
                placeholderTextColor={t.textFaint}
                multiline
                maxLength={NOTE_MAX}
                style={[styles.input, { color: t.text, borderColor: t.glassBorder, backgroundColor: t.glassStrong }]}
              />
              <View style={styles.noteFooter}>
                <AppText variant="label" tone="faint">
                  {note.length}/{NOTE_MAX}
                </AppText>
                <PressableScale onPress={saveNote} style={[styles.saveBtn, { backgroundColor: t.accent }]}>
                  <AppText variant="label" tone="inverse" style={{ fontFamily: 'DMSans_700Bold' }}>
                    {saved ? 'Kaydedildi ✓' : 'Notu Kaydet'}
                  </AppText>
                </PressableScale>
              </View>
            </View>
          )}
        </View>
      </GlassCard>

      {/* Bu hafta */}
      <GlassCard>
        <View style={{ gap: 14 }}>
          <AppText variant="overline" tone="accent">
            SON 7 GÜN
          </AppText>
          <View style={styles.weekRow}>
            {week.map((d) => {
              const m = getMood(d.entry?.mood);
              return (
                <View key={d.key} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: m ? t.accentSoft : t.glassStrong,
                        borderColor: d.key === todayKey ? t.accent : t.glassBorder,
                      },
                    ]}
                  >
                    <AppText style={styles.dayEmoji}>{m ? m.emoji : ''}</AppText>
                  </View>
                  <AppText variant="label" tone="faint" style={{ fontSize: 11 }}>
                    {d.label}
                  </AppText>
                </View>
              );
            })}
          </View>
          <AppText variant="body" tone="muted">
            {topMoodInfo && topMood
              ? `Bu hafta en çok ${topMoodInfo.emoji} ${topMoodInfo.label} hissettin (${topMood.n} gün).`
              : 'Bu hafta henüz kayıt yok. Bir ruh hali seçerek başla.'}
          </AppText>
        </View>
      </GlassCard>

      {/* Önerilen söz */}
      {suggestion && todayMood && (
        <View style={{ gap: 10 }}>
          <AppText variant="overline" tone="accent">
            BUGÜNKÜ RUH HALİNE ÖNERİ
          </AppText>
          <QuoteCard quote={suggestion} />
        </View>
      )}

      {/* Geçmiş */}
      {history.length > 0 && (
        <View style={{ gap: 10 }}>
          <View style={styles.historyHeader}>
            <AppText variant="overline" tone="faint">
              GEÇMİŞ
            </AppText>
            <PressableScale onPress={clearMoodLog} accessibilityLabel="Günlüğü temizle">
              <AppText variant="label" tone="faint">
                Günlüğü temizle
              </AppText>
            </PressableScale>
          </View>
          {history.map(([key, e]) => {
            const m = getMood(e.mood);
            const date = new Date(`${key}T12:00:00`);
            return (
              <GlassCard key={key} padded={false}>
                <View style={styles.historyRow}>
                  <AppText style={styles.dayEmoji}>{m?.emoji}</AppText>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label">
                      {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} · {m?.label}
                    </AppText>
                    {!!e.note && (
                      <AppText variant="body" tone="muted" style={{ marginTop: 2 }}>
                        {e.note}
                      </AppText>
                    )}
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  moodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  moodBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: { fontSize: 22, lineHeight: 28 },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  noteFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmoji: { fontSize: 18, lineHeight: 22 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
});
