import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A loading spinner with a thicker line than the system one (which can't be
 * changed on Android): a ring with one transparent quarter, turning.
 * With Reduce Motion on, it turns more slowly instead of stopping (so it still
 * says "working").
 */
export function Spinner({ color, size = 'md' }: { color?: string; size?: 'md' | 'lg' }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const diameter = size === 'lg' ? theme.sizes.spinnerLarge : theme.sizes.spinner;
  const thickness = size === 'lg' ? theme.sizes.spinnerStrokeLarge : theme.sizes.spinnerStroke;
  const tint = color ?? theme.colors.primary;

  useEffect(() => {
    rotation.set(withRepeat(withTiming(360, { duration: reduceMotion ? 2400 : 800, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(rotation);
  }, [rotation, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <View accessibilityRole="progressbar" accessibilityState={{ busy: true }}>
      <Animated.View
        style={[
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            borderWidth: thickness,
            borderColor: tint,
            borderTopColor: 'transparent',
          },
          style,
        ]}
      />
    </View>
  );
}
