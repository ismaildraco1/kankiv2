import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * Aurora Mesh Ambient Lighting:
 * 4 farklı koordinatta yavaşça nefes alan ve süzülen renk küreleri.
 * Donanım hızlandırmalı (useNativeDriver: true) 60fps akıcı animasyon.
 */
export function GradientBackground() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Temel derin arka plan degrade katmanı */}
      <LinearGradient
        colors={t.background}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 1. Küre: Sol üst ametist/mor aurası */}
      <AuroraNode
        color={t.orbs[0]}
        size={width * 1.25}
        startX={-width * 0.4}
        startY={-height * 0.15}
        travelX={width * 0.15}
        travelY={height * 0.1}
        duration={16000}
      />

      {/* 2. Küre: Sağ orta neon gül/şafak aurası */}
      <AuroraNode
        color={t.orbs[1]}
        size={width * 1.1}
        startX={width * 0.42}
        startY={height * 0.22}
        travelX={-width * 0.12}
        travelY={height * 0.08}
        duration={21000}
      />

      {/* 3. Küre: Sol alt okyanus/siyan aurası */}
      <AuroraNode
        color={t.orbs[2]}
        size={width * 1.2}
        startX={-width * 0.3}
        startY={height * 0.58}
        travelX={width * 0.16}
        travelY={-height * 0.1}
        duration={18000}
      />

      {/* 4. Küre: Sağ alt sıcak amber aurası */}
      <AuroraNode
        color={t.orbs[3]}
        size={width * 0.95}
        startX={width * 0.35}
        startY={height * 0.72}
        travelX={-width * 0.14}
        travelY={-height * 0.06}
        duration={24000}
      />

      {/* İnce karartma / odak vinyeti (okunabilirlik garantisi) */}
      <LinearGradient
        colors={[
          t.scheme === 'dark' ? 'rgba(7,6,14,0.15)' : 'rgba(250,247,242,0.1)',
          'transparent',
          t.scheme === 'dark' ? 'rgba(7,6,14,0.45)' : 'rgba(250,247,242,0.3)',
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function AuroraNode({
  color,
  size,
  startX,
  startY,
  travelX,
  travelY,
  duration,
}: {
  color: string;
  size: number;
  startX: number;
  startY: number;
  travelX: number;
  travelY: number;
  duration: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, travelX] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, travelY] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      <LinearGradient
        colors={[color, 'rgba(0,0,0,0)']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}
