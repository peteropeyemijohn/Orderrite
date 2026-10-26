import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  accessibilityHint?: string;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  // Loading keeps the full colour (with a spinner); disabled looks clearly grey.
  const { background, foreground, border } = disabled ? disabledColors(theme) : colorsFor(theme, variant);
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: background, borderColor: border, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        variant === 'primary' && !disabled && theme.shadows.sm,
      ]}
    >
      {loading ? (
        <Spinner color={foreground} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size="md" color={foreground} />}
          <AppText variant="bodyStrong" style={{ color: foreground }} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

function disabledColors(theme: Theme) {
  return { background: theme.colors.disabled, foreground: theme.colors.textSubtle, border: theme.colors.disabled };
}

function colorsFor(theme: Theme, variant: ButtonVariant) {
  const c = theme.colors;
  switch (variant) {
    case 'primary':
      return { background: c.primary, foreground: c.onPrimary, border: c.primary };
    case 'secondary':
      return { background: c.surface, foreground: c.text, border: c.border };
    case 'ghost':
      return { background: 'transparent', foreground: c.primary, border: 'transparent' };
    case 'danger':
      return { background: c.dangerSoft, foreground: c.danger, border: c.dangerSoft };
  }
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.radius.pill,
      borderWidth: theme.sizes.buttonBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    // Both sizes are taller than the 44 minimum tap size.
    md: { minHeight: Math.max(theme.minTap, theme.sizes.buttonMd) },
    lg: { minHeight: Math.max(theme.minTap, theme.sizes.buttonLg) },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  });
