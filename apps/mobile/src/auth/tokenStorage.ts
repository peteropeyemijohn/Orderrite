import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// The refresh token is kept in the phone's encrypted storage (Keychain on
// iPhone, Keystore on Android), so the user stays signed in after closing
// the app. The short-lived access token is only kept in memory.
const REFRESH_TOKEN_KEY = 'orderrite.refreshToken';

// Secure storage doesn't exist in a web browser (only used to preview screens
// during development). There we simply don't remember the sign-in.
const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  getRefreshToken: (): Promise<string | null> => (isWeb ? Promise.resolve(null) : SecureStore.getItemAsync(REFRESH_TOKEN_KEY)),
  setRefreshToken: (token: string): Promise<void> => (isWeb ? Promise.resolve() : SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)),
  clear: (): Promise<void> => (isWeb ? Promise.resolve() : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)),
};
