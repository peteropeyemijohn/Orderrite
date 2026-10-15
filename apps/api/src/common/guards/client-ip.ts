import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/**
 * The visitor's IP address, used for rate limiting.
 * Normally this is req.ip (Express handles proxies via "trust proxy").
 * Requests from our own web server carry the real visitor IP in a header,
 * which is only trusted when the shared WEB_PROXY_SECRET matches; otherwise
 * every web visitor would share the web server's single IP.
 */
export function getClientIp(req: Request, webProxySecret?: string): string {
  const forwarded = req.headers['x-orderrite-client-ip'];
  const secretHeader = req.headers['x-orderrite-proxy-secret'];
  if (webProxySecret && typeof forwarded === 'string' && typeof secretHeader === 'string' && safeEqual(secretHeader, webProxySecret)) {
    return forwarded.slice(0, 64);
  }
  return req.ip ?? 'unknown';
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
