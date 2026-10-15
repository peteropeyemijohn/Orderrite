import 'server-only';

// Settings used ONLY on the Next.js server (never sent to the browser).
/** Where the Next.js server reaches the API. */
export const API_URL = process.env.API_URL ?? 'http://localhost:4000';
/**
 * Optional shared secret with the API. When set, the API trusts the visitor IP
 * we forward, so each web visitor gets their own rate limit.
 */
export const WEB_PROXY_SECRET = process.env.WEB_PROXY_SECRET;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
