// Address of the Orderrite API. Set NEXT_PUBLIC_API_URL in apps/web/.env.local.
// Anything starting with NEXT_PUBLIC_ is visible in the browser: never put secrets here.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
