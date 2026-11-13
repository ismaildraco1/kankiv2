import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  lineLimit,
  minimumScaleFactor,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { MoodWidgetProps } from '../widgetData';

/**
 * iOS Ruh Hali Widget'ı (WidgetKit):
 * - accessoryInline / accessoryRectangular: kilit ekranında bugünün ruh hali ve 7 günlük şerit
 * - systemSmall: bugünün emojisi ve adı
 * - systemMedium / systemLarge: bugün + 7 günlük şerit + haftalık özet
 * Dokununca günlük ekranını açar.
 */
const KankiMoodWidget = (props: MoodWidgetProps, environment: WidgetEnvironment) => {
  'widget';

  const mood = props?.mood ?? '';
  const emoji = props?.emoji ?? '🙂';
  const week = props?.week ?? ['·', '·', '·', '·', '·', '·', '·'];
  const days = props?.days ?? ['', '', '', '', '', '', ''];
  const summary = props?.summary ?? 'Bugün nasıl hissediyorsun?';
  const url = props?.url ?? 'kanki://journal';
  const family = environment?.widgetFamily ?? 'systemMedium';

  const background = containerBackground(
    {
      type: 'linearGradient',
      colors: ['#150812', '#241024', '#0E0B1C'],
      startPoint: { x: 0.05, y: 0.0 },
      endPoint: { x: 0.95, y: 1.0 },
    },
    'widget',
  );

  // Kilit ekranı: saat üstü tek satır
  if (family === 'accessoryInline') {
    return (
      <Text modifiers={[widgetURL(url), font({ size: 12.5, weight: 'medium' })]}>
        {emoji} {mood || 'Ruh halini seç'}
      </Text>
    );
  }

  // Kilit ekranı: dikdörtgen
  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2} modifiers={[widgetURL(url), padding({ horizontal: 2, vertical: 1 })]}>
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), lineLimit(1)]}>
          {emoji} {mood || 'Bugün nasıl hissediyorsun?'}
        </Text>
        <Text modifiers={[font({ size: 13 }), lineLimit(1), minimumScaleFactor(0.7)]}>{week.join(' ')}</Text>
        <Text modifiers={[font({ size: 10.5 }), lineLimit(1), minimumScaleFactor(0.7)]}>{summary}</Text>
      </VStack>
    );
  }

  // Ana ekran: küçük
  if (family === 'systemSmall') {
    return (
      <VStack
        alignment="leading"
        spacing={4}
        modifiers={[widgetURL(url), padding({ horizontal: 14, vertical: 12 }), background]}
      >
        <Text modifiers={[font({ size: 9.5, weight: 'bold' }), foregroundStyle('#FF8A6B')]}>BUGÜN</Text>
        <Spacer />
        <Text modifiers={[font({ size: 40 })]}>{emoji}</Text>
        <Text
          modifiers={[
            font({ size: 15, weight: 'bold' }),
            foregroundStyle('#FFFFFF'),
            lineLimit(1),
            minimumScaleFactor(0.7),
          ]}
        >
          {mood || 'Henüz seçmedin'}
        </Text>
      </VStack>
    );
  }

  // Ana ekran: orta ve büyük
  return (
    <VStack
      alignment="leading"
      spacing={8}
      modifiers={[widgetURL(url), padding({ horizontal: 18, vertical: 14 }), background]}
    >
      <HStack alignment="center" spacing={10}>
        <Text modifiers={[font({ size: 34 })]}>{emoji}</Text>
        <VStack alignment="leading" spacing={1}>
          <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle('#FF8A6B')]}>BUGÜN</Text>
          <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle('#FFFFFF'), lineLimit(1)]}>
            {mood || 'Henüz seçmedin'}
          </Text>
        </VStack>
        <Spacer />
      </HStack>

      <Spacer />

      <HStack alignment="center" spacing={0}>
        {week.map((e, i) => (
          <VStack key={i} spacing={2}>
            <Text modifiers={[font({ size: 20 })]}>{e}</Text>
            <Text modifiers={[font({ size: 10 }), foregroundStyle('rgba(255, 240, 236, 0.55)')]}>
              {days[i] ?? ''}
            </Text>
          </VStack>
        ))}
      </HStack>

      <Spacer />

      <Text
        modifiers={[
          font({ size: 12.5, weight: 'medium' }),
          foregroundStyle('rgba(255, 240, 236, 0.8)'),
          lineLimit(1),
          minimumScaleFactor(0.8),
        ]}
      >
        {summary}
      </Text>
    </VStack>
  );
};

export default createWidget('KankiMood', KankiMoodWidget);
