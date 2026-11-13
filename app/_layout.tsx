// Arka plan görevi modül kapsamında tanımlanmalı → en üstte import
import '@/services/notifications/backgroundTask';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_400Regular_Italic, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ShareProvider } from '@/components/share/ShareProvider';
import { useAutoReschedule } from '@/hooks/useAutoReschedule';
import { useNotificationObserver } from '@/hooks/useNotificationObserver';
import { registerBackgroundRefill } from '@/services/notifications/backgroundTask';
import { configureNotifications, requestPermission } from '@/services/notifications/setup';
import { initMobileAds } from '@/services/ads/adService';
import { registerAndroidWidgetTask } from '@/services/widgets/android/widgetTaskHandler';
import { syncWidgets } from '@/services/widgets/syncWidgets';
import { useAppStore } from '@/store/useAppStore';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_600SemiBold,
  });
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    (async () => {
      await registerAndroidWidgetTask();
      await configureNotifications();
      await requestPermission();
      await registerBackgroundRefill();
      await syncWidgets();
      await initMobileAds();
    })().catch(console.warn);
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ShareProvider>
          <AppShell />
        </ShareProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: 'normal' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: 'bold' as const },
  heavy: { fontFamily: 'System', fontWeight: '900' as const },
};

function AppShell() {
  const t = useTheme();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  useNotificationObserver(true);
  useAutoReschedule(true);

  const navigationTheme = useMemo<ReactNavigation.Theme>(
    () => ({
      dark: t.scheme === 'dark',
      colors: {
        primary: t.accent,
        background: t.background[0],
        card: t.glassStrong,
        text: t.text,
        border: t.glassBorder,
        notification: t.danger,
      },
      fonts: defaultFonts,
    }),
    [t],
  );

  if (!hasCompletedOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background[0] }}>
        <StatusBar style={t.statusBar} />
        <OnboardingWizard />
      </View>
    );
  }

  return (
    <NavThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: t.background[0] }}>
        <StatusBar style={t.statusBar} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: t.background[0] },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="quote/[id]"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack>
      </View>
    </NavThemeProvider>
  );
}
