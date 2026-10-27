#!/usr/bin/env node
// Generates the Orderrite wordmark (option A) and the app icon (option 2, both
// chosen in Phase 3) as single SVG drawings. Letters are OUTLINES taken from the
// Plus Jakarta Sans font file (Open Font Licence), so the logo looks identical
// on every phone and the tick sits exactly over the "i".
//
//   pnpm build:shared && node scripts/generate-wordmarks.mjs
//
// Output: apps/mobile/assets/brand/*.svg and apps/mobile/src/brand/wordmarks.ts
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const fontFile = (weight) =>
  require.resolve(`@expo-google-fonts/plus-jakarta-sans/${weight}/PlusJakartaSans_${weight}.ttf`, {
    paths: [path.join(root, 'apps/mobile')],
  });
const extraBold = opentype.parse(readFileSync(fontFile('800ExtraBold')).buffer);

const OUT = path.join(root, 'apps/mobile/assets/brand');
const SIZE = 100; // font size in SVG units
const BASE = 100; // baseline y
// Colours come from the shared design tokens (one source of truth).
const tokens = require(path.join(root, 'packages/shared/dist/design/tokens.js'));
const VIOLET = tokens.brandGradient;
const COLORS = {
  light: { letters: tokens.neutralColors.text, accent: tokens.brandPalettes.violet.primary },
  dark: { letters: '#FFFFFF', accent: tokens.accentOnViolet },
};
const r = (n) => Math.round(n * 100) / 100;

/**
 * SVG path data from opentype.js commands. Written here because opentype's own
 * toPathData() sometimes prints "NaN" for values like 106.9999 (a rounding bug),
 * which breaks letters.
 */
function pathData(commands) {
  const n = (v) => {
    if (!Number.isFinite(v)) throw new Error(`Bad coordinate: ${v}`);
    return String(r(v));
  };
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case 'Z':
          return 'Z';
        default:
          throw new Error(`Unknown path command ${c.type}`);
      }
    })
    .join('');
}

/**
 * Lays out text letter by letter: each character's glyph, advanced by its
 * width plus the font's own kerning between pairs. (A wordmark doesn't need
 * full text shaping, which opentype.js can't do for every feature in this font.)
 */
function layout(text, x = 0) {
  const font = extraBold;
  const scale = SIZE / font.unitsPerEm;
  const glyphs = [];
  let cursor = x;
  let previous = null;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    if (previous) cursor += font.getKerningValue(previous, glyph) * scale;
    glyphs.push({ glyph, x: cursor });
    cursor += glyph.advanceWidth * scale;
    previous = glyph;
  }
  const pathOf = (g) => pathData(g.glyph.getPath(g.x, BASE, SIZE).commands);
  const box = (g) => {
    const b = g.glyph.getBoundingBox();
    return { x1: g.x + b.x1 * scale, x2: g.x + b.x2 * scale, top: BASE - b.y2 * scale, bottom: BASE - b.y1 * scale };
  };
  return { glyphs, pathOf, box, scale };
}

