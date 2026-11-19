import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ACTIVE_BRAND, brandPalettes, splash } from './tokens.ts';

// The app's violet start-up screen must look exactly like the native splash
// (otherwise the hand-over shows a jump or a colour change).
// Tests run from packages/shared, so app.json is two folders up.
test('the native splash in app.json matches the theme (colour and mark size)', () => {
  const appJson = JSON.parse(readFileSync(resolve(process.cwd(), '../../apps/mobile/app.json'), 'utf8'));
  const plugin = appJson.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  assert.ok(plugin, 'expo-splash-screen plugin not found in app.json');
  const options = plugin[1];
  assert.equal(options.backgroundColor.toUpperCase(), brandPalettes[ACTIVE_BRAND].primary.toUpperCase());
  assert.equal(options.imageWidth, splash.markSize);
});
