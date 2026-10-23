import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppImage } from './AppImage';
import { AppText } from './AppText';
import { Card } from './Card';
import { Icon } from './Icon';
import { PromoBadge } from './PromoBadge';

/** A restaurant or shop in a list: big photo, name and the key facts. */
export function VendorCard({
  name,
  imageUri,
  placeholder,
  subtitle,
  meta,
  rating,
  promo,
  closedLabel,
  onPress,
}: {
  name: string;
  imageUri?: string | null;
  placeholder?: { blurhash: string } | { uri: string };
  /** e.g. cuisine: "Grill · Rice" */
  subtitle?: string;
  /** Already formatted facts, e.g. ["20–30 min", "₦500 delivery"] */
  meta: string[];
  rating?: number;
  promo?: string;
  /** Shown over the photo when the vendor is closed */
  closedLabel?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Card onPress={onPress} padded={false} accessibilityLabel={[name, subtitle, ...meta, promo].filter(Boolean).join(', ')}>
      <View>
        <AppImage uri={imageUri} placeholder={placeholder} ratio="cover" rounded={false} style={closedLabel && styles.closedImage} />
        {promo && (
          <View style={styles.badge}>
            <PromoBadge label={promo} />
          </View>
        )}
        {closedLabel && (
          <View style={styles.closed}>
            <AppText variant="label">{closedLabel}</AppText>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="heading" numberOfLines={1} style={styles.flex}>
            {name}
          </AppText>
          {rating !== undefined && (
            <View style={styles.rating}>
              <Icon name="star" size="sm" color={theme.colors.text} />
              <AppText variant="label">{rating.toFixed(1)}</AppText>
            </View>
          )}
        </View>
        {subtitle && (
          <AppText variant="label" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {meta.join('  ·  ')}
        </AppText>
      </View>
    </Card>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    body: { padding: theme.spacing.md, gap: theme.spacing.xxs },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    flex: { flex: 1 },
    rating: { flexDirection: 'row', alignItems: 'center', gap: theme.sizes.nudge },
    badge: { position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm },
    closedImage: { opacity: 0.5 },
    closed: {
      position: 'absolute',
      alignSelf: 'center',
      top: '40%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xxs,
    },
  });
