// Orderrite design tokens: the single source of colours, spacing, radius and
// type sizes for the mobile app and the web dashboard. Screens never use raw
// values; they use these (through each app's theme).

/** Orderrite's brand colour (chosen in Phase 3 from violet, cobalt and ink). */
export const BRAND_OPTIONS = ['violet'] as const;
export type BrandOption = (typeof BRAND_OPTIONS)[number];

/** The brand used by the mobile app AND the web dashboard. */
export const ACTIVE_BRAND: BrandOption = 'violet';

/** The brand colour family. Violet is only for actions and active states. */
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
};

/** Deep violet used at the bottom of the login hero gradient. */
export const brandGradient = { from: '#6B4BFF', to: '#3A1FB8' } as const;

/** Accent on violet backgrounds (e.g. the wordmark tick on the hero): near-white lilac. */
export const accentOnViolet = '#E6E0FF';

/**
 * Each category's own soft tint and icon colour, all at a similar lightness.
 * Labels stay dark ink; "Soon" tiles use the neutral greys instead.
 * Food is kept orange so it never reads as the promo red.
 */
export const categoryColors = {
  FOOD: { soft: '#FFEADB', icon: '#D2600E' },
  SHOPS: { soft: '#DCF3EF', icon: '#0B7268' },
  PHARMACY: { soft: '#E0F4E8', icon: '#1B7646' },
  BEAUTY: { soft: '#FCE6F0', icon: '#B02E69' },
  PACKAGE: { soft: '#DFEFFA', icon: '#17669E' },
} as const;

/** Colours shared by every brand option. */
export const neutralColors = {
  /** Soft near-white page background */
  background: '#F7F7F5',
  /** Cards and sheets: pure white */
  surface: '#FFFFFF',
  /** "Off" tiles, input backgrounds */
  surfaceMuted: '#EFEFEC',
  /** Loading skeletons: a little darker than surfaceMuted so the pulse is visible */
  skeleton: '#E3E3DE',
  /** Disabled buttons */
  disabled: '#E7E7E3',
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
