import { HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  allowsTightening,
  background,
  containerBackground,
  font,
  foregroundStyle,
  italic,
  kerning,
  lineLimit,
  lineSpacing,
  minimumScaleFactor,
  multilineTextAlignment,
  padding,
  shadow,
  shapes,
  widgetAccentedRenderingMode,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { QuoteWidgetProps } from '../widgetData';

/**
 * iOS WidgetKit Bileşeni (Lock Screen & Home Screen Liquid Glass):
 *
 * 1. Lock Screen (accessoryRectangular & accessoryInline):
 *    - minimumScaleFactor(0.7) + allowsTightening(true) + lineSpacing(2) + lineLimit(4)
 *    - Yüksek kontrastlı monokrom iOS Vibrancy uyumu.
 *
 * 2. Home Screen (systemMedium, systemLarge, systemSmall):
 *    - Liquid Glass / Frosted Glass (.ultraThinMaterial) + derin neon cyan/indigo/violet mesh yansıması.
 *    - Işıltılı "quote.opening" ikonu, dinamik ölçeklenen SF Pro tipografi ve alt cam kapsül durum satırı.
 */
const KankiQuoteWidget = (
  props: QuoteWidgetProps,
  environment: WidgetEnvironment,
) => {
  'widget';

  const text = props?.text ?? 'Her yeni gün, taze bir başlangıçtır.';
  const author = props?.author ?? '';
  const url = props?.url ?? 'kanki://';
  const family = environment?.widgetFamily ?? 'systemMedium';
  const len = text.length;

  // ── 1. Kilit Ekranı: accessoryInline (Saat üstü tek satır) ──
  if (family === 'accessoryInline') {
    return (
      <HStack modifiers={[widgetURL(url)]}>
        <Image systemName="sparkles" />
        <Text
          modifiers={[
            font({ size: 12.5, weight: 'medium' }),
            minimumScaleFactor(0.75),
            allowsTightening(true),
          ]}
        >
          {text}
        </Text>
      </HStack>
    );
  }

  // ── 2. Kilit Ekranı: accessoryRectangular (Dinamik Ölçeklenen Monokrom Vibrancy) ──
  if (family === 'accessoryRectangular') {
    const baseLockSize = len > 120 ? 12 : len > 80 ? 13 : 14;
    return (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[
          widgetURL(url),
          padding({ horizontal: 2, vertical: 1 }),
        ]}
      >
        {/* Üst kompakt 1-satır zarif başlık + sağda yazar */}
        <HStack alignment="center" spacing={4}>
          <Image
            systemName="quote.opening"
            size={9}
            modifiers={[
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              widgetAccentedRenderingMode('accented'),
            ]}
          />
          <Spacer />
          {Boolean(author) && (
            <Text
              modifiers={[
                font({ size: 9.5, weight: 'medium' }),
                lineLimit(1),
                minimumScaleFactor(0.8),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}
            >
              — {author}
            </Text>
          )}
        </HStack>

        {/* Ana Söz Gövdesi: minimumScaleFactor(0.7) + lineSpacing(2) + lineLimit(4) */}
        <Text
          modifiers={[
            font({ size: baseLockSize, weight: 'semibold', design: 'default' }),
            lineSpacing(2),
            lineLimit(4),
            minimumScaleFactor(0.7),
            allowsTightening(true),
            multilineTextAlignment('leading'),
            foregroundStyle({ type: 'hierarchical', style: 'primary' }),
          ]}
        >
          {text}
        </Text>
      </VStack>
    );
  }

  // Liquid Glass Ortak Arka Plan (Deep Dark + Electric Blue, Cyan & Violet Mesh Gradient)
  const liquidGlassBackground = containerBackground(
    {
      type: 'linearGradient',
      colors: ['#050711', '#0B1528', '#140E2E', '#071A26'],
      startPoint: { x: 0.05, y: 0.0 },
      endPoint: { x: 0.95, y: 1.0 },
    },
    'widget',
  );

  // ── 3. Ana Ekran: systemSmall (2x2 Liquid Glass) ──
  if (family === 'systemSmall') {
    const smallBaseSize = len > 110 ? 13.5 : len > 70 ? 14.5 : 16;
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[
          widgetURL(url),
          padding({ all: 14 }),
          liquidGlassBackground,
        ]}
      >
        <HStack alignment="center">
          <Image
            systemName="quote.opening"
            size={13}
            color="#38BDF8"
            modifiers={[
              shadow({ color: 'rgba(56, 189, 248, 0.55)', radius: 6, x: 0, y: 2 }),
            ]}
          />
          <Spacer />
        </HStack>

        <Spacer />

        <Text
          modifiers={[
            font({ size: smallBaseSize, weight: 'semibold', design: 'default' }),
            lineSpacing(2),
            lineLimit(5),
            minimumScaleFactor(0.7),
            allowsTightening(true),
            multilineTextAlignment('leading'),
            foregroundStyle('#F8FAFC'),
          ]}
        >
          {text}
        </Text>

        <Spacer />

        {Boolean(author) && (
          <Text
            modifiers={[
              font({ size: 10.5, weight: 'medium' }),
              italic(),
              lineLimit(1),
              minimumScaleFactor(0.8),
              foregroundStyle('rgba(186, 230, 253, 0.78)'),
            ]}
          >
            — {author}
          </Text>
        )}
      </VStack>
    );
  }

  // ── 4. Ana Ekran: systemLarge (4x4 Ultra-Modern Liquid Glass) ──
  if (family === 'systemLarge') {
    const largeBaseSize = len > 140 ? 19 : len > 90 ? 21 : 23;
    return (
      <ZStack
        alignment="center"
        modifiers={[
          widgetURL(url),
          liquidGlassBackground,
        ]}
      >
        <VStack
          alignment="leading"
          spacing={12}
          modifiers={[
            padding({ horizontal: 20, vertical: 18 }),
            background(
              { type: 'material', material: 'ultraThin' },
              shapes.roundedRectangle({ cornerRadius: 24, roundedCornerStyle: 'continuous' }),
            ),
            padding({ all: 6 }),
          ]}
        >
          {/* Floating Glowing Quote Icon */}
          <HStack alignment="center">
            <Image
              systemName="quote.opening"
              size={20}
              color="#38BDF8"
              modifiers={[
                shadow({ color: 'rgba(56, 189, 248, 0.65)', radius: 10, x: 0, y: 3 }),
              ]}
            />
            <Spacer />
            <HStack
              spacing={4}
              modifiers={[
                padding({ horizontal: 9, vertical: 4 }),
                background(
                  { type: 'material', material: 'ultraThin' },
                  shapes.capsule(),
                ),
              ]}
            >
              <Image systemName="sparkles" size={9} color="#67E8F9" />
              <Text
                modifiers={[
                  font({ size: 9.5, weight: 'semibold' }),
                  kerning(0.6),
                  foregroundStyle('rgba(224, 242, 254, 0.85)'),
                ]}
              >
                GÜNÜN SÖZÜ
              </Text>
            </HStack>
          </HStack>

          <Spacer />

          {/* Ana Söz Metni: Dinamik Ölçekleme + Nefes Alan Boşluk */}
          <Text
            modifiers={[
              font({ size: largeBaseSize, weight: 'semibold', design: 'default' }),
              lineSpacing(4),
              lineLimit(8),
              minimumScaleFactor(0.7),
              allowsTightening(true),
              multilineTextAlignment('leading'),
              foregroundStyle('#FFFFFF'),
              shadow({ color: 'rgba(0, 0, 0, 0.35)', radius: 4, x: 0, y: 1 }),
            ]}
          >
            {text}
          </Text>

          <Spacer />

          {/* Alt Durum Satırı: Yazar İmzası & Glassmorphism Yenileme İkonu */}
          <HStack alignment="center" spacing={8}>
            {Boolean(author) && (
              <Text
                modifiers={[
                  font({ size: 13, weight: 'medium' }),
                  italic(),
                  lineLimit(1),
                  minimumScaleFactor(0.8),
                  foregroundStyle('rgba(186, 230, 253, 0.88)'),
                ]}
              >
                — {author}
              </Text>
            )}
            <Spacer />
            <HStack
              spacing={4}
              modifiers={[
                padding({ horizontal: 8, vertical: 4 }),
                background(
                  { type: 'material', material: 'ultraThin' },
                  shapes.capsule(),
                ),
              ]}
            >
              <Image systemName="arrow.triangle.2.circlepath" size={9} color="#A78BFA" />
            </HStack>
          </HStack>
        </VStack>
      </ZStack>
    );
  }

  // ── 5. Ana Ekran: systemMedium (4x2 Liquid Glass / Frosted Glass) ──
  const mediumBaseSize = len > 130 ? 15 : len > 85 ? 16.5 : 18;
  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[
        widgetURL(url),
        padding({ horizontal: 18, vertical: 14 }),
        liquidGlassBackground,
      ]}
    >
      {/* Üst Satır: Floating Glowing Quote Icon */}
      <HStack alignment="center">
        <Image
          systemName="quote.opening"
          size={14}
          color="#38BDF8"
          modifiers={[
            shadow({ color: 'rgba(56, 189, 248, 0.6)', radius: 8, x: 0, y: 2 }),
          ]}
        />
        <Spacer />
      </HStack>

      <Spacer />

      {/* Ana Söz Gövdesi: SF Pro Semibold + minimumScaleFactor(0.7) + lineSpacing(2) */}
      <Text
        modifiers={[
          font({ size: mediumBaseSize, weight: 'semibold', design: 'default' }),
          lineSpacing(2),
          lineLimit(4),
          minimumScaleFactor(0.7),
          allowsTightening(true),
          multilineTextAlignment('leading'),
          foregroundStyle('#FFFFFF'),
          shadow({ color: 'rgba(0, 0, 0, 0.3)', radius: 3, x: 0, y: 1 }),
        ]}
      >
        {text}
      </Text>

      <Spacer />

      {/* Alt Durum Satırı: Yazar İmzası & Glassmorphism Pill */}
      <HStack alignment="center" spacing={6}>
        {Boolean(author) && (
          <Text
            modifiers={[
              font({ size: 11.5, weight: 'medium' }),
              italic(),
              lineLimit(1),
              minimumScaleFactor(0.8),
              foregroundStyle('rgba(186, 230, 253, 0.85)'),
            ]}
          >
            — {author}
          </Text>
        )}
        <Spacer />
        <HStack
          spacing={4}
          modifiers={[
            padding({ horizontal: 8, vertical: 3 }),
            background(
              { type: 'material', material: 'ultraThin' },
              shapes.capsule(),
            ),
          ]}
        >
          <Image systemName="sparkles" size={8.5} color="#67E8F9" />
        </HStack>
      </HStack>
    </VStack>
  );
};

export default createWidget('KankiQuote', KankiQuoteWidget);
