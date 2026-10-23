import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { PressableScale } from './PressableScale';

/** White card, radius 16, soft shadow. Tappable when onPress is given. */
export function Card({
  children,
  onPress,
  padded = true,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const cardStyle = [styles.card, theme.shadows.md, padded && styles.padded, style];
  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={cardStyle}>
        {children}
      </PressableScale>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, overflow: 'hidden' },
    padded: { padding: theme.spacing.md, gap: theme.spacing.xs },
  });
