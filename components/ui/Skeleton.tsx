import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

/** Bloco com shimmer sutil (DESIGN-SYSTEM.md §6) — reanimated seria overkill pra uma opacidade indo e voltando. */
export function Skeleton({ style, className }: { style?: ViewStyle; className?: string }) {
  const opacidade = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacidade]);

  return (
    <Animated.View
      className={`bg-rowBorder rounded-sm ${className ?? ''}`}
      style={[{ opacity: opacidade }, style]}
    />
  );
}
