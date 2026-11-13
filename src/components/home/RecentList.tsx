import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { QuoteCard } from '@/components/QuoteCard';
import { getQuote } from '@/data/quotes';
import { useTheme } from '@/theme/ThemeProvider';
import type { ScheduledEntry } from '@/types';
import { relativeTime } from '@/utils/format';

export function RecentList({ entries }: { entries: ScheduledEntry[] }) {
  const t = useTheme();
  if (entries.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="notifications-outline" size={16} color={t.textFaint} />
          <AppText variant="overline" tone="faint" style={{ letterSpacing: 1.6 }}>
            SON BİLDİRİMLER
          </AppText>
        </View>
        <AppText variant="overline" tone="faint">
          {entries.length} SÖZ
        </AppText>
      </View>

      <View style={{ gap: 14 }}>
        {entries.map((e) => {
          const q = getQuote(e.quoteId);
          return q ? <QuoteCard key={e.notificationId} quote={q} meta={relativeTime(e.fireAt)} /> : null;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
