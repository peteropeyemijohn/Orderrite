// The Orderrite mobile theme. Every colour, size, font, shadow and animation
// setting used by components comes from here (built on the shared tokens).
// Screens never contain raw values.
import type { TextStyle, ViewStyle } from 'react-native';
import {
  ACTIVE_BRAND,
  BRAND_OPTIONS,
  brandPalettes,
  imageRatios,
  MIN_TAP_SIZE,
  neutralColors,
  radius,
  spacing,
  typeScale,
  type BrandOption,
} from 'shared';

export { BRAND_OPTIONS, type BrandOption };

/** The brand the app starts with (set once in packages/shared for mobile and web). */
export const DEFAULT_BRAND: BrandOption = ACTIVE_BRAND;

/** Plus Jakarta Sans font files (loaded in the root layout). */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Text styles. With custom fonts, the weight comes from the font file, not fontWeight. */
function typography() {
  const style = (font: keyof typeof fonts, scale: keyof typeof typeScale, extra: TextStyle = {}): TextStyle => ({
    fontFamily: fonts[font],
    fontSize: typeScale[scale].size,
    lineHeight: typeScale[scale].lineHeight,
    ...extra,
  });
  return {
    display: style('extrabold', 'display', { letterSpacing: -0.5 }),
    title: style('bold', 'title', { letterSpacing: -0.3 }),
    heading: style('bold', 'heading'),
    body: style('regular', 'body'),
    bodyStrong: style('semibold', 'body'),
    label: style('semibold', 'label'),
    caption: style('medium', 'caption'),
    /** Prices: digits line up (₦1,500 / ₦12,000) */
    price: style('bold', 'body', { fontVariant: ['tabular-nums'] }),
  } satisfies Record<string, TextStyle>;
}

/**
 * Soft, wide, low-opacity shadows. `boxShadow` renders the same on iPhone and
 * Android (unlike Android's old "elevation", which looks harsh and grey).
 */
const shadowColor = 'rgba(22, 21, 26,';
export const shadows = {
  none: {} as ViewStyle,
  sm: { boxShadow: `0px 1px 2px ${shadowColor} 0.04), 0px 2px 8px ${shadowColor} 0.05)` } as ViewStyle,
  md: { boxShadow: `0px 2px 6px ${shadowColor} 0.04), 0px 8px 24px ${shadowColor} 0.08)` } as ViewStyle,
  lg: { boxShadow: `0px 4px 12px ${shadowColor} 0.05), 0px 16px 40px ${shadowColor} 0.12)` } as ViewStyle,
  /** Upwards, for bars that sit at the bottom of the screen */
  up: { boxShadow: `0px -4px 24px ${shadowColor} 0.06)` } as ViewStyle,
};

/**
 * Fixed sizes of component parts. Everything tappable is at least MIN_TAP_SIZE (44);
 * the components enforce that with Math.max(minTap, size).
 */
export const sizes = {
  buttonMd: 48,
  buttonLg: 56,
  input: 52,
  searchBar: 52,
  tabItem: 52,
  tabIndicatorWidth: 56,
  tabIndicatorHeight: 32,
  countBadge: 18,
  iconCircle: 52,
  iconCircleLarge: 72,
  stateCircle: 80,
  avatar: 56,
  tile: 120,
  tileHero: 140,
  /** Tiny nudges (2 px) for tight icon/text pairs */
  nudge: 2,
  /** Letter spacing for one-time-code inputs */
  codeLetterSpacing: 8,
  /** Colour swatches in the dev preview */
  swatch: 72,
  swatchHeight: 48,
} as const;

/** Animation settings. Components switch these off when the phone's "Reduce Motion" is on. */
export const motion = {
  duration: { fast: 150, normal: 250, slow: 400 },
  /** Gentle spring for presses: settles quickly without bouncing much */
  spring: { damping: 18, stiffness: 260, mass: 0.9 },
  /** How much buttons and cards shrink when pressed */
  pressScale: 0.97,
  /** Skeleton pulse length */
  pulse: 1100,
} as const;

/** Icon sizes */
export const iconSize = { sm: 16, md: 20, lg: 24, xl: 32, xxl: 48 } as const;

export function createTheme(brand: BrandOption) {
  return {
    brand,
    colors: { ...neutralColors, ...brandPalettes[brand] },
    spacing,
    radius,
    text: typography(),
    shadows,
    motion,
    iconSize,
    imageRatios,
    /** Smallest tappable size (44): enforced inside components */
    minTap: MIN_TAP_SIZE,
    sizes,
    /** Space around screen edges */
    screenPadding: spacing.lg,
    /** Extra room below the last item, on top of the safe area */
    screenBottom: spacing.xxxl,
  } as const;
}

export type Theme = ReturnType<typeof createTheme>;
