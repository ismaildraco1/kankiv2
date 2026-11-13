import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { MoodWidgetProps } from '../widgetData';

/**
 * Android Ruh Hali Widget'ı:
 * - Sol blokta bugünün ruh hali (büyük emoji + ad)
 * - Altta son 7 günün emoji şeridi ve gün kısaltmaları
 * - Haftanın özeti; dokununca günlük ekranını açar
 */
export function KankiMoodAndroidWidget({
  mood = '',
  emoji = '🙂',
  week = ['·', '·', '·', '·', '·', '·', '·'],
  days = ['', '', '', '', '', '', ''],
  summary = 'Bugün nasıl hissediyorsun?',
  url = 'kanki://journal',
}: Partial<MoodWidgetProps>) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: 'rgba(21, 8, 18, 0.9)',
        borderColor: 'rgba(255, 138, 107, 0.28)',
        borderWidth: 1,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: url }}
    >
      {/* Üst: bugünün ruh hali */}
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget text={emoji} style={{ fontSize: 30 }} />
        <FlexWidget style={{ flexDirection: 'column', paddingLeft: 12, flex: 1 }}>
          <TextWidget
            text="BUGÜN"
            style={{ color: '#FF8A6B', fontSize: 9.5, fontWeight: '700' }}
          />
          <TextWidget
            text={mood || 'Henüz seçmedin'}
            maxLines={1}
            truncate="END"
            style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Orta: 7 günlük şerit */}
      <FlexWidget
        style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        {week.map((e, i) => (
          <FlexWidget key={i} style={{ flexDirection: 'column', alignItems: 'center' }}>
            <TextWidget text={e} style={{ fontSize: 17, color: '#FFFFFF' }} />
            <TextWidget
              text={days[i] ?? ''}
              style={{ fontSize: 9.5, color: 'rgba(255, 240, 236, 0.55)' }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>

      {/* Alt: haftalık özet */}
      <TextWidget
        text={summary}
        maxLines={1}
        truncate="END"
        style={{ color: 'rgba(255, 240, 236, 0.78)', fontSize: 11.5, fontWeight: '500' }}
      />
    </FlexWidget>
  );
}
