import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { IconName } from '@/types';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0] & {
  navigation?: any;
  emitter?: any;
  navigateToTab?: (routeKey: string) => void;
};

const ICONS: Record<string, [IconName, IconName]> = {
  index: ['sparkles-outline', 'sparkles'],
  categories: ['grid-outline', 'grid'],
  favorites: ['heart-outline', 'heart'],
  settings: ['options-outline', 'options'],
};

/** Ekranın altında yüzen lüks cam ada tab bar */
export function GlassTabBar(props: BottomTabBarProps) {
  const { state, descriptors } = props;
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { bottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          {
            borderColor: t.glassBorder,
            shadowColor: t.scheme === 'dark' ? '#000' : '#4C3077',
          },
        ]}
      >
        {/* Cam bulanıklığı */}
        <BlurView
          intensity={70}
          tint={t.blurTint}
          blurMethod={Platform.OS === 'android' ? 'none' : undefined}
          style={StyleSheet.absoluteFill}
        />

        {/* Taban dolgusu */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.glassStrong }]} />

        {/* Üst kenar kristal ışıltısı */}
        <LinearGradient
          colors={[t.glassGleam, 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topGleam}
        />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
          const label = (options.title ?? route.name) as string;

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              scaleTo={0.94}
              onPress={() => {
                const event = props.emitter?.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }) ??
                  props.navigation?.emit?.({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && (!event || !event.defaultPrevented)) {
                  if (props.navigateToTab) {
                    props.navigateToTab(route.key);
                  } else if (props.navigation) {
                    props.navigation.navigate(route.name, route.params);
                  }
                }
              }}
              style={styles.tabWrapper}
            >
              {focused ? (
                <LinearGradient
                  colors={t.accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePill}
                >
                  <Ionicons name={filled} size={18} color="#FFFFFF" />
                  <AppText
                    variant="label"
                    style={styles.activeText}
                  >
                    {label}
                  </AppText>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveItem}>
                  <Ionicons name={outline} size={20} color={t.textMuted} />
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  topGleam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  tabWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: radius.pill,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  activeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  inactiveItem: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
