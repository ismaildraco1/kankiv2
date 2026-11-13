import React from 'react';

import {
  buildMoodWidgetProps,
  buildWidgetTimeline,
  currentWidgetQuote,
  MOOD_WIDGET_NAME,
  toWidgetProps,
  WIDGET_NAME,
} from './widgetData';
import {
  isAndroidWidgetSupported,
  isIosWidgetSupported,
} from './widgetPlatform';

/**
 * Hem iOS (kilit ekranı + ana ekran WidgetKit) hem de Android widget'larını
 * güncelleyen tekil servis fonksiyonu.
 *
 * Güvenli modül kontrolü sayesinde Expo Go içinde çalışırken çökme üretmez,
 * native build alındığında ise kilit ekranı ve ana ekranı otomatik günceller.
 */
export async function syncWidgets(): Promise<void> {
  const current = currentWidgetQuote();
  const currentProps = current
    ? toWidgetProps(current)
    : {
        text: 'Her yeni gün, taze bir başlangıçtır.',
        author: 'Kanki',
        category: 'Günün Sözü',
        accent: '#FF8A6B',
        url: 'kanki://',
      };

  // ── iOS: WidgetKit Timeline Güncellemesi ──
  if (isIosWidgetSupported()) {
    try {
      const { default: KankiQuoteWidget } = await import('./ios/KankiQuoteWidget');
      const timeline = buildWidgetTimeline();

      if (timeline.length > 0) {
        KankiQuoteWidget.updateTimeline(timeline);
      } else {
        KankiQuoteWidget.updateSnapshot(currentProps);
      }
      KankiQuoteWidget.reload();
    } catch (e) {
      console.warn('[widgets-ios] syncWidgets failed', e);
    }
  }

  // ── Android: AppWidget Güncellemesi ──
  if (isAndroidWidgetSupported()) {
    try {
      const { requestWidgetUpdate } = await import('react-native-android-widget');
      const { KankiAndroidWidget } = await import('./android/KankiAndroidWidget');

      await requestWidgetUpdate({
        widgetName: WIDGET_NAME,
        renderWidget: () => <KankiAndroidWidget {...currentProps} />,
        widgetNotFound: () => {
          // Kullanıcı henüz ana ekrana widget eklemediyse sessizce devam et
        },
      });
    } catch (e) {
      console.warn('[widgets-android] syncWidgets failed', e);
    }
  }

  await syncMoodWidget().catch(console.warn);
}

/**
 * Yalnızca ruh hali widget'ını (iOS + Android) günceller. Günlük kaydı değişince çağrılır.
 */
export async function syncMoodWidget(): Promise<void> {
  const props = buildMoodWidgetProps();

  if (isIosWidgetSupported()) {
    try {
      const { default: KankiMoodWidget } = await import('./ios/KankiMoodWidget');
      KankiMoodWidget.updateSnapshot(props);
      KankiMoodWidget.reload();
    } catch (e) {
      console.warn('[widgets-ios] syncMoodWidget failed', e);
    }
  }

  if (isAndroidWidgetSupported()) {
    try {
      const { requestWidgetUpdate } = await import('react-native-android-widget');
      const { KankiMoodAndroidWidget } = await import('./android/KankiMoodAndroidWidget');
      await requestWidgetUpdate({
        widgetName: MOOD_WIDGET_NAME,
        renderWidget: () => <KankiMoodAndroidWidget {...props} />,
        widgetNotFound: () => {},
      });
    } catch (e) {
      console.warn('[widgets-android] syncMoodWidget failed', e);
    }
  }
}

/**
 * Android için ana ekrana tek dokunuşla widget ekleme istemi açar.
 */
export async function pinAndroidWidget(): Promise<boolean> {
  if (!isAndroidWidgetSupported()) return false;
  try {
    const { requestPinWidget } = await import('react-native-android-widget');
    return await requestPinWidget({ widgetName: WIDGET_NAME });
  } catch (e) {
    console.warn('[widgets-android] requestPinWidget failed', e);
    return false;
  }
}
