import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { DiscoverSection } from '@/components/home/DiscoverSection';
import { MoodSelector } from '@/components/home/MoodSelector';
import { RecentList } from '@/components/home/RecentList';
import { StatusPill } from '@/components/home/StatusPill';
import { PressableScale } from '@/components/PressableScale';
import { QuoteCard } from '@/components/QuoteCard';
import { Screen } from '@/components/Screen';
import { resolveQuotePool } from '@/data/moods';
import { QUOTES } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import { greeting } from '@/utils/format';
import { quoteOfTheDay } from '@/utils/schedule';

export default function HomeScreen() {
  const enabled = useAppStore((s) => s.enabledCategories);
  const log = useAppStore((s) => s.scheduleLog);
  const notificationsOn = useAppStore((s) => s.notification.enabled);
  const userName = useAppStore((s) => s.userName);

  const homeMood = useAppStore((s) => s.homeMood);

  const pool = useMemo(() => resolveQuotePool(enabled, homeMood), [enabled, homeMood]);
  const daily = useMemo(() => quoteOfTheDay(pool.length > 0 ? pool : QUOTES), [pool]);

  const now = Date.now();
  const recent = useMemo(() => log.filter((e) => e.fireAt <= now).reverse().slice(0, 4), [log, now]);
  const nextAt = log.find((e) => e.fireAt > now)?.fireAt;

  const hello = greeting(new Date().getHours());

  return (
    <Screen
      header={<AppHeader />}
      title={userName ? `${hello}, ${userName}` : hello}
      subtitle="Zihnini aydınlatacak ve güne yön verecek sözler."
    >
      {/* İçerik önce: günün sözü */}
      {daily ? <QuoteCard quote={daily} size="hero" /> : <EmptyCategoriesCard />}

      {/* Ruh hali seçici: onaylanan set ana sayfa havuzunu belirler */}
      <MoodSelector />


      {/* Keşfet: filtre + karıştır + tek söz */}
      <DiscoverSection key={homeMood ?? 'all'} pool={pool} excludeId={daily?.id} />

      {/* Sistem durumu ikincil bilgi olarak içeriğin altında */}
      <StatusPill nextAt={nextAt} notificationsOn={notificationsOn} />

      <RecentList entries={recent} />
    </Screen>
  );
}

function EmptyCategoriesCard() {
  return (
    <GlassCard>
      <View style={styles.empty}>
        <AppText variant="title">Henüz Söz Seti Seçmedin</AppText>
        <AppText variant="body" tone="muted">
          Günün sözleri ve bildirimler için ilgini çeken kategorileri aktif hale getir.
        </AppText>
        <PressableScale onPress={() => router.push('/categories')}>
          <AppText variant="label" tone="accent" style={styles.emptyLink}>
            Söz Setlerini Seç →
          </AppText>
        </PressableScale>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  empty: { gap: 10, paddingVertical: 8 },
  emptyLink: { fontFamily: 'DMSans_600SemiBold', marginTop: 4 },
});
