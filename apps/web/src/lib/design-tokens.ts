import type { CSSProperties } from "react";
import { ACTIVE_BRAND, brandPalettes, neutralColors, radius } from "shared";

/**
 * The shared design tokens as CSS variables, set once on <html>. Tailwind's
 * theme (globals.css) points at these, so the web uses the same colours and
 * radius as the mobile app, with no copied values.
 */
export function designTokenStyle(): CSSProperties {
  const colors = { ...neutralColors, ...brandPalettes[ACTIVE_BRAND] };
  const vars: Record<string, string> = {
    "--or-primary": colors.primary,
    "--or-primary-pressed": colors.primaryPressed,
    "--or-primary-soft": colors.primarySoft,
    "--or-on-primary": colors.onPrimary,
    "--or-background": colors.background,
    "--or-surface": colors.surface,
    "--or-surface-muted": colors.surfaceMuted,
    "--or-border": colors.border,
    "--or-text": colors.text,
    "--or-text-muted": colors.textMuted,
    "--or-text-subtle": colors.textSubtle,
    "--or-danger": colors.danger,
    "--or-danger-soft": colors.dangerSoft,
    "--or-radius-md": `${radius.md}px`,
    "--or-radius-lg": `${radius.lg}px`,
  };
  return vars as CSSProperties;
}
