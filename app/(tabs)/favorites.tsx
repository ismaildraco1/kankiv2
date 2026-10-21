import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { QuoteCard } from '@/components/QuoteCard';
import { Screen } from '@/components/Screen';
import { getQuote } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

export default function FavoritesScreen() {
  const t = useTheme();
  const favorites = useAppStore((s) => s.favorites);
  const quotes = favorites.map(getQuote).filter((q) => q !== undefined);

  return (
    <Screen
      overline={`${quotes.length} SÖZ SAKLANDI`}
      title="Favoriler"
      subtitle="Sana dokunan, ilham veren cümleler her zaman burada."
    >
      {quotes.length === 0 ? (
        <GlassCard>
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#FB7185', '#E11D48']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="heart" size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <AppText variant="title" style={styles.emptyTitle}>
              Henüz Bir Söz Beğenmedin
            </AppText>

            <AppText variant="body" tone="muted" style={styles.emptyBody}>
              Söz kartlarının üzerindeki kalbe dokunarak sevdiklerini buraya kaydedebilir ve dilediğin an okuyabilirsin.
            </AppText>

            <PressableScale
              onPress={() => router.push('/')}
              style={[styles.emptyButton, { backgroundColor: t.accentSoft }]}
            >
              <AppText
                variant="label"
                tone="accent"
                style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13 }}
              >
                Günün Sözünü Keşfet →
              </AppText>
            </PressableScale>
          </View>
        </GlassCard>
      ) : (
        <View style={{ gap: 14, marginTop: 4 }}>
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
  },
  emptyIconContainer: {
    shadowColor: '#FB7185',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 18,
  },
  emptyIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  emptyBody: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    maxWidth: 280,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
});
