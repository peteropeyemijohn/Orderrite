import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

// One element does both jobs (touch + animation), so layout styles such as
// flex: 1 apply to the element its parent actually lays out. (Phase 3 bug:
// the style sat on an inner view, so tabs shrank to their text.)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A pressable area that shrinks very slightly with a soft spring when pressed.
 * Respects the phone's "Reduce Motion" setting.
 */
export function PressableScale({
  children,
  style,
  ...props
}: Omit<PressableProps, 'style' | 'children'> & { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      onPressIn={(event) => {
        if (!reduceMotion) scale.set(withSpring(theme.motion.pressScale, theme.motion.spring));
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, theme.motion.spring));
        props.onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
