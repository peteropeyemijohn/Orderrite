// DEVELOPMENT ONLY: every component in every state, plus a sample home with
// made-up vendors, and a switch to compare the three brand colours.
// The route is guarded by __DEV__ in the root layout, so the installed app
// can never open it.
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { en, formatMoney } from 'shared';
import { AppImage } from '@/components/AppImage';
import { AppText, type TextVariant } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryGrid } from '@/components/CategoryGrid';
import { CategoryTile } from '@/components/CategoryTile';
import { Icon } from '@/components/Icon';
import { PromoBadge } from '@/components/PromoBadge';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGridSkeleton, Skeleton, VendorCardSkeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import { TabBarView } from '@/components/TabBar';
import { Screen } from '@/components/ui';
import { VendorCard } from '@/components/VendorCard';
import {
  CATEGORY_PHOTOS,
  SAMPLE_BLURHASH,
  SAMPLE_CITY,
  SAMPLE_VENDORS,
  unsplash,
  unsplashPlaceholder,
} from '@/dev/sampleData';
import { useSetBrand, useStyles, useTheme } from '@/theme/ThemeProvider';
import { BRAND_OPTIONS, type Theme } from '@/theme/theme';

const p = en.preview;
const TEXT_VARIANTS: TextVariant[] = ['display', 'title', 'heading', 'body', 'bodyStrong', 'label', 'caption', 'price'];

