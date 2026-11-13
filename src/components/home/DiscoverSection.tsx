import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { QuoteCard } from '@/components/QuoteCard';
import { CATEGORIES } from '@/data/categories';
import { QUOTES } from '@/data/quotes';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { CategoryId, Quote } from '@/types';
import { pickQuotes } from '@/utils/schedule';

type Filter = CategoryId | 'all';

export function DiscoverSection({ pool, excludeId }: { pool: Quote[]; excludeId?: string }) {
  const t = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const poolFor = (f: Filter) =>
    f === 'all' ? (pool.length > 0 ? pool : QUOTES) : QUOTES.filter((q) => q.categoryId === f);

  const discoverPool = useMemo(() => poolFor(filter), [filter, pool]); // eslint-disable-line react-hooks/exhaustive-deps
  const [current, setCurrent] = useState(() => pickQuotes(discoverPool, 1, excludeId ? [excludeId] : [])[0]);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setCurrent(pickQuotes(poolFor(f), 1, [])[0]);
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="compass-outline" size={16} color={t.accent} />
          <AppText variant="overline" style={{ color: t.accent, letterSpacing: 1.6 }}>
            KEŞFET & İLHAM AL
          </AppText>
        </View>

        <PressableScale
          onPress={() => setCurrent(pickQuotes(discoverPool, 1, current ? [current.id] : [])[0])}
          accessibilityLabel="Yeni söz karıştır"
          style={[styles.shuffle, { backgroundColor: t.accentSoft }]}
        >
          <Ionicons name="shuffle" size={14} color={t.accent} />
          <AppText variant="label" tone="accent" style={{ fontSize: 12.5, fontFamily: 'DMSans_600SemiBold' }}>
            Karıştır
          </AppText>
        </PressableScale>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Tümü" active={filter === 'all'} onPress={() => changeFilter('all')} />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            label={c.title}
            active={filter === c.id}
            color={c.gradient[0]}
            onPress={() => changeFilter(c.id)}
          />
        ))}
      </ScrollView>

      {current && <QuoteCard key={current.id} quote={current} />}
    </View>
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

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shuffle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  chips: { gap: 8, paddingRight: 20 },
  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    shadowColor: '#FF8A6B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  chipActiveText: { color: '#FFFFFF', fontFamily: 'DMSans_700Bold', fontSize: 13 },
  chipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
