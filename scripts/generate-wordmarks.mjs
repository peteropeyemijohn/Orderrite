#!/usr/bin/env node
// Generates the Orderrite wordmark options as single SVG drawings.
// Letters are OUTLINES taken from the Plus Jakarta Sans font file (Open Font
// Licence), so every logo looks identical on every phone and accents line up
// exactly with the letters (e.g. the tick sits precisely over the "i").
//
//   node scripts/generate-wordmarks.mjs
//
// Output: apps/mobile/assets/brand/wordmark-<a|b|c|d>-<light|dark>.svg and icon-<a|b|c|d>.svg
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const fontFile = (weight) =>
  require.resolve(`@expo-google-fonts/plus-jakarta-sans/${weight}/PlusJakartaSans_${weight}.ttf`, { paths: [path.join(root, 'apps/mobile')] });
const load = (weight) => opentype.parse(readFileSync(fontFile(weight)).buffer);
const extraBold = load('800ExtraBold');
const bold = load('700Bold');

const OUT = path.join(root, 'apps/mobile/assets/brand');
const SIZE = 100; // font size in SVG units
const BASE = 100; // baseline y
const COLORS = {
  light: { letters: '#16151A', accent: '#5B3DF5' },
  dark: { letters: '#FFFFFF', accent: '#C9BEFF' },
};
const VIOLET = { from: '#6B4BFF', to: '#3A1FB8' };
const r = (n) => Math.round(n * 100) / 100;

