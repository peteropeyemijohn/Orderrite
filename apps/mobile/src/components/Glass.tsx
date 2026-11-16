import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { useReduceTransparency } from '@/theme/useReduceTransparency';

/**
 * A "glass" pill for chips on photos (rating, delivery time, "Closed"): a smoky
 * see-through tint, a thin light border, a soft highlight along the top and a
 * soft shadow. No blur package needed. Text inside should be white
 * (AppText style={{ color: theme.glass.text }}).
 *
 * When the phone asks for less transparency (or `solid` is set), it becomes a
 * plain solid pill with the same shape.
 */
export function Glass({ children, solid, style }: { children: ReactNode; solid?: boolean; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles(makeStyles);
  const reduceTransparency = useReduceTransparency();
  const opaque = solid ?? reduceTransparency;
  return (
    // Outer view: the shadow. Inner view: the fill, clipped to the pill shape.
    <View style={[styles.shadow, style]}>
      <View style={[styles.fill, opaque ? styles.solid : styles.tint]}>
        {!opaque && <View pointerEvents="none" style={styles.highlight} />}
        {children}
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    shadow: { alignSelf: 'flex-start', borderRadius: theme.radius.pill, ...theme.shadows.sm },
    fill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      overflow: 'hidden',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    tint: { backgroundColor: theme.glass.tint, borderWidth: theme.sizes.glassBorder, borderColor: theme.glass.border },
    solid: { backgroundColor: theme.glass.solid, borderWidth: theme.sizes.glassBorder, borderColor: theme.glass.solid },
    // Fades from a faint white at the top edge to nothing by mid-height.
    highlight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', experimental_backgroundImage: theme.glass.highlight },
  });
