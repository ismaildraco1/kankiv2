import * as Haptics from 'expo-haptics';
import { useRef, type PropsWithChildren } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

/**
 * Basıldığında yay gibi küçülen, haptic geri bildirimli buton.
 * flex stillerini dıştaki Pressable'a otomatik aktararak satır (row) düzenlerinde
 * butonların sıkışıp sıfır genişliğe düşmesini veya metinlerin kırpılmasını engeller.
 */
export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.96,
  haptic = true,
  onPress,
  ...rest
}: PropsWithChildren<Props>) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const flat = StyleSheet.flatten(style);
  const flexStyle = flat && typeof flat.flex === 'number' ? { flex: flat.flex } : undefined;

  return (
    <Pressable
      {...rest}
      style={[flexStyle, containerStyle]}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
