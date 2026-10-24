import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { en } from 'shared';
import type { WordmarkOption } from '@/brand/wordmarks';
import { useStyles, useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';
import { AppText } from './AppText';
import { DEFAULT_WORDMARK, Wordmark } from './Wordmark';

/** Our own hero photo: jollof rice, chicken and plantain (Keesha's Kitchen, Unsplash licence). */
const HERO_PHOTO = require('../../assets/images/hero-jollof.jpg');

/**
 * The violet gradient hero at the top of the login screen: wordmark, a short
 * line, and a food photo. It reaches up behind the status bar (white icons).
 */
export function LoginHero({ wordmark = DEFAULT_WORDMARK, compact = false }: { wordmark?: WordmarkOption; compact?: boolean }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, { paddingTop: (compact ? 0 : insets.top) + theme.spacing.xl }]}>
      <Wordmark option={wordmark} variant="dark" accessibilityLabel={en.appName} />
      <AppText variant="bodyStrong" style={styles.tagline}>
        {en.auth.heroTagline}
      </AppText>
      <View style={styles.photoFrame}>
        <Image source={HERO_PHOTO} contentFit="cover" style={styles.photo} accessible={false} />
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    hero: {
      experimental_backgroundImage: theme.heroGradient,
      backgroundColor: theme.colors.primary, // shown if a phone can't draw the gradient
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.screenPadding,
      // Extra room at the bottom, covered by the sheet's rounded top.
      paddingBottom: theme.spacing.xl + theme.sizes.sheetOverlap,
    },
    tagline: { color: theme.colors.onPrimary, textAlign: 'center' },
    // The frame carries the white ring and the soft shadow; the photo fills it.
    photoFrame: {
      width: theme.sizes.heroPhoto,
      height: theme.sizes.heroPhoto,
      borderRadius: theme.radius.pill,
      borderWidth: theme.spacing.xxs,
      borderColor: theme.colors.surface,
      backgroundColor: theme.colors.surface,
      marginTop: theme.spacing.xs,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    photo: { width: '100%', height: '100%' },
  });
