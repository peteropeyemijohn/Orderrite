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
 * The violet start-up screen asks for white buttons while it shows. It is the
 * only place that does, and it always asks for dark again when it leaves
 * (see src/startup/StartupScreen.tsx).
 *
 * We call the native module directly: the package's `setStyle()` remembers the
 * last value and skips repeats, but repeats are exactly what we need here.
 * The native style names the background: "dark" = dark buttons (for a light
 * background), "light" = white buttons.
 */
const NavigationBarNative =
  Platform.OS === 'android' ? requireOptionalNativeModule<{ setStyle(style: 'dark' | 'light'): Promise<void> }>('ExpoNavigationBar') : null;

type ButtonColour = 'dark' | 'white';

/** The colour the buttons should have now. Re-applied on return to the app and on theme change. */
let wanted: ButtonColour = 'dark';

function apply(): void {
  NavigationBarNative?.setStyle(wanted === 'white' ? 'light' : 'dark').catch(() => undefined);
}

export function setNavigationBarButtons(colour: ButtonColour): void {
  wanted = colour;
  apply();
}

export function keepNavigationBarButtonsDark(): void {
  setNavigationBarButtons('dark');
}

/** Re-applies the wanted button colour when the app comes back to the front or the phone's Light/Dark mode changes. */
export function useDarkNavigationBarButtons(): void {
  useEffect(() => {
    if (!NavigationBarNative) return;
    apply();
    const app = AppState.addEventListener('change', (state) => state === 'active' && apply());
    const theme = Appearance.addChangeListener(apply);
    return () => {
      app.remove();
      theme.remove();
    };
  }, []);
}
