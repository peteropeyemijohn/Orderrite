import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { en } from 'shared';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { HeroOrbit } from './HeroOrbit';
import { HERO_ORBIT_ITEMS } from './heroOrbitItems';
import { Wordmark } from './Wordmark';

/**
 * The violet gradient hero at the top of the login screen: the wordmark with
 * photos circling it, and the tagline below (outside the ring, so no photo ever
 * passes over text). It reaches up behind the status bar (white icons).
 */
export function LoginHero({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, { paddingTop: (compact ? 0 : insets.top) + theme.spacing.md }]}>
      <HeroOrbit items={HERO_ORBIT_ITEMS}>
        <Wordmark variant="dark" accessibilityLabel={en.appName} />
      </HeroOrbit>
      <AppText variant="bodyStrong" style={styles.tagline}>
        {en.auth.heroTagline}
      </AppText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    hero: {
      experimental_backgroundImage: theme.heroGradient,
      backgroundColor: theme.colors.primary, // shown if a phone can't draw the gradient
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.screenPadding,
      // Extra room at the bottom, covered by the sheet's rounded top.
      paddingBottom: theme.spacing.xl + theme.sizes.sheetOverlap,
      // Photos near the edge may sit in the side padding.
      overflow: 'hidden',
    },
    tagline: { color: theme.colors.onPrimary, textAlign: 'center' },
  });
