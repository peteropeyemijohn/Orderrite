import * as SecureStore from 'expo-secure-store';

// The refresh token is kept in the phone's encrypted storage (Keychain on
// iPhone, Keystore on Android), so the user stays signed in after closing
// the app. The short-lived access token is only kept in memory.
const REFRESH_TOKEN_KEY = 'orderrite.refreshToken';

export const tokenStorage = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};
