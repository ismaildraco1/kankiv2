import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { QuoteCard } from '@/components/QuoteCard';
import { Screen } from '@/components/Screen';
import { CATEGORIES } from '@/data/categories';
import { getQuote, getQuotesByCategories, QUOTES } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { CategoryId } from '@/types';
import { pickQuotes, quoteOfTheDay } from '@/utils/schedule';

function greeting(h: number) {
  if (h < 6) return 'İyi Geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'Tünaydın';
  return 'İyi Akşamlar';
}

function relativeTime(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Bugün ${time}`;
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Dün ${time}`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ` ${time}`;
}

export default function HomeScreen() {
  const t = useTheme();
  const enabled = useAppStore((s) => s.enabledCategories);
  const log = useAppStore((s) => s.scheduleLog);
  const notificationsOn = useAppStore((s) => s.notification.enabled);
  const userName = useAppStore((s) => s.userName);
  const [selectedFilter, setSelectedFilter] = useState<CategoryId | 'all'>('all');

  const pool = useMemo(() => getQuotesByCategories(enabled), [enabled]);
  const daily = useMemo(() => quoteOfTheDay(pool.length > 0 ? pool : QUOTES), [pool]);

  // Keşfet havuzu (seçili filtreye göre)
  const discoverPool = useMemo(() => {
    if (selectedFilter === 'all') return pool.length > 0 ? pool : QUOTES;
    return QUOTES.filter((q) => q.categoryId === selectedFilter);
  }, [selectedFilter, pool]);

  const [shuffled, setShuffled] = useState(() => pickQuotes(discoverPool, 1, daily ? [daily.id] : [])[0]);

  const onFilterChange = (cat: CategoryId | 'all') => {
    setSelectedFilter(cat);
    const newPool = cat === 'all' ? (pool.length > 0 ? pool : QUOTES) : QUOTES.filter((q) => q.categoryId === cat);
    setShuffled(pickQuotes(newPool, 1, [])[0]);
  };

  const now = Date.now();
  const delivered = useMemo(
    () => log.filter((e) => e.fireAt <= now).reverse().slice(0, 4),
    [log, now],
  );
  const next = log.find((e) => e.fireAt > now);

  const today = new Date();
  const displayGreeting = userName ? `${greeting(today.getHours())}, ${userName}` : greeting(today.getHours());

  return (
    <Screen
      header={<AppHeader />}
      title={displayGreeting}
      subtitle="Zihnini aydınlatacak ve güne yön verecek fısıltılar."
    >
      {/* ── 1. Bildirim Durumu Adası (Dynamic Island Glass Pill) ── */}
      <PressableScale onPress={() => router.push('/settings')} scaleTo={0.98}>
        <GlassCard padded={false} style={styles.statusPillCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: next ? (notificationsOn ? t.success : t.accent) : t.textFaint },
                ]}
              >
                {next && (
                  <View
                    style={[
                      styles.pulseRing,
                      { borderColor: notificationsOn ? t.success : t.accent },
                    ]}
                  />
                )}
              </View>
              <AppText variant="label" style={styles.statusText}>
                {notificationsOn && next
                  ? `Sıradaki fısıltı: ${relativeTime(next.fireAt)}`
                  : next
                  ? `Sıradaki widget sözü: ${relativeTime(next.fireAt)}`
                  : 'Kilit ekranı & widget hazır'}
              </AppText>
            </View>

            <View style={[styles.statusArrow, { backgroundColor: t.glassStrong }]}>
              <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
            </View>
          </View>
        </GlassCard>
      </PressableScale>

      {/* ── 2. Günün Sözü (Hero Card) ── */}
      {daily ? (
        <View style={styles.sectionWrap}>
          <QuoteCard quote={daily} size="hero" />
        </View>
      ) : (
        <EmptyCategoriesCard />
      )}

      {/* ── 3. Hızlı Kategori Filtresi ── */}
      <View style={styles.filterSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="compass-outline" size={16} color={t.accent} />
            <AppText variant="overline" style={{ color: t.accent, letterSpacing: 1.6 }}>
              KEŞFET & İLHAM AL
            </AppText>
          </View>

          <PressableScale
            onPress={() => setShuffled(pickQuotes(discoverPool, 1, shuffled ? [shuffled.id] : [])[0])}
            accessibilityLabel="Yeni söz karıştır"
            style={[styles.shuffleButton, { backgroundColor: t.accentSoft }]}
          >
            <Ionicons name="shuffle" size={14} color={t.accent} />
            <AppText variant="label" tone="accent" style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold' }}>
              Karıştır
            </AppText>
          </PressableScale>
        </View>

        {/* Yatay Kategori Çipleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="Tümü"
            active={selectedFilter === 'all'}
            onPress={() => onFilterChange('all')}
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.title}
              active={selectedFilter === c.id}
              color={c.gradient[0]}
              onPress={() => onFilterChange(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── 4. Keşif Kartı ── */}
      {shuffled && <QuoteCard key={shuffled.id} quote={shuffled} />}

      {/* ── 5. Bildirim Geçmişi Akışı ── */}
      {delivered.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="notifications-outline" size={16} color={t.textFaint} />
              <AppText variant="overline" tone="faint" style={{ letterSpacing: 1.6 }}>
                SON BİLDİRİMLER
              </AppText>
            </View>
            <AppText variant="overline" tone="faint">
              {delivered.length} SÖZ
            </AppText>
          </View>

          <View style={{ gap: 14 }}>
            {delivered.map((e) => {
              const q = getQuote(e.quoteId);
              return q ? (
                <QuoteCard key={e.notificationId} quote={q} meta={relativeTime(e.fireAt)} />
              ) : null;
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  const t = useTheme();

  return (
    <PressableScale onPress={onPress} scaleTo={0.94}>
      {active ? (
        <LinearGradient
          colors={color ? [color, `${color}DD`] : t.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chipActive}
        >
          <AppText variant="label" style={styles.chipActiveText}>
            {label}
          </AppText>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.chipInactive,
            {
              backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
              borderColor: t.glassBorder,
            },
          ]}
        >
          <AppText variant="label" tone="muted" style={{ fontSize: 13 }}>
            {label}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

function EmptyCategoriesCard() {
  const t = useTheme();
  return (
    <GlassCard>
      <View style={{ gap: 10, paddingVertical: 8 }}>
        <AppText variant="title">Henüz Söz Seti Seçmedin</AppText>
        <AppText variant="body" tone="muted">
          Günün sözleri ve bildirimler için ilgini çeken kategorileri aktif hale getir.
        </AppText>
        <PressableScale onPress={() => router.push('/categories')}>
          <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_600SemiBold', marginTop: 4 }}>
            Söz Setlerini Seç →
          </AppText>
        </PressableScale>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  statusPillCard: {
    borderRadius: radius.pill,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    opacity: 0.45,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  statusArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionWrap: {
    marginTop: 4,
  },
  filterSection: {
    marginTop: 8,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 20,
  },
  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  chipActiveText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  chipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
