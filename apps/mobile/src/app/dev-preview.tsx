// DEVELOPMENT ONLY: every component in every state, the wordmark options, and
// a sample home with made-up vendors. Guarded by __DEV__ in the root layout,
// so the installed app can never open it.
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { categoryColors, CATEGORIES, en, formatMoney } from 'shared';
import { Image } from 'expo-image';
import { ICON_CANDIDATES, ICON_SAFE_ZONE, ICONS, type IconCandidate } from '@/brand/wordmarks';
import { AppImage } from '@/components/AppImage';
import { AppText, type TextVariant } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryGrid } from '@/components/CategoryGrid';
import { Icon } from '@/components/Icon';
import { LoginHero } from '@/components/LoginHero';
import { Notice } from '@/components/Notice';
import { PromoBadge } from '@/components/PromoBadge';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGridSkeleton, Skeleton, VendorCardSkeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/States';
import { TabBarView } from '@/components/TabBar';
import { Screen } from '@/components/ui';
import { VendorCard } from '@/components/VendorCard';
import { Wordmark } from '@/components/Wordmark';
import { SAMPLE_BLURHASH, SAMPLE_CITY, SAMPLE_CUSTOMER_NAME, SAMPLE_OPENS_AT, SAMPLE_VENDORS, unsplash, unsplashPlaceholder, type SampleVendor } from '@/dev/sampleData';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

const p = en.preview;
const TEXT_VARIANTS: TextVariant[] = ['display', 'title', 'heading', 'body', 'bodyStrong', 'label', 'caption', 'price'];
const NAIRA = { code: SAMPLE_CITY.currencyCode, symbol: '₦' };
const ICON_SIZES = [96, 64, 48];

export default function DevPreviewScreen() {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const [activeTab, setActiveTab] = useState('home');
  const [notice, setNotice] = useState<string | null>(null);
  const hideNotice = useCallback(() => setNotice(null), []);

  const vendorMeta = (v: SampleVendor) => [en.vendor.minutes(v.minMinutes, v.maxMinutes), en.vendor.deliveryFee(formatMoney(v.deliveryFee, NAIRA))];
  const vendorCard = (v: SampleVendor) => (
    <VendorCard
      key={v.id}
      name={v.name}
      subtitle={v.cuisine}
      imageUri={unsplash(v.photo)}
      placeholder={unsplashPlaceholder(v.photo)}
      meta={vendorMeta(v)}
      rating={v.rating}
      promo={v.promoPercent ? p.promo(v.promoPercent) : undefined}
      closedLabel={v.isOpen ? undefined : `${en.vendor.closed} · ${en.vendor.opensAt(SAMPLE_OPENS_AT)}`}
      onPress={() => undefined}
    />
  );

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.topRow}>
        <AppText variant="title" accessibilityRole="header" style={styles.flex}>
          {p.title}
        </AppText>
        <Button variant="ghost" icon="close" label={p.close} onPress={() => router.back()} fullWidth={false} />
      </View>
      <AppText variant="caption" tone="muted">
        {p.devOnly}
      </AppText>

      <Section title={p.wordmark}>
        <Card padded={false}>
          <View style={styles.wordmarkBody}>
            <AppText variant="caption" tone="muted">
              {p.onLight}
            </AppText>
            <Wordmark variant="light" height={theme.sizes.heroWordmark} accessibilityLabel={en.appName} />
          </View>
          <View style={styles.violetStrip}>
            <AppText variant="caption" style={styles.onViolet}>
              {p.onViolet}
            </AppText>
            <Wordmark variant="dark" height={theme.sizes.heroWordmark} accessibilityLabel={en.appName} />
          </View>
        </Card>
      </Section>

      <Section title={p.iconCandidates}>
        <AppText variant="caption" tone="muted">
          {p.safeZone}
        </AppText>
        {ICON_CANDIDATES.map((candidate) => (
          <IconCandidateCard key={candidate} candidate={candidate} />
        ))}
      </Section>

      <Section title={p.taglines}>
        <AppText variant="label" tone="muted">
          {p.taglineCurrent}
        </AppText>
        <View style={styles.heroFrame}>
          <LoginHero tagline={en.auth.heroTagline} compact />
        </View>
        <AppText variant="label" tone="muted">
          {p.taglineOption}
        </AppText>
        <View style={styles.heroFrame}>
          <LoginHero tagline={en.auth.heroTaglineAlt} compact />
        </View>
      </Section>

      <Section title={p.sampleHome}>
        <AppText variant="title" numberOfLines={1}>
          {en.customerHome.greeting(SAMPLE_CUSTOMER_NAME)}
        </AppText>
        <View style={styles.cityRow}>
          <Icon name="location" size="sm" color={theme.colors.primary} />
          <AppText variant="label" tone="muted">
            {en.customerHome.deliveringIn}{' '}
          </AppText>
          <AppText variant="label">{SAMPLE_CITY.name}</AppText>
        </View>
        <SearchBar placeholder={en.customerHome.searchPlaceholder} onPress={() => setNotice(en.customerHome.searchSoon)} />
        {notice && <Notice message={notice} onHide={hideNotice} />}
        <AppText variant="heading">{en.customerHome.whatDoYouNeed}</AppText>
        <CategoryGrid
          categories={SAMPLE_CITY.categories}
          onPress={(c) => setNotice(c.enabled ? en.customerHome.noRestaurantsTitle(SAMPLE_CITY.name) : en.categories.comingSoonTo(en.categories[c.key], SAMPLE_CITY.name))}
        />
        <AppText variant="heading">{en.customerHome.nearYou}</AppText>
        {SAMPLE_VENDORS.slice(0, 2).map(vendorCard)}
      </Section>

      <Section title={p.colours}>
        <View style={styles.swatches}>
          {(['primary', 'primaryPressed', 'primarySoft', 'background', 'surface', 'surfaceMuted', 'skeleton', 'disabled', 'border', 'text', 'textMuted', 'textSubtle', 'danger', 'dangerSoft'] as const).map((key) => (
            <Swatch key={key} label={key} color={theme.colors[key]} />
          ))}
          {CATEGORIES.map((key) => (
            <Swatch key={key} label={en.categories[key]} color={categoryColors[key].soft} accent={categoryColors[key].icon} />
          ))}
        </View>
      </Section>

      <Section title={p.typography}>
        {TEXT_VARIANTS.map((variant) => (
          <AppText key={variant} variant={variant}>
            {variant === 'price' ? `${variant}: ${formatMoney(250000, NAIRA)} · ${formatMoney(125050, NAIRA)}` : `${variant}: ${p.sampleText}`}
          </AppText>
        ))}
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

      <Section title={p.badges}>
        <View style={styles.row}>
          <PromoBadge label={p.promo(20)} />
          <PromoBadge label={p.freeDelivery} variant="soft" />
        </View>
      </Section>

      <Section title={p.vendors}>
        {SAMPLE_VENDORS.map(vendorCard)}
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
        <AppImage uri={unsplash(SAMPLE_VENDORS[2]!.photo, 3000)} placeholder={unsplashPlaceholder(SAMPLE_VENDORS[2]!.photo)} ratio="cover" />
        <AppImage uri={null} placeholder={{ blurhash: SAMPLE_BLURHASH }} ratio="cover" />
      </Section>

      <Section title={p.skeletons}>
        <Skeleton width="70%" height={theme.spacing.lg} />
        <Skeleton width="45%" height={theme.spacing.sm} />
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

