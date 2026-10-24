import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme | null>(null);

/** Provides the Orderrite theme (Violet, chosen in Phase 3) to every component. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createTheme(), []);
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}

/** Builds a component's styles from the theme, rebuilt only when the theme changes. */
export function useStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
