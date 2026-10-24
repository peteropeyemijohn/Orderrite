import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

/** A soft grey block that gently pulses while content loads. */
export function Skeleton({ width = '100%', height = 16, radius }: { width?: DimensionValue; height?: DimensionValue; radius?: number }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(withRepeat(withTiming(0.5, { duration: theme.motion.pulse, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion, theme.motion.pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius ?? theme.radius.sm, backgroundColor: theme.colors.skeleton }, animatedStyle]}
    />
  );
}

/** Loading shape of a VendorCard. */
export function VendorCardSkeleton() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.card, theme.shadows.sm]}>
      <View style={{ aspectRatio: theme.imageRatios.cover }}>
        <Skeleton height="100%" radius={0} />
      </View>
      <View style={styles.body}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

/** Loading shape of the category tiles. */
export function CategoryGridSkeleton() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.grid}>
      <Skeleton height={140} radius={theme.radius.xl} />
      <View style={styles.row}>
        <View style={styles.half}>
          <Skeleton height={120} radius={theme.radius.xl} />
        </View>
        <View style={styles.half}>
          <Skeleton height={120} radius={theme.radius.xl} />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, overflow: 'hidden' },
    body: { padding: theme.spacing.md, gap: theme.spacing.xs },
    grid: { gap: theme.spacing.sm },
    row: { flexDirection: 'row', gap: theme.spacing.sm },
    half: { flex: 1 },
  });
