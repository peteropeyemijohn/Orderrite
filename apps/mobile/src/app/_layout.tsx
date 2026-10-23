// Only the 5 weights the theme uses (importing the whole family would bundle
// every weight and italic, about 1.8 MB).
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { wakeApi } from '@/lib/api';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// Start waking the free API server as soon as the app opens.
wakeApi();
// Keep the splash screen up until the font has loaded (no flash of the wrong font).
void SplashScreen.preventAutoHideAsync();

/**
 * Each group of screens is only reachable by the right people:
 * signed out -> (auth), customers -> (customer), riders -> (rider),
 * admins and vendors -> staff ("please use the web dashboard").
 * The design preview exists only in development builds (Expo Go).
 */
function RootStack() {
  const { status, user } = useAuth();
  const theme = useTheme();
  const role = status === 'signedIn' ? user?.role : undefined;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'CUSTOMER'}>
        <Stack.Screen name="(customer)" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'RIDER'}>
        <Stack.Screen name="(rider)" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'ADMIN' || role === 'VENDOR'}>
        <Stack.Screen name="staff" />
      </Stack.Protected>
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="dev-preview" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || Boolean(fontError); // if the font fails, carry on with the system font

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
