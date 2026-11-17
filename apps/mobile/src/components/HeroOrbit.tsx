import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import type { HeroOrbitItem } from './heroOrbitItems';

/**
 * Photos slowly circling whatever is in the middle (the wordmark), each one
 * bobbing gently. One shared clock drives everything on the UI thread, and the
 * photos only move (no layout changes), so it stays smooth on slower phones.
 *
 * It pauses when the screen is not in front or the app is in the background,
 * and holds still in a neat ring when the phone's Reduce Motion is on.
 */
export function HeroOrbit({ items, children }: { items: HeroOrbitItem[]; children: ReactNode }) {
  const { orbit } = useTheme();
  const styles = useStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  // 0 → 1 is one full turn; it keeps counting up across pauses.
  const turns = useSharedValue(0);
  const [width, setWidth] = useState(0);
  const [focused, setFocused] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => sub.remove();
  }, []);

  const running = focused && appActive && !reduceMotion;
  useEffect(() => {
    if (!running) {
      cancelAnimation(turns);
      return;
    }
    // Continue from where it stopped: each repeat is exactly one turn.
    const from = turns.get();
    turns.set(withRepeat(withTiming(from + 1, { duration: orbit.turnDuration, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(turns);
  }, [running, turns, orbit.turnDuration]);

  // Narrow phones: shrink the oval so photos never touch the screen edge.
  const radiusX = Math.min(orbit.ringRadiusX, width / 2 - orbit.itemSize / 2 - orbit.edgeGap);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.stage} onLayout={onLayout}>
      {/* Decorative only: hidden from screen readers. */}
      <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
        {width > 0 &&
          items.map((source, index) => (
            <OrbitItem key={index} source={source} index={index} count={items.length} turns={turns} radiusX={radiusX} />
          ))}
      </View>
      {children}
    </View>
  );
}

function OrbitItem({
  source,
  index,
  count,
  turns,
  radiusX,
}: {
  source: HeroOrbitItem;
  index: number;
  count: number;
  turns: SharedValue<number>;
  radiusX: number;
}) {
  const { orbit } = useTheme();
  const styles = useStyles(makeStyles);
  const animated = useAnimatedStyle(() => {
    const t = turns.get();
    // Evenly spaced around the oval, starting at the top.
    const angle = 2 * Math.PI * (t + index / count) - Math.PI / 2;
    // Each photo bobs out of step with its neighbours.
    const bob = Math.sin(2 * Math.PI * (t * orbit.bobsPerTurn + index / count)) * orbit.bobAmount;
    // 0 at the back (top of the oval), 1 at the front (bottom).
    const front = (1 + Math.sin(angle)) / 2;
    return {
      transform: [
        { translateX: radiusX * Math.cos(angle) },
        { translateY: orbit.ringRadiusY * Math.sin(angle) + bob },
        { scale: 1 - orbit.depthScale * (1 - front) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.item, animated]}>
      <Image source={source} contentFit="contain" style={styles.image} accessible={false} />
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    // Tall enough for the oval plus a photo at the top and bottom.
    stage: {
      alignSelf: 'stretch',
      height: theme.orbit.ringRadiusY * 2 + theme.orbit.itemSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Every photo starts at the centre; the animated transform moves it out.
    item: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: theme.orbit.itemSize,
      height: theme.orbit.itemSize,
      marginLeft: -theme.orbit.itemSize / 2,
      marginTop: -theme.orbit.itemSize / 2,
    },
    image: { width: '100%', height: '100%' },
  });
