import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { createTheme, DEFAULT_BRAND, type BrandOption, type Theme } from './theme';

interface ThemeContextValue {
  theme: Theme;
  /** Development only: switch brand colour in the design preview. */
  setBrand: (brand: BrandOption) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandOption>(DEFAULT_BRAND);
  const value = useMemo(() => ({ theme: createTheme(brand), setBrand }), [brand]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context.theme;
}

export function useSetBrand(): (brand: BrandOption) => void {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useSetBrand must be used inside ThemeProvider');
  return context.setBrand;
}

/** Builds a component's styles from the theme, rebuilt only when the theme changes. */
export function useStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
