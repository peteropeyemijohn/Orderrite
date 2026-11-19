import { requireOptionalNativeModule } from 'expo';
import { useEffect } from 'react';
import { Appearance, AppState, Platform } from 'react-native';

/**
 * Android's back/home/recents buttons sit on top of our (always light) screens,
 * so they must be dark. The app is light-only (`userInterfaceStyle: "light"`),
 * but when the phone is in Dark mode Android starts the window with white
 * buttons (they come from the system's dark splash theme), and the
 * `expo-navigation-bar` plugin setting alone doesn't win. So we set them again
 * at runtime: after the splash, and whenever the app returns to the front or
 * the phone's theme changes.
 *
 * We call the native module directly: the package's `setStyle()` remembers the
 * last value and skips repeats, but repeats are exactly what we need here.
 * "dark" = dark buttons (the module's own comment: dark content -> light background).
 */
const NavigationBarNative =
  Platform.OS === 'android' ? requireOptionalNativeModule<{ setStyle(style: 'dark' | 'light'): Promise<void> }>('ExpoNavigationBar') : null;

export function keepNavigationBarButtonsDark(): void {
  NavigationBarNative?.setStyle('dark').catch(() => undefined);
}

/** Re-applies dark buttons when the app comes back to the front or the phone's Light/Dark mode changes. */
export function useDarkNavigationBarButtons(): void {
  useEffect(() => {
    if (!NavigationBarNative) return;
    keepNavigationBarButtonsDark();
    const app = AppState.addEventListener('change', (state) => state === 'active' && keepNavigationBarButtonsDark());
    const theme = Appearance.addChangeListener(keepNavigationBarButtonsDark);
    return () => {
      app.remove();
      theme.remove();
    };
  }, []);
}
