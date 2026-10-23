import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { en, type Category } from 'shared';
import { useAuth } from '@/auth/AuthProvider';
import { AppText } from '@/components/AppText';
import { CategoryGrid, type GridCategory } from '@/components/CategoryGrid';
import { Icon } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGridSkeleton, Skeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import { Screen } from '@/components/ui';
import { usePublicConfig } from '@/config/usePublicConfig';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

/**
 * Customer home. Driven by data from the API: the city name and which
 * categories are on come from the database (no city or category is written
 * in this screen). Restaurants arrive in Phase 4/5; until then an empty state.
 */
export function CustomerHomeScreen() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const { user } = useAuth();
  const { state, reload } = usePublicConfig();
  const [notice, setNotice] = useState<string | null>(null);
  const hideNotice = useCallback(() => setNotice(null), []);

  const city = state.status === 'ready' ? state.config.city : undefined;

  const onCategory = (category: GridCategory) => {
    const cityName = city?.name ?? '';
    setNotice(
      category.enabled
        ? en.customerHome.noRestaurantsTitle(cityName)
        : en.categories.comingSoonTo(en.categories[category.key as Category], cityName),
    );
  };

  return (
    <Screen withTabBar>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {en.customerHome.greeting(user?.name)}
        </AppText>
        {state.status === 'loading' ? (
          <Skeleton width="50%" height={18} />
        ) : city ? (
          <View style={styles.cityRow}>
            <Icon name="location" size="sm" color={theme.colors.primary} />
            <AppText variant="label" tone="muted">
              {en.customerHome.deliveringIn}{' '}
            </AppText>
            <AppText variant="label">{city.name}</AppText>
          </View>
        ) : null}
      </View>

      <SearchBar placeholder={en.customerHome.searchPlaceholder} onPress={() => setNotice(en.customerHome.searchSoon)} />

      {state.status === 'error' && <ErrorState onRetry={reload} />}

      {state.status !== 'error' && (
        <View style={styles.section}>
          <AppText variant="heading">{en.customerHome.whatDoYouNeed}</AppText>
          {state.status === 'loading' ? (
            <CategoryGridSkeleton />
          ) : city ? (
            <CategoryGrid categories={city.categories} onPress={onCategory} />
          ) : (
            <EmptyState icon="map-outline" title={en.customerHome.noCityTitle} body={en.customerHome.noCityBody} />
          )}
          {notice && <Notice message={notice} onHide={hideNotice} />}
        </View>
      )}

      {city && (
        <View style={styles.section}>
          <AppText variant="heading">{en.customerHome.nearYou}</AppText>
          <EmptyState icon="restaurant-outline" title={en.customerHome.noRestaurantsTitle(city.name)} body={en.customerHome.noRestaurantsBody} />
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: { gap: theme.spacing.xxs, marginTop: theme.spacing.xs },
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs },
    section: { gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  });
