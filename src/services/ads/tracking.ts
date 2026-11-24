import { AppState, Platform } from 'react-native';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** iOS, izin penceresini yalnızca uygulama ön plandayken gösterir; değilse sessizce yok sayar. */
function waitUntilActive(): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

/**
 * iOS App Tracking Transparency iznini ister (reklam kimliği / izleme için).
 * - Yalnızca iOS'ta ve henüz karar verilmemişse sorar.
 * - Başka bir sistem izin penceresi (bildirim) kapandıktan ve uygulama aktif olduktan sonra çağrılmalıdır.
 * - Reklam SDK'sı BU çağrıdan sonra başlatılır; böylece izin verilmeden izleme verisi toplanmaz.
 */
export async function requestTrackingPermission(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } = await import(
      'expo-tracking-transparency'
    );
    const current = await getTrackingPermissionsAsync();
    if (current.status !== 'undetermined' || !current.canAskAgain) return;

    await waitUntilActive();
    await delay(800); // açılış animasyonlarının bitmesini bekle; erken çağrı iOS'ta yutulabiliyor
    await requestTrackingPermissionsAsync();
  } catch (e) {
    console.warn('[tracking] ATT request failed', e);
  }
}