export default function DevPreviewScreen() {
  const theme = useTheme();
  const setBrand = useSetBrand();
  const styles = useStyles(makeStyles);
  const [activeTab, setActiveTab] = useState('home');

  const vendorMeta = (v: (typeof SAMPLE_VENDORS)[number]) => [
    en.vendor.minutes(v.minMinutes, v.maxMinutes),
    en.vendor.deliveryFee(formatMoney(v.deliveryFee, SAMPLE_CITY.currencyCode)),
  ];
  const photoCategories = SAMPLE_CITY.categories.map((c) => ({ ...c, imageUri: unsplash(CATEGORY_PHOTOS[c.key], 600) }));

  return (
    <Screen>
      <View style={styles.topRow}>
        <AppText variant="title" accessibilityRole="header" style={styles.flex}>
          {p.title}
        </AppText>
        <Button variant="ghost" icon="close" label={p.close} onPress={() => router.back()} fullWidth={false} />
      </View>
      <AppText variant="caption" tone="muted">
        {p.devOnly}
      </AppText>

      {/* Brand switcher */}
      <Section title={p.brand}>
        <View style={styles.row}>
          {BRAND_OPTIONS.map((brand) => (
            <View key={brand} style={styles.flex}>
              <Button
                label={p.brandNames[brand]}
                variant={theme.brand === brand ? 'primary' : 'secondary'}
                onPress={() => setBrand(brand)}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section title={p.sampleHome}>
        <View style={styles.sampleHome}>
          <AppText variant="title">{en.customerHome.greeting('Tolu')}</AppText>
          <View style={styles.cityRow}>
            <Icon name="location" size="sm" color={theme.colors.primary} />
            <AppText variant="label" tone="muted">
              {en.customerHome.deliveringIn}{' '}
            </AppText>
            <AppText variant="label">{SAMPLE_CITY.name}</AppText>
          </View>
          <SearchBar placeholder={en.customerHome.searchPlaceholder} onPress={() => undefined} />
          <AppText variant="heading">{en.customerHome.whatDoYouNeed}</AppText>
          <CategoryGrid categories={SAMPLE_CITY.categories} onPress={() => undefined} />
          <AppText variant="heading">{en.customerHome.nearYou}</AppText>
          {SAMPLE_VENDORS.slice(0, 2).map((v) => (
            <VendorCard
              key={v.id}
              name={v.name}
              subtitle={v.cuisine}
              imageUri={unsplash(v.photo)}
              placeholder={unsplashPlaceholder(v.photo)}
              meta={vendorMeta(v)}
              rating={v.rating}
              promo={v.promoPercent ? p.promo(v.promoPercent) : undefined}
              onPress={() => undefined}
            />
          ))}
        </View>
      </Section>

      <Section title={p.tilesCompare}>
        <View style={styles.row}>
          <View style={[styles.flex, styles.column]}>
            <AppText variant="label" tone="muted">
              {p.tileIcon}
            </AppText>
            <CategoryTile category="FOOD" label={en.categories.FOOD} enabled onPress={() => undefined} soonLabel={en.categories.soon} offHint={en.categories.offHint} />
            <CategoryTile category="PHARMACY" label={en.categories.PHARMACY} enabled={false} onPress={() => undefined} soonLabel={en.categories.soon} offHint={en.categories.offHint} />
          </View>
          <View style={[styles.flex, styles.column]}>
            <AppText variant="label" tone="muted">
              {p.tilePhoto}
            </AppText>
            <CategoryTile category="FOOD" label={en.categories.FOOD} enabled variant="photo" imageUri={unsplash(CATEGORY_PHOTOS.FOOD, 600)} onPress={() => undefined} soonLabel={en.categories.soon} offHint={en.categories.offHint} />
            <CategoryTile category="PHARMACY" label={en.categories.PHARMACY} enabled={false} variant="photo" imageUri={unsplash(CATEGORY_PHOTOS.PHARMACY, 600)} onPress={() => undefined} soonLabel={en.categories.soon} offHint={en.categories.offHint} />
          </View>
        </View>
        <AppText variant="label" tone="muted">
          {p.tileIcon}
        </AppText>
        <CategoryGrid categories={SAMPLE_CITY.categories} onPress={() => undefined} />
        <AppText variant="label" tone="muted">
          {p.tilePhoto}
        </AppText>
        <CategoryGrid categories={photoCategories} variant="photo" onPress={() => undefined} />
      </Section>

      <Section title={p.typography}>
        {TEXT_VARIANTS.map((variant) => (
          <AppText key={variant} variant={variant} numberOfLines={1}>
            {variant === 'price' ? `${variant}: ${formatMoney(250000, SAMPLE_CITY.currencyCode)}` : `${variant}: ${p.sampleText}`}
          </AppText>
        ))}
      </Section>

      <Section title={p.colours}>
        <View style={styles.swatches}>
          {(['primary', 'primaryPressed', 'primarySoft', 'background', 'surface', 'surfaceMuted', 'border', 'text', 'textMuted', 'textSubtle', 'danger', 'dangerSoft'] as const).map((key) => (
            <View key={key} style={styles.swatch}>
              <View style={[styles.swatchColour, { backgroundColor: theme.colors[key] }]} />
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {key}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title={p.buttons}>
        <Button label={p.pressMe} onPress={() => undefined} size="lg" />
        <Button label={p.secondary} variant="secondary" onPress={() => undefined} />
        <Button label={p.ghost} variant="ghost" onPress={() => undefined} />
        <Button label={p.danger} variant="danger" icon="trash-outline" onPress={() => undefined} />
        <Button label={p.loading} loading onPress={() => undefined} />
        <Button label={p.disabled} disabled onPress={() => undefined} />
      </Section>

      <Section title={p.cards}>
        <Card onPress={() => undefined}>
          <AppText variant="heading">{p.cardTitle}</AppText>
          <AppText tone="muted">{p.cardBody}</AppText>
        </Card>
      </Section>

      <Section title={p.search}>
        <SearchBar placeholder={en.customerHome.searchPlaceholder} onPress={() => undefined} />
      </Section>

      <Section title={p.badges}>
        <View style={styles.row}>
          <PromoBadge label={p.promo(20)} />
          <PromoBadge label={p.freeDelivery} variant="soft" />
        </View>
      </Section>

      <Section title={p.vendors}>
        {SAMPLE_VENDORS.map((v) => (
          <VendorCard
            key={v.id}
            name={v.name}
            subtitle={v.cuisine}
            imageUri={unsplash(v.photo)}
            placeholder={unsplashPlaceholder(v.photo)}
            meta={vendorMeta(v)}
            rating={v.rating}
            promo={v.promoPercent ? p.promo(v.promoPercent) : undefined}
            closedLabel={v.isOpen ? undefined : en.vendor.closed}
            onPress={() => undefined}
          />
        ))}
        <VendorCardSkeleton />
      </Section>

      <Section title={p.images}>
        {(['cover', 'tile', 'square'] as const).map((ratio) => (
          <View key={ratio} style={styles.column}>
            <AppText variant="caption" tone="muted">
              {p.ratio(ratio)}
            </AppText>
            <AppImage uri={unsplash(SAMPLE_VENDORS[1]!.photo, 900)} placeholder={unsplashPlaceholder(SAMPLE_VENDORS[1]!.photo)} ratio={ratio} />
          </View>
        ))}
        <AppText variant="caption" tone="muted">
          {p.slowImage}
        </AppText>
        {/* A very large version loads slowly, so the blurred placeholder is visible first. */}
        <AppImage uri={unsplash(SAMPLE_VENDORS[2]!.photo, 3000)} placeholder={unsplashPlaceholder(SAMPLE_VENDORS[2]!.photo)} ratio="cover" />
        <AppImage uri={null} placeholder={{ blurhash: SAMPLE_BLURHASH }} ratio="cover" />
      </Section>

      <Section title={p.skeletons}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="45%" height={14} />
        <CategoryGridSkeleton />
      </Section>

      <Section title={p.emptyError}>
        <Card>
          <EmptyState icon="bag-handle-outline" title={en.cart.emptyTitle} body={en.cart.emptyBody} actionLabel={en.cart.emptyAction} onAction={() => undefined} />
        </Card>
        <Card>
          <ErrorState onRetry={() => undefined} />
        </Card>
      </Section>

      <Section title={p.tabBar}>
        <View style={styles.tabBarFrame}>
          <TabBarView
            activeKey={activeTab}
            onSelect={setActiveTab}
            items={[
              { key: 'home', label: en.tabs.home, icon: 'home-outline', iconActive: 'home' },
              { key: 'orders', label: en.tabs.orders, icon: 'receipt-outline', iconActive: 'receipt' },
              { key: 'cart', label: en.tabs.cart, icon: 'bag-handle-outline', iconActive: 'bag-handle', badge: 2 },
              { key: 'account', label: en.tabs.account, icon: 'person-circle-outline', iconActive: 'person-circle' },
            ]}
          />
        </View>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    flex: { flex: 1 },
    row: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' },
    column: { gap: theme.spacing.xs },
    section: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
    sampleHome: { gap: theme.spacing.md, backgroundColor: theme.colors.background },
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    swatch: { width: theme.sizes.swatch, gap: theme.spacing.xxs },
    swatchColour: { height: theme.sizes.swatchHeight, borderRadius: theme.radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border },
    tabBarFrame: { borderRadius: theme.radius.lg, overflow: 'hidden' },
  });
