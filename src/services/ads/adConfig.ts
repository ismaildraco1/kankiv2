import { Platform } from 'react-native';

/**
 * Google AdMob Gerçek (Production) Uygulama ve Reklam Birimi Yapılandırması
 *
 * Uygulama Kimliği (App ID): ca-app-pub-9488860514529599~1287950257
 * Geçiş Reklamı Birimi (Interstitial Ad Unit ID): ca-app-pub-9488860514529599/7666702520
 */
export const ADMOB_APP_IDS = {
  ios: 'ca-app-pub-9488860514529599~1287950257',
  android: 'ca-app-pub-9488860514529599~1287950257',
} as const;

/**
 * Test modu: true iken Google'ın herkese açık test reklam birimi kullanılır
 * (TestFlight / geliştirme denemelerinde kendi canlı reklamına tıklayıp AdMob
 * hesabını riske atmamak için). Mağaza yayını öncesi false yapılmalıdır.
 */
export const USE_TEST_ADS = false;

/** Google'ın resmi test geçiş reklamı birimi (iOS ve Android için aynı) */
const TEST_INTERSTITIAL_UNIT = 'ca-app-pub-3940256099942544/1033173712';

/** Gerçek Geçiş (Interstitial) Reklam Birimi Kimlikleri */
export const PRODUCTION_AD_UNITS = {
  interstitial: {
    ios: 'ca-app-pub-9488860514529599/7666702520',
    android: 'ca-app-pub-9488860514529599/7666702520',
  },
} as const;

export const AD_UNIT_IDS = {
  interstitial: USE_TEST_ADS
    ? TEST_INTERSTITIAL_UNIT
    : (Platform.select({
        ios: PRODUCTION_AD_UNITS.interstitial.ios,
        android: PRODUCTION_AD_UNITS.interstitial.android,
        default: PRODUCTION_AD_UNITS.interstitial.ios,
      }) as string),
};

/**
 * Kullanıcı deneyimini korumak ve AdMob politika ihlallerini (sık reklam gösterimi)
 * önlemek için iki geçiş reklamı arasındaki minimum bekleme süresi (25 saniye).
 */
export const MIN_INTERSTITIAL_INTERVAL_MS = 25000;
