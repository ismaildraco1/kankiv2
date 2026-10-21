import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { QuoteWidgetProps } from '../widgetData';

/**
 * Android için Kilit Ekranı / Ana Sayfa Widget Tasarımı
 * react-native-android-widget FlexWidget ve TextWidget bileşenleri ile oluşturuldu.
 * Tıklandığında doğrudan ilgili söze deep-link açar.
 */
export function KankiAndroidWidget({
  text = 'Her yeni gün, taze bir başlangıçtır.',
  author = 'Kanki',
  category = 'GÜNÜN SÖZÜ',
  accent = '#A78BFA',
  url = 'kanki://',
}: Partial<QuoteWidgetProps>) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 22,
        backgroundColor: '#0C0A1D',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: url }}
    >
      {/* Başlık Satırı */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={category.toUpperCase()}
          style={{
            color: accent as `#${string}`,
            fontSize: 11,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        />
        <TextWidget
          text="✦ KANKI"
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 10,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Söz Metni */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          width: 'match_parent',
          marginVertical: 6,
        }}
      >
        <TextWidget
          text={`“${text}”`}
          maxLines={3}
          truncate="END"
          style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20,
          }}
        />
      </FlexWidget>

      {/* Yazar */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={`— ${author}`}
          style={{
            color: '#C4B5FD',
            fontSize: 12,
            fontStyle: 'italic',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
