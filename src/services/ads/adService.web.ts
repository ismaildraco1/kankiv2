/**
 * Web için reklam servisi: react-native-google-mobile-ads web'de çalışmaz,
 * bu yüzden tüm çağrılar etkisizdir ve akış kesintisiz devam eder.
 */
export async function initMobileAds(): Promise<void> {}

export function preloadInterstitial(): void {}

export async function showInterstitial(options?: { onClosed?: () => void; force?: boolean }): Promise<boolean> {
  options?.onClosed?.();
  return false;
}
