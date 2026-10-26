// Screen-level building blocks: the shared Screen wrapper, inputs, banners,
// and full-screen loading / error views. All values come from the theme.
import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { en } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { ErrorState } from './States';

/**
 * How the screen makes room for the keyboard. "padding" adds space at the
 * bottom equal to the keyboard's height. The app draws behind Android's
 * system bars (edge-to-edge), so Android needs this too, not only iPhone.
 * Tested on iPhone and Android (Phase 2b): no double gap.
 */
const KEYBOARD_BEHAVIOR = 'padding';

/**
 * The wrapper for every screen:
 * - keeps content clear of the status bar, notch, home bar (iPhone) and
 *   navigation bar (Android), using the device's safe area;
 * - moves content up when the keyboard opens;
 * - scrolls when the content is taller than the screen (small phones, large text).
 * `centered` puts short content (loading, errors) in the middle of the screen.
 * `withTabBar` leaves the bottom edge to the tab bar, which handles it itself.
 * `hero` lets the first child (e.g. a coloured hero) reach up behind the status
 * bar; that child adds the top inset itself. No outer padding in this mode.
 */
export function Screen({
  children,
  centered,
  withTabBar,
  hero,
}: {
  children: ReactNode;
  centered?: boolean;
  withTabBar?: boolean;
  hero?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const edges: Edge[] = hero ? ['bottom', 'left', 'right'] : withTabBar ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right'];
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={KEYBOARD_BEHAVIOR}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={hero ? styles.heroScreen : [styles.screen, withTabBar && styles.withTabBar, centered && styles.centered]}
          // A tap on a button while the keyboard is open works on the first tap.
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Large screen title. */
export function Title({ children }: { children: ReactNode }) {
  return (
    <AppText variant="title" accessibilityRole="header">
      {children}
    </AppText>
  );
}

/** Body text. `muted` for secondary information. */
export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <AppText tone={muted ? 'muted' : 'default'}>{children}</AppText>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <AppText tone="danger" variant="label" accessibilityRole="alert">
      {children}
    </AppText>
  );
}

/** Text field. `label` is shown above it; leave it out when a row-level label is shown instead. */
export function Input(props: TextInputProps & { label?: string }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      {props.label && (
        <AppText variant="label" tone="muted">
          {props.label}
        </AppText>
      )}
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? props.label}
        placeholderTextColor={theme.colors.textSubtle}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[theme.text.body, styles.input, focused && { borderColor: theme.colors.primary }, props.style]}
      />
    </View>
  );
}

/** Loading state. After a few seconds, explains that the server may be waking up. */
export function LoadingView() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Screen centered>
      <View style={styles.centerSelf}>
        <Spinner size="lg" color={theme.colors.primary} />
      </View>
      <AppText tone="muted" align="center">
        {slow ? en.common.firstLoadSlow : en.common.loading}
      </AppText>
    </Screen>
  );
}

/** Full-screen friendly error state with a retry button. */
export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen centered>
      <ErrorState body={message} onRetry={onRetry} />
    </Screen>
  );
}

/** Shown on the demo deployment, so visitors know it is a test version. */
export function DemoBanner({ code }: { code: string }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.demo} accessibilityRole="text">
      <Icon name="flask-outline" size="md" color={theme.colors.primary} />
      <AppText variant="label" tone="primary" style={styles.flexShrink}>
        {en.auth.demoBanner(code)}
      </AppText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    flexShrink: { flexShrink: 1 },
    // flexGrow (not flex) lets short screens fill the height and tall screens scroll.
    screen: {
      flexGrow: 1,
      paddingHorizontal: theme.screenPadding,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.screenBottom,
      gap: theme.spacing.md,
    },
    withTabBar: { paddingBottom: theme.spacing.xl },
    heroScreen: { flexGrow: 1 },
    centered: { justifyContent: 'center' },
    centerSelf: { alignSelf: 'center' },
    inputGroup: { gap: theme.spacing.xxs },
    input: {
      minHeight: Math.max(theme.minTap, theme.sizes.input),
      borderWidth: theme.sizes.inputBorder,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    demo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
  });
