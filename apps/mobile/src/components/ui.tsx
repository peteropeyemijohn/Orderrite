// Plain building blocks for Phase 2 screens. Phase 3 restyles these.
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { en } from 'shared';
import { plain } from '@/theme/plain';

/**
 * How the screen makes room for the keyboard. "padding" adds space at the
 * bottom equal to the keyboard's height. The app draws behind Android's
 * system bars (edge-to-edge), so Android needs this too, not only iPhone.
 */
const KEYBOARD_BEHAVIOR = 'padding';

/**
 * The wrapper for every screen:
 * - keeps content clear of the status bar, notch, home bar (iPhone) and
 *   navigation bar (Android), using the device's safe area;
 * - moves content up when the keyboard opens;
 * - scrolls when the content is taller than the screen (small phones, large text).
 * `centered` puts short content (loading, errors) in the middle of the screen.
 */
export function Screen({ children, centered }: { children: ReactNode; centered?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={KEYBOARD_BEHAVIOR}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.screen, centered && styles.centered]}
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

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text style={styles.error} accessibilityRole="alert">
      {children}
    </Text>
  );
}

export function Button({ label, onPress, disabled, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, variant === 'secondary' && styles.buttonSecondary, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps & { label: string }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput placeholderTextColor={plain.color.muted} {...props} style={[styles.input, props.style]} />
    </View>
  );
}

/** Loading state. After a few seconds, explains that the server may be waking up. */
export function LoadingView() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Screen centered>
      <ActivityIndicator size="large" color={plain.color.primary} />
      <Body muted>{slow ? en.common.firstLoadSlow : en.common.loading}</Body>
    </Screen>
  );
}

/** Friendly error state with a retry button. */
export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen centered>
      <ErrorText>{message}</ErrorText>
      <Button label={en.common.retry} onPress={onRetry} />
    </Screen>
  );
}

export function DemoBanner({ code }: { code: string }) {
  return (
    <View style={styles.demo}>
      <Text style={styles.demoText}>{en.auth.demoBanner(code)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: plain.color.background },
  flex: { flex: 1 },
  // flexGrow (not flex) lets short screens fill the height and tall screens scroll.
  screen: {
    flexGrow: 1,
    paddingHorizontal: plain.space.lg,
    paddingTop: plain.space.lg,
    paddingBottom: plain.space.bottom,
    gap: plain.space.md,
  },
  centered: { alignItems: 'stretch', justifyContent: 'center' },
  title: { fontSize: plain.font.title, fontWeight: '700', color: plain.color.text },
  body: { fontSize: plain.font.body, color: plain.color.text, textAlign: 'left' },
  muted: { color: plain.color.muted, textAlign: 'center' },
  error: { fontSize: plain.font.body, color: plain.color.error },
  button: { backgroundColor: plain.color.primary, borderRadius: plain.radius, paddingVertical: plain.space.md, alignItems: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: plain.color.border },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: plain.color.primaryText, fontSize: plain.font.body, fontWeight: '600' },
  buttonTextSecondary: { color: plain.color.text },
  inputGroup: { gap: plain.space.xs },
  label: { fontSize: plain.font.small, color: plain.color.muted },
  input: { borderWidth: 1, borderColor: plain.color.border, borderRadius: plain.radius, padding: plain.space.md, fontSize: plain.font.body, color: plain.color.text },
  demo: { backgroundColor: plain.color.demoBackground, borderRadius: plain.radius, padding: plain.space.md },
  demoText: { color: plain.color.demoText, fontWeight: '600' },
});