/**
 * SVG path data from opentype.js commands. Written here because opentype's own
 * toPathData() sometimes prints "NaN" for values like 106.9999 (a rounding bug),
 * which breaks letters. Also closes every contour with Z.
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
function layout(font, text, x = 0) {
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
  return { glyphs, pathOf, box, scale, end: cursor };
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

function union(...boxes) {
  return {
    x1: Math.min(...boxes.map((b) => b.x1)),
    x2: Math.max(...boxes.map((b) => b.x2)),
    top: Math.min(...boxes.map((b) => b.top)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
}

// ---------- (a) Tick as the dot of the "i" ----------
function wordmarkA(variant) {
  const c = COLORS[variant];
  const L = layout(extraBold, 'orderrıte'); // dotless ı: the tick replaces its dot
  const iGlyph = L.glyphs[6];
  const stem = L.box(iGlyph);
  const stemWidth = stem.x2 - stem.x1;
  // The regular "i" dot sits between the x-height and ~745 units; centre the tick there.
  const dotCenterY = BASE - 680 * L.scale;
  const cx = (stem.x1 + stem.x2) / 2 + stemWidth * 0.12;
  const w = stemWidth * 2.1;
  const h = stemWidth * 1.35;
  const strokeW = stemWidth * 0.78;
  const letters = L.glyphs.map((g) => fill(L.pathOf(g), c.letters)).join('');
  const tick = stroke(tickPath(cx, dotCenterY, w, h), c.accent, strokeW);
  const bounds = union(...L.glyphs.map(L.box), { x1: cx - w / 2 - strokeW / 2, x2: cx + w / 2 + strokeW / 2, top: dotCenterY - h / 2 - strokeW / 2, bottom: BASE });
  return svg(bounds, letters + tick);
}

// ---------- (b) "O" ring monogram with a tick cut into it ----------
function ringWithTick(cx, cy, R, ringColor, tickColor, ringWidth) {
  // The ring is a circle stroke with a gap (dash pattern) at the upper right,
  // where the tick passes through: that gap is the "cut".
  const C = 2 * Math.PI * R;
  const gapStart = -64; // degrees (0 = 3 o'clock, negative = upwards)
  const gapEnd = -28;
  const gap = ((gapEnd - gapStart) / 360) * C;
  const ring = `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R)}" fill="none" stroke="${ringColor}" stroke-width="${r(ringWidth)}" stroke-linecap="round" stroke-dasharray="${r(C - gap)} ${r(gap)}" stroke-dashoffset="${r((-gapEnd / 360) * C * -1)}"/>`;
  const p1 = [cx - R * 0.42, cy + R * 0.02];
  const p2 = [cx - R * 0.08, cy + R * 0.38];
  // The long arm leaves the ring through the gap (centre -46 degrees).
  const out = R * 1.18;
  const p3 = [cx + out * Math.cos((-46 * Math.PI) / 180), cy + out * Math.sin((-46 * Math.PI) / 180)];
  const tick = stroke(`M${r(p1[0])} ${r(p1[1])} L${r(p2[0])} ${r(p2[1])} L${r(p3[0])} ${r(p3[1])}`, tickColor, ringWidth * 0.95);
  return { shapes: ring + tick, bounds: { x1: cx - R - ringWidth, x2: Math.max(cx + R + ringWidth, p3[0] + ringWidth), top: Math.min(cy - R - ringWidth, p3[1] - ringWidth), bottom: cy + R + ringWidth } };
}

function wordmarkB(variant) {
  const c = COLORS[variant];
  const o = layout(extraBold, 'o');
  const ob = o.box(o.glyphs[0]);
  const R = (ob.bottom - ob.top) / 2 - 6;
  const ringWidth = 14.5;
  const cx = (ob.x1 + ob.x2) / 2;
  const cy = (ob.top + ob.bottom) / 2;
  const mono = ringWithTick(cx, cy, R, c.letters, c.accent, ringWidth);
  const rest = layout(extraBold, 'rderrite', ob.x2 + 7);
  const letters = rest.glyphs.map((g) => fill(rest.pathOf(g), c.letters)).join('');
  return svg(union(mono.bounds, ...rest.glyphs.map(rest.box)), mono.shapes + letters);
}

// ---------- (c) Soft lowercase with a swoosh from the last "e" ----------
function wordmarkC(variant) {
  const c = COLORS[variant];
  const L = layout(bold, 'orderrite');
  const e = L.box(L.glyphs[L.glyphs.length - 1]);
  // Start at the lower right of the "e" and sweep out and up like motion.
  const x0 = e.x2 - 4;
  const y0 = e.bottom - 12;
  const d = `M${r(x0)} ${r(y0)} C${r(x0 + 16)} ${r(y0 + 8)} ${r(x0 + 38)} ${r(y0 + 2)} ${r(x0 + 52)} ${r(y0 - 26)}`;
  const letters = L.glyphs.map((g) => fill(L.pathOf(g), c.letters)).join('');
  const sw = 9;
  return svg(union(...L.glyphs.map(L.box), { x1: x0, x2: x0 + 52 + sw, top: y0 - 26 - sw, bottom: y0 + 8 + sw }), letters + stroke(d, c.accent, sw));
}

// ---------- (d) Bag-handle "o" ----------
function bagO(ob, color, width) {
  const cx = (ob.x1 + ob.x2) / 2;
  // A wide, low arc like a carrier-bag handle (a tall narrow hoop would read as a padlock).
  const rx = (ob.x2 - ob.x1) * 0.4;
  const top = ob.top + 8;
  const lift = 16;
  const d = `M${r(cx - rx)} ${r(top)} C${r(cx - rx * 0.6)} ${r(top - lift)} ${r(cx + rx * 0.6)} ${r(top - lift)} ${r(cx + rx)} ${r(top)}`;
  return { shapes: stroke(d, color, width), bounds: { x1: cx - rx - width, x2: cx + rx + width, top: top - lift - width, bottom: top } };
}

function wordmarkD(variant) {
  const c = COLORS[variant];
  const L = layout(extraBold, 'orderrite');
  const ob = L.box(L.glyphs[0]);
  const handle = bagO(ob, c.accent, 10);
  const letters = L.glyphs.map((g) => fill(L.pathOf(g), c.letters)).join('');
  return svg(union(...L.glyphs.map(L.box), handle.bounds), handle.shapes + letters);
}

// ---------- App icons (rounded square, violet gradient, white mark) ----------
function iconFrame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${VIOLET.from}"/><stop offset="1" stop-color="${VIOLET.to}"/></linearGradient></defs><rect width="1024" height="1024" rx="232" fill="url(#g)"/>${inner}</svg>\n`;
}

/** Scales and centres a group drawn in font units (box given) into the icon. */
function centred(shapes, b, target = 560) {
  const w = b.x2 - b.x1;
  const h = b.bottom - b.top;
  const s = target / Math.max(w, h);
  const tx = 512 - (b.x1 + w / 2) * s;
  const ty = 512 - (b.top + h / 2) * s;
  return `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s)})">${shapes}</g>`;
}

