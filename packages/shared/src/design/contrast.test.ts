import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, passesAA } from './contrast.ts';
import { contrastPairs } from './contrast-pairs.ts';
import { BRAND_OPTIONS } from './tokens.ts';

test('contrast maths matches known values', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF').toFixed(1), '21.0');
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF').toFixed(1), '1.0');
  assert.equal(contrastRatio('#767676', '#FFFFFF').toFixed(2), '4.54'); // the classic AA grey
});

for (const brand of BRAND_OPTIONS) {
  test(`every colour pair passes WCAG AA for the ${brand} option`, () => {
    for (const pair of contrastPairs(brand)) {
      assert.ok(
        passesAA(pair.foreground, pair.background, pair.level),
        `${brand}: ${pair.name} is ${contrastRatio(pair.foreground, pair.background).toFixed(2)}:1`,
      );
    }
  });
}
