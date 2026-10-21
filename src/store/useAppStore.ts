import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ENABLED_CATEGORIES } from '@/data/categories';
import type {
  CategoryId,
  NotificationMode,
  NotificationSettings,
  ScheduledEntry,
  ThemeId,
  ThemePreference,
} from '@/types';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  mode: 'random',
  windowStart: { hour: 9, minute: 0 },
  windowEnd: { hour: 22, minute: 0 },
  perDay: 3,
  fixedTimes: [
    { hour: 8, minute: 30 },
    { hour: 13, minute: 0 },
    { hour: 21, minute: 0 },
  ],
  activeDays: [0, 1, 2, 3, 4, 5, 6],
};

const MAX_RECENT = 30; // tekrarı önlemek için hatırlanan son söz sayısı
const MAX_DELIVERED_LOG = 60; // ana ekranda gösterilecek geçmiş bildirimler

interface AppState {
  userName: string;
  hasCompletedOnboarding: boolean;
  themePreference: ThemePreference;
  enabledCategories: CategoryId[];
  favorites: string[];
  notification: NotificationSettings;
  /** Planlanmış + teslim edilmiş bildirimlerin kaydı (fireAt'e göre sıralı) */
  scheduleLog: ScheduledEntry[];
  recentQuoteIds: string[];

  setUserName: (userName: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setThemePreference: (p: ThemePreference) => void;
  toggleCategory: (id: CategoryId) => void;
  setEnabledCategories: (cats: CategoryId[]) => void;
  toggleFavorite: (quoteId: string) => void;
  updateNotification: (patch: Partial<NotificationSettings>) => void;
  /** Yeni plan kaydedilir; geçmişte kalan (teslim edilmiş) kayıtlar korunur */
  replaceUpcoming: (entries: ScheduledEntry[]) => void;
  pushRecent: (ids: string[]) => void;
  completeOnboarding: (params: {
    userName: string;
    theme: ThemeId;
    categories: CategoryId[];
    notificationMode: NotificationMode;
  }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      hasCompletedOnboarding: false,
      themePreference: 'vibrant',
      enabledCategories: DEFAULT_ENABLED_CATEGORIES,
      favorites: [],
      notification: DEFAULT_NOTIFICATION_SETTINGS,
      scheduleLog: [],
      recentQuoteIds: [],

      setUserName: (userName) => set({ userName: userName.trim() }),

      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),

      setThemePreference: (themePreference) => set({ themePreference }),

      toggleCategory: (id) =>
        set((s) => ({
          enabledCategories: s.enabledCategories.includes(id)
            ? s.enabledCategories.filter((c) => c !== id)
            : [...s.enabledCategories, id],
        })),

      setEnabledCategories: (enabledCategories) => set({ enabledCategories }),

      toggleFavorite: (quoteId) =>
        set((s) => ({
          favorites: s.favorites.includes(quoteId)
            ? s.favorites.filter((f) => f !== quoteId)
            : [quoteId, ...s.favorites],
        })),

      updateNotification: (patch) =>
        set((s) => ({ notification: { ...s.notification, ...patch } })),

      replaceUpcoming: (entries) =>
        set((s) => {
          const now = Date.now();
          const delivered = s.scheduleLog
            .filter((e) => e.fireAt <= now)
            .slice(-MAX_DELIVERED_LOG);
          return { scheduleLog: [...delivered, ...entries].sort((a, b) => a.fireAt - b.fireAt) };
        }),

      pushRecent: (ids) =>
        set((s) => ({ recentQuoteIds: [...s.recentQuoteIds, ...ids].slice(-MAX_RECENT) })),

      completeOnboarding: ({ userName, theme, categories, notificationMode }) =>
        set((s) => ({
          userName: userName.trim(),
          themePreference: theme,
          enabledCategories: categories.length > 0 ? categories : DEFAULT_ENABLED_CATEGORIES,
          notification: {
            ...s.notification,
            mode: notificationMode,
            enabled: true,
          },
          hasCompletedOnboarding: true,
        })),
    }),
    {
      name: 'kanki-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        userName,
        hasCompletedOnboarding,
        themePreference,
        enabledCategories,
        favorites,
        notification,
        scheduleLog,
        recentQuoteIds,
      }) => ({
        userName,
        hasCompletedOnboarding,
        themePreference,
        enabledCategories,
        favorites,
        notification,
        scheduleLog,
        recentQuoteIds,
      }),
    },
  ),
);
