import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** A short friendly message that fades in and disappears by itself (e.g. "Coming soon"). */
export function Notice({ message, onHide, durationMs = 3000 }: { message: string; onHide: () => void; durationMs?: number }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  useEffect(() => {
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [message, onHide, durationMs]);
  return (
    <Animated.View
      entering={FadeIn.duration(theme.motion.duration.normal)}
      exiting={FadeOut.duration(theme.motion.duration.fast)}
      style={styles.notice}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Icon name="time-outline" size="md" color={theme.colors.primary} />
      <AppText variant="label" tone="primary" style={styles.text}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
    text: { flexShrink: 1 },
  });
