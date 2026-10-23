import { StyleSheet, View } from 'react-native';
import { en } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

/** Friendly "nothing here yet" message with one optional action. */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.circle, { backgroundColor: theme.colors.primarySoft }]}>
        <Icon name={icon} size="xl" color={theme.colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {body && (
        <AppText tone="muted" align="center">
          {body}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      )}
    </View>
  );
}

/** Friendly error message with a "Try again" button. */
export function ErrorState({ title, body, onRetry }: { title?: string; body?: string; onRetry: () => void }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.circle, { backgroundColor: theme.colors.dangerSoft }]}>
        <Icon name="cloud-offline-outline" size="xl" color={theme.colors.danger} />
      </View>
      <AppText variant="heading" align="center">
        {title ?? en.states.errorTitle}
      </AppText>
      <AppText tone="muted" align="center">
        {body ?? en.states.errorBody}
      </AppText>
      <View style={styles.action}>
        <Button label={en.common.retry} onPress={onRetry} variant="secondary" icon="refresh" fullWidth={false} />
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xxl, paddingHorizontal: theme.spacing.md },
    circle: { width: theme.sizes.stateCircle, height: theme.sizes.stateCircle, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
    action: { marginTop: theme.spacing.sm },
  });
