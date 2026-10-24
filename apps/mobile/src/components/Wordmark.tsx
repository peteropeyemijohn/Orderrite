import { Image } from 'expo-image';
import { WORDMARKS, type WordmarkOption } from '@/brand/wordmarks';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The Orderrite wordmark: one SVG drawing per option (letters are outlines
 * from the font, so it looks identical on every phone). "light" = for light
 * backgrounds, "dark" = white letters for the violet hero.
 */
export const DEFAULT_WORDMARK: WordmarkOption = 'a';

export function Wordmark({
  option = DEFAULT_WORDMARK,
  variant = 'light',
  height,
  accessibilityLabel,
}: {
  option?: WordmarkOption;
  variant?: 'light' | 'dark' | 'icon';
  height?: number;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  const file = WORDMARKS[option][variant];
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
