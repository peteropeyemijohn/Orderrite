import { brandPalettes, neutralColors, type BrandOption } from './tokens.ts';
import type { ContrastLevel } from './contrast.ts';

export interface ContrastPair {
  name: string;
  foreground: string;
  background: string;
  /** "normal" = 4.5:1 (body text), "large" = 3:1 (big text, icons) */
  level: ContrastLevel;
}

/** Every text/background combination the app uses, for one brand option. */
export function contrastPairs(brand: BrandOption): ContrastPair[] {
  const b = brandPalettes[brand];
  const n = neutralColors;
  return [
    { name: 'Text on page background', foreground: n.text, background: n.background, level: 'normal' },
    { name: 'Text on card', foreground: n.text, background: n.surface, level: 'normal' },
    { name: 'Muted text on page background', foreground: n.textMuted, background: n.background, level: 'normal' },
    { name: 'Muted text on card', foreground: n.textMuted, background: n.surface, level: 'normal' },
    { name: 'Muted text on grey (skeleton/off tile)', foreground: n.textMuted, background: n.surfaceMuted, level: 'normal' },
    { name: 'Button text on brand colour', foreground: b.onPrimary, background: b.primary, level: 'normal' },
    { name: 'Button text on pressed brand colour', foreground: b.onPrimary, background: b.primaryPressed, level: 'normal' },
    { name: 'Brand-coloured text/link on card', foreground: b.primary, background: n.surface, level: 'normal' },
    { name: 'Brand-coloured text/link on page', foreground: b.primary, background: n.background, level: 'normal' },
    { name: 'Brand icon/label on its soft tint', foreground: b.primary, background: b.primarySoft, level: 'normal' },
    { name: 'Promo badge text on red', foreground: n.onDanger, background: n.danger, level: 'normal' },
    { name: 'Alert text (red) on card', foreground: n.danger, background: n.surface, level: 'normal' },
    { name: 'Alert text (red) on soft red', foreground: n.danger, background: n.dangerSoft, level: 'normal' },
    { name: 'Success text on soft green', foreground: n.success, background: n.successSoft, level: 'normal' },
    { name: '"Off" tile label (disabled, exempt) on grey', foreground: n.textSubtle, background: n.surfaceMuted, level: 'large' },
    { name: 'Placeholder text in input', foreground: n.textSubtle, background: n.surface, level: 'large' },
  ];
}
