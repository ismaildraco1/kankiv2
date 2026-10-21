import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '@/data/categories';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import type { Quote } from '@/types';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { PressableScale } from './PressableScale';
import { useShareQuote } from './share/ShareProvider';

interface Props {
  quote: Quote;
  size?: 'hero' | 'compact';
  meta?: string;
}

export function QuoteCard({ quote, size = 'compact', meta }: Props) {
  const t = useTheme();
  const category = getCategory(quote.categoryId);
  const isFav = useAppStore((s) => s.favorites.includes(quote.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const share = useShareQuote();
  const [copied, setCopied] = useState(false);

  const heartScale = useRef(new Animated.Value(1)).current;
  const hero = size === 'hero';

  const onFavorite = () => {
    Haptics.impactAsync(isFav ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.45, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 8 }),
    ]).start();
    toggleFavorite(quote.id);
  };

  const onCopy = () => {
    Clipboard.setStringAsync(`“${quote.text}”\n— ${quote.author}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PressableScale haptic={false} scaleTo={0.985} onPress={() => router.push(`/quote/${quote.id}`)}>
      <GlassCard
        strong={hero}
        glowColor={hero ? category.gradient[0] : undefined}
        style={[hero ? styles.heroCard : styles.compactCard]}
      >
        {/* Kategoriye özel zengin iç aurora ışıltısı */}
        <LinearGradient
          colors={[
            `${category.gradient[0]}${hero ? '28' : '15'}`,
            `${category.gradient[1]}${hero ? '12' : '05'}`,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Üst kenar kategori ışığı */}
        <LinearGradient
          colors={[category.gradient[0], category.gradient[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topColorLine}
        />

        {/* Arka plan sanatsal filigran tırnak işareti */}
        <Text
          style={[
            styles.watermarkQuote,
            { color: t.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          ]}
          pointerEvents="none"
        >
          “
        </Text>

        {/* Üst Başlık & Kategori Rozeti */}
        <View style={styles.header}>
          <View style={styles.badgeGroup}>
            <View
              style={[
                styles.categoryChip,
                {
                  backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                  borderColor: `${category.gradient[0]}66`,
                },
              ]}
            >
              <LinearGradient colors={category.gradient} style={styles.chipDot} />
              <AppText
                variant="overline"
                style={{ color: category.gradient[0], fontFamily: 'Inter_600SemiBold', fontSize: 10 }}
              >
                {category.title}
              </AppText>
            </View>

            {hero && (
              <View
                style={[
                  styles.heroPill,
                  { backgroundColor: t.goldSoft, borderColor: `${t.gold}55` },
                ]}
              >
                <Ionicons name="sparkles" size={11} color={t.gold} />
                <AppText
                  variant="overline"
                  style={{ color: t.gold, fontSize: 9.5, letterSpacing: 1.2, fontFamily: 'Inter_700Bold' }}
                >
                  GÜNÜN İLHAMI
                </AppText>
              </View>
            )}
          </View>

          {meta && (
            <View style={[styles.metaPill, { backgroundColor: t.glass }]}>
              <Ionicons name="time-outline" size={11} color={t.textFaint} />
              <AppText variant="overline" tone="faint" style={{ fontSize: 10 }}>
                {meta}
              </AppText>
            </View>
          )}
        </View>

        {/* Söz Metni */}
        <AppText
          variant={hero ? 'quote' : 'quoteSmall'}
          style={[
            styles.quoteText,
            hero && { fontSize: 26, lineHeight: 38 },
          ]}
        >
          “{quote.text}”
        </AppText>

        {/* Yazar ve Aksiyon Barı */}
        <View style={styles.footer}>
          <View style={styles.authorRow}>
            <View style={[styles.authorLine, { backgroundColor: category.gradient[0] }]} />
            <AppText
              variant="label"
              style={[
                styles.authorText,
                hero && { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
              ]}
            >
              {quote.author}
            </AppText>
          </View>

          <View style={styles.actions}>
            {copied && (
              <View style={[styles.copiedBadge, { backgroundColor: t.success }]}>
                <AppText variant="overline" style={{ color: '#FFFFFF', fontSize: 9 }}>
                  Kopyalandı
                </AppText>
              </View>
            )}

            <ActionPill
              icon={copied ? 'checkmark' : 'copy-outline'}
              active={copied}
              activeColor={t.success}
              onPress={onCopy}
              label="Kopyala"
            />
            <ActionPill
              icon="share-social-outline"
              onPress={() => share(quote)}
              label="Paylaş"
            />
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <ActionPill
                icon={isFav ? 'heart' : 'heart-outline'}
                active={isFav}
                activeColor="#FB7185"
                onPress={onFavorite}
                label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              />
            </Animated.View>
          </View>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

function ActionPill({
  icon,
  onPress,
  active,
  activeColor,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  label: string;
}) {
  const t = useTheme();

  return (
    <PressableScale
      haptic={false}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[
        styles.actionPill,
        {
          backgroundColor: active
            ? `${activeColor}22`
            : t.scheme === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.9)',
          borderColor: active ? activeColor ?? t.glassBorder : t.glassBorder,
        },
      ]}
    >
      <Ionicons name={icon} size={17} color={active ? activeColor : t.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    minHeight: 240,
    justifyContent: 'space-between',
  },
  compactCard: {
    minHeight: 180,
    justifyContent: 'space-between',
  },
  topColorLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  watermarkQuote: {
    position: 'absolute',
    right: 14,
    bottom: -10,
    fontFamily: fonts.serifBold,
    fontSize: 140,
    lineHeight: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  quoteText: {
    marginBottom: 20,
    zIndex: 2,
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    paddingTop: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 10,
  },
  authorLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  authorText: {
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  actionPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
