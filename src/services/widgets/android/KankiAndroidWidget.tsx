import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { QuoteWidgetProps } from '../widgetData';

/**
 * Android Ana Ekran / Kilit Ekranı Widget Tasarımı — "Liquid Glass" (Buzlu Cam Estetiği)
 *
 * - Derin koyu baz zemin (#070B19) ve ince yarı saydam neon cam çerçeve (1px cyan/beyaz vurgu)
 * - Sol üstte parıltılı tırnak ikonu ("❝")
 * - Ortada dinamik ölçeklenen (adjustsFontSizeToFit) kalın, ferah söz tipografisi
 * - En altta sağ/sol hizalı yazar imzası ve zarif cam kapsül rozeti
 */
export function KankiAndroidWidget({
  text = 'Her yeni gün, taze bir başlangıçtır.',
  author = 'Kanki',
  url = 'kanki://',
}: Partial<QuoteWidgetProps>) {
  const len = text.length;
  const fontSize =
    len <= 45
      ? 16.5
      : len <= 80
      ? 15
      : len <= 115
      ? 13.5
      : len <= 150
      ? 12.5
      : 11.5;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 24,
        backgroundColor: 'rgba(8, 13, 28, 0.86)',
        borderColor: 'rgba(103, 232, 249, 0.22)',
        borderWidth: 1,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: url }}
    >
      {/* Üst Katman: Yüzen Parıltılı Tırnak İkonu */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="❝"
          style={{
            color: '#67E8F9',
            fontSize: 18,
            fontWeight: '700',
          }}
        />
      </FlexWidget>

      {/* Orta Katman: Ana Söz Metni (Dinamik Boyutlandırma + Geniş Nefes Alanı) */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingVertical: 4,
        }}
      >
        <TextWidget
          text={text}
          maxLines={5}
          truncate="END"
          style={{
            color: '#FFFFFF',
            fontSize,
            fontWeight: '600',
            textAlign: 'left',
            adjustsFontSizeToFit: true,
          }}
        />
      </FlexWidget>

      {/* Alt Durum Satırı: Yazar İmzası & Cam Kapsül (Glassmorphism Pill) */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text={author ? `— ${author}` : ''}
          maxLines={1}
          truncate="END"
          style={{
            color: 'rgba(226, 232, 240, 0.72)',
            fontSize: 11.5,
            fontWeight: '500',
          }}
        />

        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 9,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: 'rgba(56, 189, 248, 0.14)',
            borderColor: 'rgba(103, 232, 249, 0.25)',
            borderWidth: 1,
          }}
        >
          <TextWidget
            text="✦"
            style={{
              color: '#67E8F9',
              fontSize: 10,
              fontWeight: '600',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
