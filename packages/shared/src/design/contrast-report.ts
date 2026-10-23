// Prints the WCAG AA contrast table for all brand options: pnpm --filter shared contrast
import { contrastRatio, passesAA } from './contrast.ts';
import { contrastPairs } from './contrast-pairs.ts';
import { BRAND_OPTIONS } from './tokens.ts';

for (const brand of BRAND_OPTIONS) {
  console.log(`\n${brand.toUpperCase()}`);
  for (const pair of contrastPairs(brand)) {
    const ratio = contrastRatio(pair.foreground, pair.background);
    const ok = passesAA(pair.foreground, pair.background, pair.level);
    const need = pair.level === 'normal' ? '4.5' : '3.0';
    console.log(`  ${ok ? '✓' : '✗'} ${ratio.toFixed(2).padStart(5)}:1 (needs ${need})  ${pair.name}`);
  }
}
