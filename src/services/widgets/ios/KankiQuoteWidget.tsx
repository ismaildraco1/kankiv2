import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  italic,
  lineLimit,
  multilineTextAlignment,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { QuoteWidgetProps } from '../widgetData';

/**
 * iOS Widget bileşeni:
 * - Ana Ekran: systemSmall, systemMedium, systemLarge
 * - Kilit Ekranı (Lock Screen): accessoryRectangular, accessoryInline
 *
 * ÖNEMLİ KURAL: 'widget' direktifi izole bir runtime'da çalışır.
 * Bileşen gövdesi dışında tanımlı const/değişkenler çalışma zamanında
 * erişilemez; tüm stiller ve içerik fonksiyon gövdesinde tanımlanmalıdır.
 */
const KankiQuoteWidget = (
  props: QuoteWidgetProps,
  environment: WidgetEnvironment,
) => {
  'widget';

  const text = props?.text ?? 'Her yeni gün, taze bir başlangıçtır.';
  const author = props?.author ?? 'Kanki';
  const category = props?.category ?? 'Günün Sözü';
  const url = props?.url ?? 'kanki://';
  const accent = props?.accent ?? '#A78BFA';
  const family = environment?.widgetFamily ?? 'systemMedium';

  // ── 1. Kilit Ekranı: accessoryInline (Tarihin yanında tek satır metin) ──
  if (family === 'accessoryInline') {
    return (
      <HStack modifiers={[widgetURL(url)]}>
        <Image systemName="quote.bubble" />
        <Text modifiers={[font({ size: 13, weight: 'medium' })]}>
          {author}: “{text}”
        </Text>
      </HStack>
    );
  }

  // ── 2. Kilit Ekranı: accessoryRectangular (Kilit ekranındaki dikdörtgen widget) ──
  if (family === 'accessoryRectangular') {
    return (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[
          widgetURL(url),
          padding({ horizontal: 2, vertical: 1 }),
        ]}
      >
        <HStack alignment="center" spacing={4}>
          <Image systemName="sparkles" size={10} color="#FFFFFF" />
          <Text
            modifiers={[
              font({ size: 10, weight: 'bold' }),
              foregroundStyle('#FFFFFF'),
            ]}
          >
            {category.toUpperCase()}
          </Text>
        </HStack>
        <Text
          modifiers={[
            font({ size: 12, weight: 'medium' }),
            lineLimit(2),
            foregroundStyle('#FFFFFF'),
          ]}
        >
          “{text}”
        </Text>
        <Text
          modifiers={[
            font({ size: 10, weight: 'regular' }),
            italic(),
            foregroundStyle('rgba(255,255,255,0.7)'),
          ]}
        >
          — {author}
        </Text>
      </VStack>
    );
  }

  // ── 3. Ana Ekran: systemSmall (2x2 kare widget) ──
  if (family === 'systemSmall') {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[
          widgetURL(url),
          padding({ all: 14 }),
          containerBackground('#0C0A1D', 'widget'),
        ]}
      >
        <HStack alignment="center" spacing={5}>
          <Image systemName="quote.opening" size={12} color={accent} />
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold' }),
              foregroundStyle(accent),
            ]}
          >
            {category}
          </Text>
        </HStack>
        <Text
          modifiers={[
            font({ size: 13, weight: 'medium' }),
            lineLimit(4),
            foregroundStyle('#F3F4F6'),
          ]}
        >
          “{text}”
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 11, weight: 'regular' }),
            italic(),
            foregroundStyle('#9CA3AF'),
          ]}
        >
          — {author}
        </Text>
      </VStack>
    );
  }

  // ── 4. Ana Ekran: systemLarge (4x4 büyük widget) ──
  if (family === 'systemLarge') {
    return (
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[
          widgetURL(url),
          padding({ all: 20 }),
          containerBackground('#0C0A1D', 'widget'),
        ]}
      >
        <HStack alignment="center" spacing={6}>
          <Image systemName="sparkles" size={14} color={accent} />
          <Text
            modifiers={[
              font({ size: 12, weight: 'bold' }),
              foregroundStyle(accent),
            ]}
          >
            {category.toUpperCase()} · GÜNÜN İLHAMI
          </Text>
        </HStack>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 20, weight: 'semibold' }),
            lineLimit(6),
            foregroundStyle('#FFFFFF'),
            multilineTextAlignment('leading'),
          ]}
        >
          “{text}”
        </Text>
        <Spacer />
        <HStack alignment="center">
          <Text
            modifiers={[
              font({ size: 13, weight: 'medium' }),
              italic(),
              foregroundStyle('#A78BFA'),
            ]}
          >
            — {author}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 11, weight: 'regular' }),
              foregroundStyle('#6B7280'),
            ]}
          >
            Kanki
          </Text>
        </HStack>
      </VStack>
    );
  }

  // ── 5. Ana Ekran: systemMedium (Varsayılan 4x2 geniş widget) ──
  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[
        widgetURL(url),
        padding({ all: 16 }),
        containerBackground('#0C0A1D', 'widget'),
      ]}
    >
      <HStack alignment="center" spacing={6}>
        <Image systemName="quote.opening" size={12} color={accent} />
        <Text
          modifiers={[
            font({ size: 11, weight: 'bold' }),
            foregroundStyle(accent),
          ]}
        >
          {category.toUpperCase()}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 10, weight: 'medium' }),
            foregroundStyle('#6B7280'),
          ]}
        >
          KANKI
        </Text>
      </HStack>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 14, weight: 'semibold' }),
          lineLimit(3),
          foregroundStyle('#FFFFFF'),
        ]}
      >
        “{text}”
      </Text>
      <Spacer />
      <HStack alignment="center">
        <Text
          modifiers={[
            font({ size: 12, weight: 'regular' }),
            italic(),
            foregroundStyle('#A78BFA'),
          ]}
        >
          — {author}
        </Text>
      </HStack>
    </VStack>
  );
};

export default createWidget('KankiQuote', KankiQuoteWidget);
