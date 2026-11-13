import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { useShareQuote } from '@/components/share/ShareProvider';
import { getCategory } from '@/data/categories';
import { getQuote } from '@/data/quotes';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';

/** Bildirime dokunulduğunda veya karta tıklandığında açılan sinematik modal */
export default function QuoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = getQuote(id);
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const share = useShareQuote();
  const isFav = useAppStore((s) => s.favorites.includes(id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
  }, [enter]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!quote) {
    return (
      <View style={styles.center}>
        <AppText variant="title">Söz bulunamadı</AppText>
      </View>
    );
  }
  const category = getCategory(quote.categoryId);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor:
            t.scheme === 'dark' ? 'rgba(5, 4, 12, 0.92)' : 'rgba(250, 247, 242, 0.94)',
        },
      ]}
    >
      {/* Kategori aurası */}
      <LinearGradient
        colors={[`${category.gradient[0]}88`, `${category.gradient[1]}22`, 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.85 }}
        style={StyleSheet.absoluteFill}
      />

      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Kapat" />

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        pointerEvents="box-none"
      >
        {/* Kapat Butonu */}
        <PressableScale
          onPress={close}
          accessibilityLabel="Kapat"
          style={[styles.close, { backgroundColor: t.glassStrong, borderColor: t.glassBorder }]}
        >
          <Ionicons name="close" size={20} color={t.text} />
        </PressableScale>

        {/* Ana Sinematik Kart */}
        <Animated.View
          style={{
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }),
              },
              {
                scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
              },
            ],
          }}
        >
          <GlassCard strong intensity={80} glowColor={category.gradient[0]} style={styles.modalCard}>
            {/* Arka plan dev tırnak filigranı */}
            <Text
              style={[
                styles.modalWatermark,
                { color: t.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
              pointerEvents="none"
            >
              “
            </Text>

            {/* Büyük Söz Metni */}
            <AppText
              variant="quote"
              style={[
                styles.quoteText,
                quote.text.length > 140
                  ? { fontSize: 22, lineHeight: 33 }
                  : quote.text.length > 95
                  ? { fontSize: 24, lineHeight: 36 }
                  : undefined,
              ]}
            >
              “{quote.text}”
            </AppText>

            {/* Yazar Ayracı & İmzası */}
            <View style={styles.authorSection}>
              <LinearGradient
                colors={category.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.divider}
              />
              <AppText variant="label" style={styles.authorName}>
                — {quote.author}
              </AppText>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Aksiyon Butonları */}
        <View style={styles.actions}>
          <PressableScale
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
              toggleFavorite(quote.id);
            }}
            scaleTo={0.96}
            style={styles.favBtnWrap}
          >
            <View
              style={[
                styles.favBtnInner,
                {
                  backgroundColor: isFav
                    ? 'rgba(251, 113, 133, 0.22)'
                    : t.scheme === 'dark'
                    ? 'rgba(30, 24, 52, 0.9)'
                    : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isFav ? '#FB7185' : t.glassBorder,
                },
              ]}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#FB7185' : t.text}
              />
              <AppText
                variant="label"
                numberOfLines={1}
                style={{
                  color: isFav ? '#FB7185' : t.text,
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 13.5,
                }}
              >
                {isFav ? 'Favorilerde' : 'Favorilere Ekle'}
              </AppText>
            </View>
          </PressableScale>

          <PressableScale
            onPress={() => share(quote)}
            scaleTo={0.96}
            style={styles.shareBtnWrap}
          >
            <LinearGradient
              colors={t.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareBtnGradient}
            >
              <Ionicons name="share-social" size={18} color="#FFFFFF" />
              <AppText
                variant="label"
                numberOfLines={1}
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 13.5,
                }}
              >
                Görseli Paylaş
              </AppText>
            </LinearGradient>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 22,
  },
  close: {
    position: 'absolute',
    top: 54,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  modalCard: {
    padding: 12,
    borderRadius: radius.xl,
  },
  modalWatermark: {
    position: 'absolute',
    right: 18,
    bottom: -10,
    fontFamily: fonts.serifBold,
    fontSize: 160,
    lineHeight: 160,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  iconGradient: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 27,
    lineHeight: 40,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  authorSection: {
    gap: 12,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 1.5,
  },
  authorName: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  favBtnWrap: {
    flex: 1,
  },
  favBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  shareBtnWrap: {
    flex: 1.25,
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    shadowColor: '#FF8A6B',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
