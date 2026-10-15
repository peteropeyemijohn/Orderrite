import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';

/**
 * Each group of screens is only reachable by the right people:
 * signed out -> (auth), customers -> (customer), riders -> (rider),
 * admins and vendors -> staff ("please use the web dashboard").
 */
function RootStack() {
  const { status, user } = useAuth();
  const role = status === 'signedIn' ? user?.role : undefined;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AuthProvider>
  );
}
