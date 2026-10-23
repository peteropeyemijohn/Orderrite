// Orderrite design tokens: the single source of colours, spacing, radius and
// type sizes for the mobile app and the web dashboard. Screens never use raw
// values; they use these (through each app's theme).

export const BRAND_OPTIONS = ['violet', 'cobalt', 'ink'] as const;
export type BrandOption = (typeof BRAND_OPTIONS)[number];

/**
 * The brand used by the mobile app AND the web dashboard (one place to change).
 * Phase 3: the owner compares the three options in the dev preview, then this
 * is set to the chosen one.
 */
export const ACTIVE_BRAND: BrandOption = 'violet';

/** The brand colour family. Phase 3: the owner compares the three and picks one. */
export interface BrandPalette {
  /** Buttons, active tab, links */
  primary: string;
  /** Pressed state of primary */
  primaryPressed: string;
  /** Light tint: icon circles, selected chips */
  primarySoft: string;
  /** Text and icons on top of primary */
  onPrimary: string;
}

export const brandPalettes: Record<BrandOption, BrandPalette> = {
  violet: { primary: '#5B3DF5', primaryPressed: '#4A2DDB', primarySoft: '#EFEBFF', onPrimary: '#FFFFFF' },
  cobalt: { primary: '#1E4FD8', primaryPressed: '#173FB0', primarySoft: '#E7EEFD', onPrimary: '#FFFFFF' },
  ink: { primary: '#1C1B22', primaryPressed: '#000000', primarySoft: '#ECECEF', onPrimary: '#FFFFFF' },
};

/** Colours shared by every brand option. */
export const neutralColors = {
  /** Soft near-white page background */
  background: '#F7F7F5',
  /** Cards and sheets: pure white */
  surface: '#FFFFFF',
  /** Skeletons, "off" tiles, input backgrounds */
  surfaceMuted: '#EFEFEC',
  border: '#E3E3DF',
  /** Main text */
  text: '#16151A',
  /** Secondary text (meets WCAG AA on background and surface) */
  textMuted: '#5E5D66',
  /** Only for disabled / "off" content and placeholders */
  textSubtle: '#76757D',
  /** Reserved for promos and alerts only */
  danger: '#C4261A',
  dangerSoft: '#FDECEA',
  onDanger: '#FFFFFF',
  /** Small success ticks only, never a brand colour */
  success: '#13734A',
  successSoft: '#E6F4EC',
  /** Dark see-through layer for text on photos */
  scrim: 'rgba(22, 21, 26, 0.55)',
} as const;

/** Generous spacing on a 4-point grid. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  /** Cards */
  lg: 16,
  /** Big tiles and sheets */
  xl: 24,
  pill: 999,
} as const;

/** Font sizes and line heights. One family: Plus Jakarta Sans. */
export const typeScale = {
  display: { size: 32, lineHeight: 38 },
  title: { size: 24, lineHeight: 30 },
  heading: { size: 18, lineHeight: 24 },
  body: { size: 16, lineHeight: 24 },
  label: { size: 14, lineHeight: 20 },
  caption: { size: 12, lineHeight: 16 },
} as const;

/** Smallest comfortable tap target (Apple and Android guidance). */
export const MIN_TAP_SIZE = 44;

/** Fixed crop ratios for photos (width / height). */
export const imageRatios = {
  cover: 16 / 9,
  square: 1,
  tile: 4 / 3,
} as const;
