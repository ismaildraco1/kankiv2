import type { InterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, MIN_INTERSTITIAL_INTERVAL_MS } from './adConfig';
import { isGoogleMobileAdsSupported } from './adPlatform';

let interstitial: InterstitialAd | null = null;
let isLoaded = false;
let isLoading = false;
let lastShownTime = 0;
let isInitialized = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Uygulama açılışında Google Mobile Ads SDK'sını ilklendirir (GADMobileAds.sharedInstance().start)
 * ve ilk geçiş reklamını (ca-app-pub-9488860514529599/7666702520) belleğe önceden yükler.
 * Expo Go içindeyse çökmeden güvenle no-op yapar.
 */
export async function initMobileAds(): Promise<void> {
  if (!isGoogleMobileAdsSupported()) {
    return;
  }
  if (isInitialized) return;

  try {
    const mobileAds = require('react-native-google-mobile-ads').default;
    await mobileAds().initialize();
    isInitialized = true;
    preloadInterstitial();
  } catch (error) {
    console.warn('[AdService] MobileAds initialize note:', error);
  }
}

/**
 * Geçiş reklamını (InterstitialAd) arka planda önceden yükler.
 * Ad Unit ID: ca-app-pub-9488860514529599/7666702520
 */
export function preloadInterstitial(): void {
  if (!isGoogleMobileAdsSupported()) return;
  if (isLoaded || isLoading) return;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  try {
    isLoading = true;
    const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');

    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: false,
    });

    if (!ad) {
      isLoading = false;
      return;
    }

    interstitial = ad;

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
      unsubscribeLoaded();
      unsubscribeError();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
      isLoaded = false;
      isLoading = false;
      interstitial = null;
      unsubscribeLoaded();
      unsubscribeError();
      console.log('[AdService] Interstitial load note:', error?.message);
      // Ağ hatası durumunda 20 saniye sonra tekrar dene
      retryTimer = setTimeout(() => {
        retryTimer = null;
        preloadInterstitial();
      }, 20000);
    });

    ad.load();
  } catch (error) {
    isLoading = false;
    isLoaded = false;
    interstitial = null;
    console.warn('[AdService] preload error:', error);
  }
}

interface ShowInterstitialOptions {
  onClosed?: () => void;
  force?: boolean;
}

/**
 * Yüklü geçiş reklamını tam ekran olarak gösterir.
 *
 * - Cooldown süresine dikkat eder.
 * - Reklam kapandığında (CLOSED) veya hata verdiğinde (ERROR) onClosed callback'ini
 *   çağırarak kullanıcı akışını kesintisiz sürdürür ve bir sonraki reklamı önceden yükler.
 */
export async function showInterstitial(options?: ShowInterstitialOptions): Promise<boolean> {
  const { onClosed, force = false } = options || {};

  if (!isGoogleMobileAdsSupported()) {
    onClosed?.();
    return false;
  }

  const now = Date.now();
  const timeSinceLastAd = now - lastShownTime;

  if (!force && timeSinceLastAd < MIN_INTERSTITIAL_INTERVAL_MS) {
    onClosed?.();
    return false;
  }

  if (!interstitial || !isLoaded) {
    preloadInterstitial();
    onClosed?.();
    return false;
  }

  const currentAd = interstitial;

  try {
    const { AdEventType } = require('react-native-google-mobile-ads');
    let closedTriggered = false;

    const cleanupAndProceed = () => {
      if (closedTriggered) return;
      closedTriggered = true;
      lastShownTime = Date.now();
      isLoaded = false;
      interstitial = null;
      unsubscribeClosed();
      unsubscribeError();
      // Bir sonraki gösterim için yeni reklamı arka planda hazırla
      setTimeout(preloadInterstitial, 800);
      onClosed?.();
    };

    const unsubscribeClosed = currentAd.addAdEventListener(AdEventType.CLOSED, () => {
      cleanupAndProceed();
    });

    const unsubscribeError = currentAd.addAdEventListener(AdEventType.ERROR, () => {
      cleanupAndProceed();
    });

    await currentAd.show();
    return true;
  } catch (error) {
    console.warn('[AdService] showInterstitial note:', error);
    isLoaded = false;
    interstitial = null;
    preloadInterstitial();
    onClosed?.();
    return false;
  }
}
