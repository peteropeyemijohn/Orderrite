import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icons from Ionicons (free, MIT licence). Sizes come from the theme. */
export function Icon({ name, size = 'md', color }: { name: IconName; size?: keyof Theme['iconSize']; color?: string }) {
  const theme = useTheme();
  return <Ionicons name={name} size={theme.iconSize[size]} color={color ?? theme.colors.text} />;
}