function union(...boxes) {
  return {
    x1: Math.min(...boxes.map((b) => b.x1)),
    x2: Math.max(...boxes.map((b) => b.x2)),
    top: Math.min(...boxes.map((b) => b.top)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
}

/** Wraps shapes in an SVG whose viewBox fits the given bounds plus padding. */
function svg(bounds, body, pad = 6) {
  const x = r(bounds.x1 - pad);
  const y = r(bounds.top - pad);
  const w = r(bounds.x2 - bounds.x1 + pad * 2);
  const h = r(bounds.bottom - bounds.top + pad * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
}

const stroke = (d, color, width) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r(width)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const fill = (d, color) => `<path d="${d}" fill="${color}"/>`;

/** A check mark centred on (cx, cy), w wide and h tall. */
function tickPath(cx, cy, w, h) {
  return `M${r(cx - w / 2)} ${r(cy)} L${r(cx - w / 8)} ${r(cy + h / 2)} L${r(cx + w / 2)} ${r(cy - h / 2)}`;
}

/** Width of the "ı" stem: the reference thickness for the tick. */
const STEM = (() => {
  const L = layout('ı');
  const b = L.box(L.glyphs[0]);
  return b.x2 - b.x1;
})();

/** The bold tick: as thick as the letter stem. */
function tickShape(cx, cy, color) {
  const w = STEM * 2.35;
  const h = STEM * 1.5;
  const sw = STEM;
  return {
    shapes: stroke(tickPath(cx, cy, w, h), color, sw),
    bounds: { x1: cx - w / 2 - sw / 2, x2: cx + w / 2 + sw / 2, top: cy - h / 2 - sw / 2, bottom: cy + h / 2 + sw / 2 },
  };
}

// ---------- The wordmark: a bold tick as the dot of the "i" ----------
function wordmark(variant) {
  const c = COLORS[variant];
  const L = layout('orderrıte'); // dotless ı: the tick replaces its dot
  const stem = L.box(L.glyphs[6]);
  // Centred where the regular "i" dot sits (between the x-height and ~745 font units).
  const tick = tickShape((stem.x1 + stem.x2) / 2 + STEM * 0.1, BASE - 690 * L.scale, c.accent);
  const letters = L.glyphs.map((g) => fill(L.pathOf(g), c.letters)).join('');
  return svg(union(...L.glyphs.map(L.box), { ...tick.bounds, bottom: BASE }), letters + tick.shapes);
}

// ---------- The app icon ----------
// Drawn full-bleed (square, no rounded corners): Android and iOS apply their own
// mask (circle, squircle, rounded square). The mark stays inside the Android
// adaptive-icon safe zone: a centred circle 66/108 of the width (about 61%).
const SAFE_ZONE = 66 / 108;

function iconFrame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${VIOLET.from}"/><stop offset="1" stop-color="${VIOLET.to}"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>${inner}</svg>\n`;
}

/** Scales a group (bounds b) so its corners fit inside the safe-zone circle, centred. */
function inSafeZone(shapes, b, fillRatio = 0.92) {
  const w = b.x2 - b.x1;
  const h = b.bottom - b.top;
  const radius = Math.hypot(w, h) / 2;
  const s = ((1024 * SAFE_ZONE) / 2 / radius) * fillRatio;
  const tx = 512 - (b.x1 + w / 2) * s;
  const ty = 512 - (b.top + h / 2) * s;
  return `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s)})">${shapes}</g>`;
}

/**
 * The app icon (chosen in Phase 3): an "o" with the tick built into its inside.
 * A thick ring with a real gap at the top right, where the tick's long arm
 * sweeps out past the ring. The tick is big and off-centre (low and left), so
 * it reads as "o + order done", not as a small "verified" badge.
 */
function appIcon() {
  const R = 40;
  const ringW = STEM * 1.2;
  const tickW = STEM * 1.2;
  const C = 2 * Math.PI * R;
  const gapStart = -74; // degrees (0 = 3 o'clock, negative = upwards)
  const gapEnd = -16;
  const gap = ((gapEnd - gapStart) / 360) * C;
  // Dash pattern: draw (C - gap), skip (gap); start drawing at gapEnd.
  const ring = `<circle cx="0" cy="0" r="${R}" fill="none" stroke="#FFFFFF" stroke-width="${r(ringW)}" stroke-linecap="round" stroke-dasharray="${r(C - gap)} ${r(gap)}" stroke-dashoffset="${r((-gapEnd / 360) * C)}"/>`;
  const out = R * 1.36;
  const angle = (-45 * Math.PI) / 180;
  const p1 = [-R * 0.38, R * 0.04];
  const p2 = [-R * 0.06, R * 0.38];
  const p3 = [out * Math.cos(angle), out * Math.sin(angle)];
  const tick = stroke(`M${r(p1[0])} ${r(p1[1])} L${r(p2[0])} ${r(p2[1])} L${r(p3[0])} ${r(p3[1])}`, tokens.accentOnViolet, tickW);
  const half = R + ringW / 2;
  return iconFrame(inSafeZone(ring + tick, { x1: -half, x2: Math.max(half, p3[0] + tickW / 2), top: Math.min(-half, p3[1] - tickW / 2), bottom: half }));
}

for (const variant of ['light', 'dark']) writeFileSync(path.join(OUT, `wordmark-${variant}.svg`), wordmark(variant));
writeFileSync(path.join(OUT, 'icon.svg'), appIcon());

// Manifest for the app: each file with its exact width/height ratio.
const ratioOf = (file) => {
  const m = readFileSync(path.join(OUT, `${file}.svg`), 'utf8').match(/viewBox="[^ ]+ [^ ]+ ([^ ]+) ([^"]+)"/);
  return r(Number(m[1]) / Number(m[2]));
};
writeFileSync(
  path.join(root, 'apps/mobile/src/brand/wordmarks.ts'),
  `// GENERATED by scripts/generate-wordmarks.mjs. Do not edit by hand.
// The Orderrite wordmark (option A) and the app icon (option 2), chosen in Phase 3,
// as single SVG drawings (letters are outlines from the font).

export interface BrandFile {
  source: number;
  /** width / height */
  ratio: number;
}

export const WORDMARK: { light: BrandFile; dark: BrandFile } = {
  light: { source: require('../../assets/brand/wordmark-light.svg'), ratio: ${ratioOf('wordmark-light')} },
  dark: { source: require('../../assets/brand/wordmark-dark.svg'), ratio: ${ratioOf('wordmark-dark')} },
};

/** The app icon: full-bleed square; the mark sits inside the Android safe zone. */
export const ICON: BrandFile = { source: require('../../assets/brand/icon.svg'), ratio: 1 };

/** Android adaptive-icon safe zone (66/108), as a fraction of the icon width. */
export const ICON_SAFE_ZONE = ${r(SAFE_ZONE)};
`,
);

// Safety check: no broken numbers anywhere.
for (const file of ['wordmark-light', 'wordmark-dark', 'icon']) {
  if (/NaN|Infinity/.test(readFileSync(path.join(OUT, `${file}.svg`), 'utf8'))) throw new Error(`${file}.svg has a broken number`);
}
console.log('Wrote the wordmark (light, dark) and the app icon (checked: no broken numbers)');
