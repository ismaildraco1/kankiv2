import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requireOptionalNativeModule } from 'expo';
import { Platform, TurboModuleRegistry } from 'react-native';

/**
 * Uygulamanın Expo Go içinde mi çalıştığını tespit eder.
 * Expo Go içinde özel native modüller (WidgetKit ve AppWidget) bulunmaz.
 */
export function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo'
  );
}

/**
 * Android AppWidget native modülünün bu ortamda mevcut olup olmadığını doğrular.
 */
export function isAndroidWidgetSupported(): boolean {
  if (Platform.OS !== 'android') return false;
  if (isExpoGo()) return false;
  try {
    return TurboModuleRegistry.get('AndroidWidget') != null;
  } catch {
    return false;
  }
}

/**
 * iOS WidgetKit (expo-widgets) native modülünün bu ortamda mevcut olup olmadığını doğrular.
 */
export function isIosWidgetSupported(): boolean {
  if (Platform.OS !== 'ios') return false;
  if (isExpoGo()) return false;
  try {
    return requireOptionalNativeModule('ExpoWidgets') != null;
  } catch {
    return false;
  }
}
