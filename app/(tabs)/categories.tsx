import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CategoryCard } from '@/components/CategoryCard';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { CATEGORIES } from '@/data/categories';
import { showInterstitial } from '@/services/ads/adService';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { CategoryId } from '@/types';

export default function CategoriesScreen() {
  const t = useTheme();
  const enabled = useAppStore((s) => s.enabledCategories);
  const toggle = useAppStore((s) => s.toggleCategory);

  const allActive = enabled.length === CATEGORIES.length;

  const toggleAll = () => {
    if (allActive) {
      // En az bir tane bırak
      CATEGORIES.forEach((c) => {
        if (c.id !== 'daily' && enabled.includes(c.id)) {
          toggle(c.id);
        }
      });
    } else {
      CATEGORIES.forEach((c) => {
        if (!enabled.includes(c.id)) {
          toggle(c.id);
        }
      });
    }
    showInterstitial();
  };

  const handleToggleCategory = (id: CategoryId) => {
    toggle(id);
    showInterstitial();
  };

  // 2 sütunlu ızgara
  const rows: (typeof CATEGORIES)[number][][] = [];
  for (let i = 0; i < CATEGORIES.length; i += 2) rows.push(CATEGORIES.slice(i, i + 2));

  return (
    <Screen
      overline={`${enabled.length} / ${CATEGORIES.length} SET AKTİF`}
      title="Söz Setleri"
      subtitle="Bildirimler ve günlük akış yalnızca seçtiğin setlerden derlenir."
      right={
        <PressableScale
          onPress={toggleAll}
          style={[styles.allButton, { backgroundColor: t.accentSoft }]}
        >
          <AppText
            variant="label"
            tone="accent"
            style={{ fontSize: 12.5, fontFamily: 'DMSans_600SemiBold' }}
          >
            {allActive ? 'Daralt' : 'Tümünü Seç'}
          </AppText>
        </PressableScale>
      }
    >
      <View style={{ gap: 14, marginTop: 4 }}>
        {rows.map((row) => (
          <View key={row[0].id} style={styles.row}>
            {row.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                active={enabled.includes(c.id as CategoryId)}
                onToggle={() => handleToggleCategory(c.id as CategoryId)}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  allButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 6,
  },
});
