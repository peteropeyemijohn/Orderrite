// WCAG 2.1 contrast checks. AA requires 4.5:1 for normal text and 3:1 for
// large text (18 px+, or 14 px+ bold) and for icons and other graphics.

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgb(hex: string): [number, number, number] {
  const match = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)];
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map(channel);
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** A hex colour as a CSS rgba() string, e.g. withAlpha('#FFFFFF', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The solid colour you see when `top` at `alpha` is laid over `bottom`. */
export function blend(top: string, alpha: number, bottom: string): string {
  const t = rgb(top), b = rgb(bottom);
  return `#${t.map((c, i) => Math.round(c * alpha + b[i]! * (1 - alpha)).toString(16).padStart(2, '0')).join('')}`;
}

/** Contrast ratio between two colours, from 1 (same) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

export type ContrastLevel = 'normal' | 'large';

export function passesAA(foreground: string, background: string, level: ContrastLevel = 'normal'): boolean {
  return contrastRatio(foreground, background) >= (level === 'normal' ? 4.5 : 3);
}