/** One icon candidate: circle and rounded-square crops at 3 sizes, and a large one with the safe zone. */
function IconCandidateCard({ candidate }: { candidate: IconCandidate }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const large = theme.sizes.iconPreviewLarge;
  const icon = (size: number, mask: 'circle' | 'rounded') => (
    <Image
      key={`${mask}-${size}`}
      source={ICONS[candidate].source}
      contentFit="cover"
      accessibilityLabel={`${p.iconNames[candidate]} ${size}`}
      // Launchers crop the full-bleed square: a circle, or a rounded square (~22% corners).
      style={{ width: size, height: size, borderRadius: mask === 'circle' ? size / 2 : size * 0.22 }}
    />
  );
  return (
    <Card>
      <AppText variant="heading">{p.iconNames[candidate]}</AppText>
      <View style={styles.iconLarge}>
        {icon(large, 'circle')}
        {/* The dashed circle is the Android adaptive-icon safe zone. */}
        <View
          pointerEvents="none"
          style={[styles.safeZone, { width: large * ICON_SAFE_ZONE, height: large * ICON_SAFE_ZONE, borderRadius: (large * ICON_SAFE_ZONE) / 2 }]}
        />
      </View>
      <AppText variant="caption" tone="muted">
        {p.circleMask}
      </AppText>
      <View style={styles.iconRow}>{ICON_SIZES.map((size) => icon(size, 'circle'))}</View>
      <AppText variant="caption" tone="muted">
        {p.roundedMask}
      </AppText>
      <View style={styles.iconRow}>{ICON_SIZES.map((size) => icon(size, 'rounded'))}</View>
    </Card>
  );
}

function Swatch({ label, color, accent }: { label: string; color: string; accent?: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColour, { backgroundColor: color }]}>{accent && <View style={[styles.swatchAccent, { backgroundColor: accent }]} />}</View>
      <AppText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
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
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    swatch: { width: theme.sizes.swatch, gap: theme.spacing.xxs },
    swatchColour: {
      height: theme.sizes.swatchHeight,
      borderRadius: theme.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchAccent: { width: theme.spacing.lg, height: theme.spacing.lg, borderRadius: theme.radius.pill },
    tabBarFrame: { borderRadius: theme.radius.lg, overflow: 'hidden' },
    wordmarkBody: { padding: theme.spacing.md, gap: theme.spacing.xs },
    violetStrip: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, gap: theme.spacing.xs },
    onViolet: { color: theme.colors.onPrimary },
    iconRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.md },
    iconLarge: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
    safeZone: { position: 'absolute', borderWidth: theme.sizes.nudge, borderStyle: 'dashed', borderColor: theme.colors.onPrimary },
    heroFrame: { borderRadius: theme.radius.lg, overflow: 'hidden' },
  });
