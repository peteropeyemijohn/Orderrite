import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Button, type ButtonVariant } from './Button';

/**
 * A small "are you sure?" pop-up. Built in the app (not the phone's own alert)
 * so it looks like Orderrite and also works in a browser preview.
 * Cancel, a tap outside the card, and Android's back button all close it.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const styles = useStyles(makeStyles);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android back button: same as Cancel.
      onRequestClose={onCancel}
      // Cover the status and navigation bars too (the app is edge-to-edge).
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessible={false} />
        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          {body && <AppText tone="muted">{body}</AppText>}
          <View style={styles.actions}>
            <Button variant="secondary" label={cancelLabel} onPress={onCancel} disabled={loading} />
            <Button variant={confirmVariant} label={confirmLabel} onPress={onConfirm} loading={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.scrim,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.screenPadding,
    },
    card: {
      width: '100%',
      maxWidth: theme.sizes.dialogMaxWidth,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.md,
    },
    actions: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  });
