import { StyleSheet, View } from 'react-native';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';

/** Red pill for promotions. Red is reserved for promos and alerts only. */
export function PromoBadge({ label, variant = 'solid' }: { label: string; variant?: 'solid' | 'soft' }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.badge, variant === 'solid' ? styles.solid : styles.soft]}>
      <AppText variant="caption" tone={variant === 'solid' ? 'default' : 'danger'} style={variant === 'solid' && styles.solidText}>
        {label}
      </AppText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: { alignSelf: 'flex-start', borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xxs },
    solid: { backgroundColor: theme.colors.danger },
    soft: { backgroundColor: theme.colors.dangerSoft },
    solidText: { color: theme.colors.onDanger, fontFamily: theme.text.label.fontFamily },
  });
