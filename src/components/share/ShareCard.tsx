import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '@/data/categories';
import { fonts } from '@/theme/tokens';
import type { Quote, StoryCustomization } from '@/types';
import { BG_PRESETS, DEFAULT_STORY_CUSTOMIZATION } from './storyPresets';

export const SHARE_WIDTH = 360;
export const SHARE_HEIGHT = 640;

interface Props {
  quote: Quote;
  customization?: StoryCustomization;
  animatedOffset?: Animated.ValueXY;
  /** Ölçek çarpanı (Önizleme için 1 = 360x640, Ultra HD dışa aktarım için 3 = 1080x1920) */
  scale?: number;
}

export const ShareCard = forwardRef<any, Props>(function ShareCard(
  { quote, customization = DEFAULT_STORY_CUSTOMIZATION, animatedOffset, scale = 1 },
  ref,
) {
  const category = getCategory(quote.categoryId);
  const preset =
    BG_PRESETS.find((p) => p.id === customization.bgPreset) ?? BG_PRESETS[0];

  const isLight = !customization.customImageUri && !preset.isDark;
  const textColor = customization.customImageUri
    ? '#FFFFFF'
    : preset.textColor;

  // Yazı tipi stili
  const fontStyle = {
    serifItalic: {
      fontFamily: fonts.serifItalic,
      fontStyle: 'italic' as const,
    },
    serifBold: {
      fontFamily: fonts.serifBold,
      letterSpacing: -0.4 * scale,
    },
    sansBold: {
      fontFamily: fonts.bold,
      letterSpacing: -0.3 * scale,
    },
    sansRegular: {
      fontFamily: fonts.medium,
      letterSpacing: 0.1 * scale,
    },
  }[customization.typography];

  const long = quote.text.length > 110;
  const isMinimal = customization.cardStyle === 'minimal';
  const isSolid = customization.cardStyle === 'solid';

  // Dinamik metin boyutu ve satır aralığı
  const baseFontSize = (long ? 21 : 25) * scale;
  const effectiveFontSize = Math.round(
    Math.max(
      15 * scale,
      Math.min(36 * scale, ((long ? 21 : 25) + (customization.fontSizeDelta ?? 0)) * scale),
    ),
  );
  const effectiveLineHeight = Math.round(effectiveFontSize * 1.46);

  // Kart genişliği hesabı
  const cardWidthPercent = customization.cardWidthPercent ?? 100;
  const cardWidth = (((SHARE_WIDTH - 44) * cardWidthPercent) / 100) * scale;

  // Serbest sürükleme ofseti (merkez referanslı)
  const offsetX = customization.offsetX ?? 0;
  const offsetY = customization.offsetY ?? 0;

  // Metin okunabilirlik gölgesi
  const showTextShadow = customization.enableTextShadow ?? true;
  const textShadowStyle = showTextShadow
    ? {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowRadius: 10 * scale,
        textShadowOffset: { width: 0, height: 2 * scale },
      }
    : undefined;

  const cardTransform = animatedOffset
    ? [
        { translateX: animatedOffset.x },
        { translateY: animatedOffset.y },
      ]
    : [
        { translateX: offsetX * scale },
        { translateY: offsetY * scale },
      ];

  const canvasWidth = SHARE_WIDTH * scale;
  const canvasHeight = SHARE_HEIGHT * scale;
  const canvasPadding = 22 * scale;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.canvas,
        {
          width: canvasWidth,
          height: canvasHeight,
          padding: canvasPadding,
        },
      ]}
    >
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
                top: 50 * scale,
                left: -70 * scale,
                width: 300 * scale,
                height: 300 * scale,
                backgroundColor: preset.orbs[0],
              },
            ]}
          />
          <View
            style={[
              styles.orb,
              {
                bottom: 80 * scale,
                right: -60 * scale,
                width: 280 * scale,
                height: 280 * scale,
                backgroundColor: preset.orbs[1],
              },
            ]}
          />
        </>
      )}

      {/* Karartma Örtüsü */}
      {customization.overlayDarkness > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0,0,0,${customization.overlayDarkness})` },
          ]}
        />
      )}

      {/* ── 2. Söz Kartı / Metin Alanı (Sürüklenebilir) ── */}
      <Animated.View
        style={[
          styles.cardBase,
          {
            width: cardWidth,
            padding: 22 * scale,
            alignSelf: 'center',
            transform: cardTransform,
          },
          !isMinimal &&
            (isSolid
              ? [
                  styles.solidCard,
                  {
                    borderRadius: 26 * scale,
                    borderWidth: 1.2 * scale,
                    shadowRadius: 30 * scale,
                    shadowOffset: { width: 0, height: 14 * scale },
                  },
                ]
              : [
                  styles.glassCard,
                  {
                    borderRadius: 26 * scale,
                    borderWidth: 1.5 * scale,
                    shadowRadius: 28 * scale,
                    shadowOffset: { width: 0, height: 14 * scale },
                  },
                ]),
          isLight && [
            styles.lightGlassCard,
            {
              borderWidth: 1.5 * scale,
            },
          ],
        ]}
      >
        {/* Tırnak İşareti */}
        <Text
          style={[
            styles.mark,
            {
              fontSize: 72 * scale,
              lineHeight: 72 * scale,
              marginTop: 4 * scale,
              marginBottom: -26 * scale,
              color: isLight ? 'rgba(26,21,36,0.2)' : 'rgba(255,255,255,0.35)',
            },
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
        <View style={[styles.authorSection, { marginTop: 20 * scale, gap: 10 * scale }]}>
          <LinearGradient
            colors={category.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: 38 * scale,
              height: 2.5 * scale,
              borderRadius: 1.5 * scale,
            }}
          />
          <Text
            style={[
              styles.author,
              {
                fontSize: 14.5 * scale,
                letterSpacing: 0.2 * scale,
                color: textColor,
                opacity: isLight ? 0.85 : 0.9,
              },
              textShadowStyle,
            ]}
          >
            — {quote.author}
          </Text>
        </View>
      </Animated.View>

      {/* ── 3. Alt Marka İmzası ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 22 * scale,
          alignSelf: 'center',
        }}
        pointerEvents="none"
      >
        <Text
          style={[
            styles.brand,
            {
              fontSize: 10.5 * scale,
              letterSpacing: 2.4 * scale,
              color: isLight ? 'rgba(26,21,36,0.5)' : 'rgba(255,255,255,0.7)',
            },
            textShadowStyle,
          ]}
        >
          ✦ KANKI · GÜNÜN İLHAMI
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  cardBase: {},
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
  },
  solidCard: {
    backgroundColor: 'rgba(12, 10, 22, 0.90)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
  },
  lightGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#4C3077',
    shadowOpacity: 0.16,
  },
  mark: {
    fontFamily: fonts.serifBold,
  },
  quote: {},
  authorSection: {},
  author: {
    fontFamily: fonts.medium,
  },
  brand: {
    fontFamily: fonts.semibold,
  },
});
