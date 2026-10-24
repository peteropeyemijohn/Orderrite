import { StyleSheet, View } from 'react-native';
import type { Category } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppImage } from './AppImage';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

/** Our own simple icons per category (not copied from any other app). */
export const CATEGORY_ICONS: Record<Category, IconName> = {
  FOOD: 'restaurant',
  SHOPS: 'basket',
  PHARMACY: 'medkit',
  BEAUTY: 'sparkles',
  PACKAGE: 'cube',
};

/**
 * Big friendly tile for a category. Two styles to compare in Phase 3:
 * "icon" (icon on a tinted circle) and "photo" (photo with a label).
 * Categories that are off are softened, show a "Soon" label, and stay
 * tappable so the screen can explain they are coming soon.
 */
export function CategoryTile({
  category,
  label,
  enabled,
  onPress,
  variant = 'icon',
  size = 'regular',
  imageUri,
  soonLabel,
  offHint,
}: {
  category: Category;
  label: string;
  enabled: boolean;
  onPress: () => void;
  variant?: 'icon' | 'photo';
  size?: 'regular' | 'hero';
  imageUri?: string;
  soonLabel: string;
  offHint: string;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const hero = size === 'hero';
  // Each category has its own soft tint and icon colour; "Soon" tiles stay grey.
  const tint = theme.categoryColors[category];

  const soon = !enabled && (
    <View style={styles.soon}>
      <AppText variant="caption" tone="muted">
        {soonLabel}
      </AppText>
    </View>
  );

  const a11y = {
    accessibilityLabel: enabled ? label : `${label}, ${offHint}`,
    accessibilityState: { disabled: !enabled },
  };

  if (variant === 'photo') {
    return (
      <PressableScale onPress={onPress} {...a11y} style={[styles.photoTile, enabled && theme.shadows.md]}>
        <AppImage uri={imageUri} ratio={hero ? 'cover' : 'tile'} rounded={false} style={!enabled && styles.photoOff} />
        <View style={styles.photoLabel}>
          <AppText variant={hero ? 'heading' : 'label'} tone={enabled ? 'default' : 'muted'} numberOfLines={1}>
            {label}
          </AppText>
        </View>
        {soon}
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      {...a11y}
      style={[styles.iconTile, hero && styles.iconTileHero, enabled ? [styles.on, theme.shadows.md] : styles.off]}
    >
      <View style={[styles.circle, hero && styles.circleHero, { backgroundColor: enabled ? tint.soft : theme.colors.surface }]}>
        <Icon name={CATEGORY_ICONS[category]} size={hero ? 'xl' : 'lg'} color={enabled ? tint.icon : theme.colors.textSubtle} />
      </View>
      <AppText variant={hero ? 'title' : 'label'} tone={enabled ? 'default' : 'muted'} numberOfLines={2} style={styles.iconLabel}>
        {label}
      </AppText>
      {soon}
    </PressableScale>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    iconTile: {
      minHeight: Math.max(theme.minTap, theme.sizes.tile),
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    iconTileHero: { minHeight: theme.sizes.tileHero, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: theme.spacing.md },
    on: { backgroundColor: theme.colors.surface },
    off: { backgroundColor: theme.colors.surfaceMuted },
    circle: { width: theme.sizes.iconCircle, height: theme.sizes.iconCircle, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center' },
    circleHero: { width: theme.sizes.iconCircleLarge, height: theme.sizes.iconCircleLarge },
    iconLabel: { flexShrink: 1 },
    soon: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.sizes.nudge,
    },
    photoTile: { borderRadius: theme.radius.xl, overflow: 'hidden', backgroundColor: theme.colors.surfaceMuted, minHeight: theme.minTap },
    photoOff: { opacity: 0.45 },
    photoLabel: {
      position: 'absolute',
      left: theme.spacing.sm,
      bottom: theme.spacing.sm,
      maxWidth: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
  });
