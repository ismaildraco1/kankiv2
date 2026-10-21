import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '@/data/categories';
import { fonts } from '@/theme/tokens';
import type { Quote, StoryCustomization } from '@/types';
import { BG_PRESETS, DEFAULT_STORY_CUSTOMIZATION } from './storyPresets';

export const SHARE_WIDTH = 360;
export const SHARE_HEIGHT = 640;

interface Props {
  quote: Quote;
  customization?: StoryCustomization;
}

export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { quote, customization = DEFAULT_STORY_CUSTOMIZATION },
  ref,
) {
  const category = getCategory(quote.categoryId);
  const preset =
    BG_PRESETS.find((p) => p.id === customization.bgPreset) ?? BG_PRESETS[0];

  const isLight = !customization.customImageUri && !preset.isDark;
  const textColor = customization.customImageUri
    ? '#FFFFFF'
    : preset.textColor;

  // Konumlandırma stili (temel hizalama)
  const positionStyle = {
    top: styles.positionTop,
    center: styles.positionCenter,
    bottom: styles.positionBottom,
  }[customization.position];

  // Yazı tipi stili
  const fontStyle = {
    serifItalic: {
      fontFamily: fonts.serifItalic,
      fontStyle: 'italic' as const,
    },
    serifBold: {
      fontFamily: fonts.serifBold,
      letterSpacing: -0.4,
    },
    sansBold: {
      fontFamily: fonts.bold,
      letterSpacing: -0.3,
    },
    sansRegular: {
      fontFamily: fonts.medium,
      letterSpacing: 0.1,
    },
  }[customization.typography];

  const long = quote.text.length > 110;
  const isMinimal = customization.cardStyle === 'minimal';
  const isSolid = customization.cardStyle === 'solid';

  // Dinamik metin boyutu ve satır aralığı
  const baseFontSize = long ? 21 : 25;
  const effectiveFontSize = Math.max(
    15,
    Math.min(36, baseFontSize + (customization.fontSizeDelta ?? 0)),
  );
  const effectiveLineHeight = Math.round(effectiveFontSize * 1.46);

  // Kart genişliği hesabı
  const cardWidthPercent = customization.cardWidthPercent ?? 100;
  const cardWidth = ((SHARE_WIDTH - 44) * cardWidthPercent) / 100;

  // Serbest sürükleme ofseti
  const offsetX = customization.offsetX ?? 0;
  const offsetY = customization.offsetY ?? 0;

  // Metin okunabilirlik gölgesi
  const showTextShadow = customization.enableTextShadow ?? true;
  const textShadowStyle = showTextShadow ? styles.crispTextShadow : undefined;

  return (
    <View ref={ref} collapsable={false} style={[styles.canvas, positionStyle]}>
      {/* ── 1. Arka Plan Katmanı ── */}
      {customization.customImageUri ? (
        <Image
          source={{ uri: customization.customImageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <>
          <LinearGradient
            colors={[...preset.gradient]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Parıldayan aurora küreleri */}
          <View
            style={[
              styles.orb,
              {
                top: 50,
                left: -70,
                width: 300,
                height: 300,
                backgroundColor: preset.orbs[0],
              },
            ]}
          />
          <View
            style={[
              styles.orb,
              {
                bottom: 80,
                right: -60,
                width: 280,
                height: 280,
                backgroundColor: preset.orbs[1],
              },
            ]}
          />
        </>
      )}

      {/* Karartma Örtüsü (Fotoğraf veya degrade üzerinde okunabilirlik sağlar) */}
      {customization.overlayDarkness > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0,0,0,${customization.overlayDarkness})` },
          ]}
        />
      )}

      {/* ── 2. Söz Kartı / Metin Alanı (Sürüklenebilir) ── */}
      <View
        style={[
          styles.cardBase,
          {
            width: cardWidth,
            alignSelf: 'center',
            transform: [{ translateX: offsetX }, { translateY: offsetY }],
          },
          !isMinimal && (isSolid ? styles.solidCard : styles.glassCard),
          isLight && styles.lightGlassCard,
        ]}
      >
        {/* Kategori Rozeti */}
        <View
          style={[
            styles.badgeRow,
            isLight
              ? { backgroundColor: 'rgba(0,0,0,0.06)' }
              : { backgroundColor: 'rgba(255,255,255,0.12)' },
          ]}
        >
          <LinearGradient colors={category.gradient} style={styles.badgeDot} />
          <Text
            style={[
              styles.overline,
              { color: isLight ? '#1A1524' : '#FFFFFF' },
            ]}
          >
            {category.title.toUpperCase()}
          </Text>
        </View>

        {/* Tırnak İşareti */}
        <Text
          style={[
            styles.mark,
            { color: isLight ? 'rgba(26,21,36,0.2)' : 'rgba(255,255,255,0.35)' },
            textShadowStyle,
          ]}
        >
          “
        </Text>

        {/* Söz Metni */}
        <Text
          style={[
            styles.quote,
            fontStyle,
            {
              color: textColor,
              fontSize: effectiveFontSize,
              lineHeight: effectiveLineHeight,
            },
            textShadowStyle,
          ]}
        >
          {quote.text}
        </Text>

        {/* Ayraç & Yazar */}
        <View style={styles.authorSection}>
          <LinearGradient
            colors={category.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
          <Text
            style={[
              styles.author,
              { color: textColor, opacity: isLight ? 0.85 : 0.9 },
              textShadowStyle,
            ]}
          >
            — {quote.author}
          </Text>
        </View>
      </View>

      {/* ── 3. Alt Marka İmzası ── */}
      <View style={styles.brandRow} pointerEvents="none">
        <Text
          style={[
            styles.brand,
            { color: isLight ? 'rgba(26,21,36,0.5)' : 'rgba(255,255,255,0.7)' },
            textShadowStyle,
          ]}
        >
          ✦ FISILTI · GÜNÜN İLHAMI
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    width: SHARE_WIDTH,
    height: SHARE_HEIGHT,
    padding: 22,
    overflow: 'hidden',
  },
  positionCenter: {
    justifyContent: 'center',
  },
  positionTop: {
    justifyContent: 'flex-start',
    paddingTop: 54,
  },
  positionBottom: {
    justifyContent: 'flex-end',
    paddingBottom: 72,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  cardBase: {
    padding: 22,
  },
  glassCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
  },
  solidCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(12, 10, 22, 0.90)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },
  lightGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#4C3077',
    shadowOpacity: 0.16,
  },
  crispTextShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 1.8,
  },
  mark: {
    fontFamily: fonts.serifBold,
    fontSize: 72,
    lineHeight: 72,
    marginTop: 4,
    marginBottom: -26,
  },
  quote: {
    fontSize: 25,
    lineHeight: 37,
  },
  authorSection: {
    marginTop: 20,
    gap: 10,
  },
  divider: {
    width: 38,
    height: 2.5,
    borderRadius: 1.5,
  },
  author: {
    fontFamily: fonts.medium,
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  brandRow: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
  },
  brand: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 2.4,
  },
});