function iconA() {
  const L = layout(extraBold, 'ı');
  const stem = L.box(L.glyphs[0]);
  const sw = stem.x2 - stem.x1;
  const cx = (stem.x1 + stem.x2) / 2 + sw * 0.12;
  const cy = BASE - 680 * L.scale;
  const shapes = fill(L.pathOf(L.glyphs[0]), '#FFFFFF') + stroke(tickPath(cx, cy, sw * 2.1, sw * 1.35), '#C9BEFF', sw * 0.78);
  return iconFrame(centred(shapes, { x1: cx - sw * 1.5, x2: cx + sw * 1.5, top: cy - sw * 1.2, bottom: stem.bottom }, 520));
}
function iconB() {
  const m = ringWithTick(0, 0, 40, '#FFFFFF', '#C9BEFF', 14);
  return iconFrame(centred(m.shapes, m.bounds, 560));
}
function iconC() {
  const L = layout(bold, 'o');
  const ob = L.box(L.glyphs[0]);
  const x0 = ob.x2 - 4;
  const y0 = ob.bottom - 12;
  const d = `M${r(x0)} ${r(y0)} C${r(x0 + 16)} ${r(y0 + 8)} ${r(x0 + 38)} ${r(y0 + 2)} ${r(x0 + 52)} ${r(y0 - 26)}`;
  const shapes = fill(L.pathOf(L.glyphs[0]), '#FFFFFF') + stroke(d, '#C9BEFF', 9);
  return iconFrame(centred(shapes, union(ob, { x1: x0, x2: x0 + 61, top: y0 - 35, bottom: y0 + 17 }), 600));
}
function iconD() {
  const L = layout(extraBold, 'o');
  const ob = L.box(L.glyphs[0]);
  const handle = bagO(ob, '#C9BEFF', 10);
  return iconFrame(centred(fill(L.pathOf(L.glyphs[0]), '#FFFFFF') + handle.shapes, union(ob, handle.bounds), 520));
}

const makers = { a: wordmarkA, b: wordmarkB, c: wordmarkC, d: wordmarkD };
const icons = { a: iconA, b: iconB, c: iconC, d: iconD };
for (const [key, make] of Object.entries(makers)) {
  for (const variant of ['light', 'dark']) writeFileSync(path.join(OUT, `wordmark-${key}-${variant}.svg`), make(variant));
  writeFileSync(path.join(OUT, `icon-${key}.svg`), icons[key]());
}
// A manifest for the app: each file with its exact width/height ratio.
const ratioOf = (file) => {
  const m = readFileSync(path.join(OUT, `${file}.svg`), 'utf8').match(/viewBox="[^ ]+ [^ ]+ ([^ ]+) ([^"]+)"/);
  return r(Number(m[1]) / Number(m[2]));
};
const entries = ['a', 'b', 'c', 'd']
  .map((k) => `  ${k}: {\n    light: { source: require('../../assets/brand/wordmark-${k}-light.svg'), ratio: ${ratioOf(`wordmark-${k}-light`)} },\n    dark: { source: require('../../assets/brand/wordmark-${k}-dark.svg'), ratio: ${ratioOf(`wordmark-${k}-dark`)} },\n    icon: { source: require('../../assets/brand/icon-${k}.svg'), ratio: 1 },\n  },`)
  .join('\n');
writeFileSync(
  path.join(root, 'apps/mobile/src/brand/wordmarks.ts'),
  `// GENERATED by scripts/generate-wordmarks.mjs. Do not edit by hand.\n// The wordmark options as single SVG drawings (letters are outlines from the font).\n\nexport const WORDMARK_OPTIONS = ['a', 'b', 'c', 'd'] as const;\nexport type WordmarkOption = (typeof WORDMARK_OPTIONS)[number];\n\nexport interface WordmarkFile {\n  source: number;\n  /** width / height */\n  ratio: number;\n}\n\nexport const WORDMARKS: Record<WordmarkOption, { light: WordmarkFile; dark: WordmarkFile; icon: WordmarkFile }> = {\n${entries}\n};\n`,
);

// Safety check: no broken numbers anywhere.
for (const file of ['a', 'b', 'c', 'd'].flatMap((k) => [`wordmark-${k}-light`, `wordmark-${k}-dark`, `icon-${k}`])) {
  if (/NaN|Infinity/.test(readFileSync(path.join(OUT, `${file}.svg`), 'utf8'))) throw new Error(`${file}.svg has a broken number`);
}
console.log('Wrote 8 wordmarks and 4 icons to apps/mobile/assets/brand (checked: no broken numbers)');
