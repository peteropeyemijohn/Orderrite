import { Image } from 'expo-image';
import { WORDMARK } from '@/brand/wordmarks';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The Orderrite wordmark (option A, chosen in Phase 3): one SVG drawing whose
 * letters are outlines from the font, with a bold tick as the dot of the "i".
 * "light" = for light backgrounds, "dark" = white letters for violet.
 */
export function Wordmark({
  variant = 'light',
  height,
  accessibilityLabel,
}: {
  variant?: 'light' | 'dark';
  height?: number;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  const file = WORDMARK[variant];
  const h = height ?? theme.sizes.heroWordmark;
  return (
    <Image
      source={file.source}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ height: h, width: h * file.ratio }}
    />
  );
}
