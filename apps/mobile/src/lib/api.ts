// Address of the Orderrite API. Set EXPO_PUBLIC_API_URL in apps/mobile/.env.
// On a real phone "localhost" means the phone itself, so during local
// development use your Mac's Wi-Fi address instead (e.g. http://192.168.1.20:4000).
// Anything starting with EXPO_PUBLIC_ is built into the app: never put secrets here.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
