import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { en } from 'shared';
import { AppText } from '@/components/AppText';
import { keepNavigationBarButtonsDark, setNavigationBarButtons } from '@/theme/navigationBar';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { appStartedAt, isStartupReady, markStartupReady, onStartupReady } from './startupReady';

const splashMark = require('../../assets/images/splash-icon.png');

/**
 * splash   the native violet splash is on top; this identical screen waits underneath
 * waking   the splash has faded into this screen, which shows the waking-up hint
 * leaving  this screen fades out into the app
 * gone     nothing left (the app is showing)
 */
type Phase = 'splash' | 'waking' | 'leaving' | 'gone';

/**
 * Covers the app from launch until the first screen is ready, so nobody sees a
 * white loading screen.
 *
 * - Ready within 3 s: the native splash simply fades out over the ready screen.
 * - Slower (the free server is waking up): the splash fades into this screen,
 *   which looks exactly the same (same violet, same mark at the same size and
 *   place), then the waking-up hint fades in below the mark. When the server
 *   answers, this screen fades out into the app.
 * - Reduce Motion: every fade becomes an instant switch.
 *
 * Android buttons: white over the violet, dark again when this screen goes
 * (set at the start and end of the fade, and once more a second later).
 *
 * Not wrapped in `Screen` on purpose: the mark must be centred on the whole
 * display (like the native splash), not inside the safe area.
 */
export function StartupScreen() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const { startup } = theme;
  const reduceMotion = useReducedMotion();
  // `phase` draws the screen; `phaseRef` is what the timers and callbacks below read.
  const [phase, setPhase] = useState<Phase>('splash');
  const phaseRef = useRef<Phase>('splash');
  const reduceMotionRef = useRef(reduceMotion);
  const opacity = useSharedValue(1);
  const hintOpacity = useSharedValue(0);

  // How the native splash leaves. Android always fades and only reads the duration;
  // iPhone also needs fade: true. Reduce Motion: no fade.
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
    SplashScreen.setOptions({ duration: reduceMotion ? 0 : startup.fade, fade: !reduceMotion });
  }, [reduceMotion, startup.fade]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let frame = 0;
    const go = (next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
    };

    // The end, on every path: this screen is gone. Hide the native splash once the
    // app has drawn a frame (fast path; harmless if already hidden), and make sure
    // the Android buttons end up dark (now, after the splash, and a second later).
    const finish = () => {
      go('gone');
      keepNavigationBarButtonsDark();
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => void SplashScreen.hideAsync().finally(keepNavigationBarButtonsDark));
      });
      timers.push(setTimeout(keepNavigationBarButtonsDark, 1000));
    };

    // Moves to the next step when the app becomes ready or the 3 s hold is over.
    const advance = () => {
      const ready = isStartupReady();
      if (phaseRef.current === 'splash') {
        if (ready) {
          // Fast path: the native splash fades straight into the app.
          finish();
        } else if (Date.now() - appStartedAt >= startup.holdBeforeHint) {
          // Slow path: the splash fades into this identical screen, then the hint appears.
          go('waking');
          hintOpacity.set(reduceMotionRef.current ? 1 : withTiming(1, { duration: startup.hintFade }));
          void SplashScreen.hideAsync().then(() => {
            // White buttons on violet, unless we're already on the way out.
            if (phaseRef.current === 'waking') setNavigationBarButtons('white');
          });
        }
      } else if (phaseRef.current === 'waking' && ready) {
        go('leaving');
        keepNavigationBarButtonsDark();
        if (reduceMotionRef.current) {
          finish();
        } else {
          opacity.set(withTiming(0, { duration: startup.fade, easing: Easing.out(Easing.cubic) }));
          timers.push(setTimeout(finish, startup.fade));
        }
      }
    };

    const unsubscribe = onStartupReady(advance);
    const sinceStart = Date.now() - appStartedAt;
    timers.push(setTimeout(advance, Math.max(0, startup.holdBeforeHint - sinceStart)));
    // Safety net: never stay violet for good, whatever happens.
    timers.push(setTimeout(markStartupReady, Math.max(0, startup.maxWait - sinceStart)));
    // The first screen may already be ready (its effects run before this one).
    timers.push(setTimeout(advance, 0));

    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      keepNavigationBarButtonsDark();
    };
  }, [opacity, hintOpacity, startup]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  if (phase === 'gone') return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, fadeStyle]} pointerEvents={phase === 'leaving' ? 'none' : 'auto'}>
      {/* White status bar icons on violet; the screens below set their own again when this goes. */}
      <StatusBar style="light" />
      <Image source={splashMark} contentFit="contain" style={styles.mark} accessible={false} />
      <View style={styles.hintBox}>
        {phase !== 'splash' && (
          <Animated.View style={hintStyle}>
            <AppText tone="onPrimary" align="center" accessibilityLiveRegion="polite">
              {en.common.serverWaking}
            </AppText>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: { backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    mark: { width: theme.startup.markSize, height: theme.startup.markSize },
    // Just below the mark, without moving it off centre.
    hintBox: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      marginTop: theme.startup.markSize / 2 + theme.spacing.xl,
      paddingHorizontal: theme.screenPadding,
    },
  });
