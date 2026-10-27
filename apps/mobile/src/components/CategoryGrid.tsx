import { StyleSheet, View } from 'react-native';
import { en, type Category } from 'shared';
import { useStyles } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { CategoryTile } from './CategoryTile';

export interface GridCategory {
  key: Category;
  enabled: boolean;
  imageUri?: string;
}

/**
 * Lays out the city's categories from data: the first switched-on category is
 * a wide "hero" tile, the rest share a two-column grid in their fixed order.
 */
export function CategoryGrid({
  categories,
  onPress,
  variant = 'icon',
}: {
  categories: GridCategory[];
  onPress: (category: GridCategory) => void;
  variant?: 'icon' | 'photo';
}) {
  const styles = useStyles(makeStyles);
  const hero = categories.find((c) => c.enabled);
  const rest = categories.filter((c) => c !== hero);

  const tile = (category: GridCategory, size: 'hero' | 'regular') => (
    <CategoryTile
      key={category.key}
      category={category.key}
      label={en.categories[category.key]}
      subtitle={size === 'hero' ? en.categories.subtitles[category.key] : undefined}
      enabled={category.enabled}
      variant={variant}
      size={size}
      imageUri={category.imageUri}
      soonLabel={en.categories.soon}
      offHint={en.categories.offHint}
      onPress={() => onPress(category)}
    />
  );

  return (
    <View style={styles.grid}>
      {hero && tile(hero, 'hero')}
      <View style={styles.row}>
        {rest.map((category) => (
          <View key={category.key} style={styles.cell}>
            {tile(category, 'regular')}
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: { gap: theme.spacing.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    // Two columns: each cell is just under half the width (the gap takes the rest).
    cell: { flexBasis: '47%', flexGrow: 1 },
  });
