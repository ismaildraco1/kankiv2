
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const QUOTE_CHANNEL_ID = 'daily-quotes';

let configured = false;

/**
 * Uygulama başlarken bir kez çağrılır (app/_layout.tsx).
 * - Ön plandayken gelen bildirimlerin nasıl gösterileceğini belirler
 * - Android 8+ için bildirim kanalını oluşturur (Android 13+'ta izin
 *   diyaloğunun çıkabilmesi için en az bir kanal gerekir)
 */
export async function configureNotifications() {
  if (configured) return;
  configured = true;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(QUOTE_CHANNEL_ID, {
        name: 'Kanki',
        description: 'Seçtiğin setlerden rastgele sözler',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 120, 80, 120],
        lightColor: '#FFB59E',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  } catch (e) {
    console.log('[notifications] configureNotifications note:', e);
  }
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getPermissionState(): Promise<PermissionState> {
  try {
    const { status, ios } = await Notifications.getPermissionsAsync();
    if (ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
    return status as PermissionState;
  } catch (e) {
    console.log('[notifications] getPermissionState note:', e);
    return 'undetermined';
  }
}

/**
 * İzni ister. Kullanıcı daha önce reddettiyse sistem diyaloğu tekrar
 * çıkmaz — bu durumda UI, kullanıcıyı Ayarlar'a yönlendirmelidir.
 */
export async function requestPermission(): Promise<PermissionState> {
  try {
    if (!Device.isDevice) {
      console.log('[notifications] Fiziksel cihaz değil — davranış farklı olabilir.');
    }
    await configureNotifications();

    const current = await getPermissionState();
    if (current === 'granted') return current;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return status as PermissionState;
  } catch (e) {
    console.log('[notifications] requestPermission note:', e);
    return 'undetermined';
  }
}
