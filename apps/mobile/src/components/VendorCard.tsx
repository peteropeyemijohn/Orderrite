import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppImage } from './AppImage';
import { AppText } from './AppText';
import { Card } from './Card';
import { Glass } from './Glass';
import { Icon } from './Icon';
import { PromoBadge } from './PromoBadge';

/**
 * A restaurant or shop in a list: big photo, name and the key facts. Rating,
 * delivery time and "Closed" sit on the photo as Glass chips.
 */
export function VendorCard({
  name,
  imageUri,
  placeholder,
  subtitle,
  meta,
  etaLabel,
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
  /** Already formatted facts below the name, e.g. ["₦500 delivery"] */
  meta: string[];
  /** Delivery time shown on the photo, e.g. "20–30 min" */
  etaLabel?: string;
  rating?: number;
  promo?: string;
  /** Shown over the photo when the vendor is closed, e.g. "Closed · Opens at 8:00 AM" */
  closedLabel?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Card onPress={onPress} padded={false} accessibilityLabel={[name, subtitle, closedLabel, etaLabel, ...meta, promo].filter(Boolean).join(', ')}>
      <View>
        <AppImage uri={imageUri} placeholder={placeholder} ratio="cover" rounded={false} style={closedLabel && styles.closedImage} />
        {promo && (
          <View style={styles.badge}>
            <PromoBadge label={promo} />
          </View>
        )}
        {rating !== undefined && (
          <Glass style={styles.rating}>
            <Icon name="star" size="sm" color={theme.glass.text} />
            <AppText variant="label" style={styles.onGlass}>
              {rating.toFixed(1)}
            </AppText>
          </Glass>
        )}
        {etaLabel && (
          <Glass style={styles.eta}>
            <Icon name="time-outline" size="sm" color={theme.glass.text} />
            <AppText variant="label" style={styles.onGlass}>
              {etaLabel}
            </AppText>
          </Glass>
        )}
        {closedLabel && (
          <Glass style={styles.closed}>
            <AppText variant="label" style={styles.onGlass}>
              {closedLabel}
            </AppText>
          </Glass>
        )}
      </View>
      <View style={styles.body}>
        <AppText variant="heading" numberOfLines={1}>
          {name}
        </AppText>
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
    badge: { position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm },
    rating: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
    eta: { position: 'absolute', bottom: theme.spacing.sm, left: theme.spacing.sm },
    onGlass: { color: theme.glass.text },
    closedImage: { opacity: 0.5 },
    closed: { position: 'absolute', alignSelf: 'center', top: '40%' },
  });
