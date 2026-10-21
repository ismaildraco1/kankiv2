import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import {
  currentWidgetQuote,
  toWidgetProps,
  WIDGET_NAME,
} from '../widgetData';
import { isAndroidWidgetSupported } from '../widgetPlatform';

/**
 * Android işletim sistemi widget ekleme, güncelleme veya tıklama olaylarında
 * arka planda bu işleyiciyi çağırır.
 */
export async function androidWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== WIDGET_NAME && props.widgetInfo.widgetName !== 'KankiQuote') {
    return;
  }

  const quote = currentWidgetQuote();
  const widgetProps = quote
    ? toWidgetProps(quote)
    : {
        text: 'Her yeni gün, taze bir başlangıçtır.',
        author: 'Kanki',
        category: 'GÜNÜN SÖZÜ',
        accent: '#A78BFA',
        url: 'kanki://',
      };

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const { KankiAndroidWidget } = await import('./KankiAndroidWidget');
      props.renderWidget(<KankiAndroidWidget {...widgetProps} />);
      break;
    }

    case 'WIDGET_CLICK':
    case 'WIDGET_DELETED':
    default:
      break;
  }
}

let registered = false;

export async function registerAndroidWidgetTask() {
  if (registered) return;
  if (!isAndroidWidgetSupported()) return;

  registered = true;
  try {
    const { registerWidgetTaskHandler } = await import('react-native-android-widget');
    registerWidgetTaskHandler(androidWidgetTaskHandler);
  } catch (e) {
    console.warn('[android-widget] Task registration failed', e);
  }
}
