import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, TurboModuleRegistry } from 'react-native';

/**
 * Uygulamanın Expo Go içinde mi çalıştığını tespit eder.
 * Expo Go içinde harici özel native modüller (Google Mobile Ads, WidgetKit vb.) bulunmaz.
 */
export function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo'
  );
}

/**
 * Google Mobile Ads (AdMob) native binary modülünün mevcut ortamda yüklü olup olmadığını doğrular.
 * Expo Go veya henüz yerel olarak derlenmemiş ortamda false döner ve uygulamanın çökmesini önler.
 */
export function isGoogleMobileAdsSupported(): boolean {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return false;
  if (isExpoGo()) return false;
  try {
    return TurboModuleRegistry.get('RNGoogleMobileAdsModule') != null;
  } catch {
    return false;
  }
}

