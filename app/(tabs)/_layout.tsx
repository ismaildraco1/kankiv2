import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/GlassTabBar';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: t.background[0] },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Bugün' }} />
      <Tabs.Screen name="categories" options={{ title: 'Setler' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoriler' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ayarlar' }} />
    </Tabs>
  );
}
