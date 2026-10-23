import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

export type TextVariant = keyof Theme['text'];
export type TextTone = 'default' | 'muted' | 'subtle' | 'primary' | 'onPrimary' | 'danger' | 'success';

/** All text in the app goes through this, so fonts and colours come from the theme. */
export function AppText({
  variant = 'body',
  tone = 'default',
  align,
  style,
  ...props
}: TextProps & { variant?: TextVariant; tone?: TextTone; align?: 'left' | 'center' | 'right' }) {
  const theme = useTheme();
  const colorByTone: Record<TextTone, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    subtle: theme.colors.textSubtle,
    primary: theme.colors.primary,
    onPrimary: theme.colors.onPrimary,
    danger: theme.colors.danger,
    success: theme.colors.success,
  };
  return <Text {...props} style={[theme.text[variant], { color: colorByTone[tone], textAlign: align }, style]} />;
}
