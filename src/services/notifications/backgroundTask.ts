import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { useAppStore } from '@/store/useAppStore';
import { refillIfNeeded } from './scheduler';

export const REFILL_TASK = 'kanki-refill-quotes';

/**
 * ÖNEMLİ: defineTask modül kapsamında (global) çağrılmalıdır; böylece
 * işletim sistemi uygulamayı arka planda uyandırdığında görev kayıtlı olur.
 * Bu dosya app/_layout.tsx içinde en üstte import edilir.
 */
TaskManager.defineTask(REFILL_TASK, async () => {
  try {
    // Arka plan bağlamında store'un AsyncStorage'dan yüklenmesini bekle
    await useAppStore.persist.rehydrate();
    await refillIfNeeded();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.warn('[background] refill failed', e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundRefill() {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

    const registered = await TaskManager.isTaskRegisteredAsync(REFILL_TASK);
    if (!registered) {
      // Sistem bunu minimum aralık olarak ele alır; iOS genelde gece çalıştırır.
      await BackgroundTask.registerTaskAsync(REFILL_TASK, { minimumInterval: 60 * 6 });
    }
  } catch (e) {
    console.warn('[background] registerBackgroundRefill warning:', e);
  }
}
