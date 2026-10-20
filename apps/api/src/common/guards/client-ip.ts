import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { Env } from '../../config/env.js';

export type ClientIpSettings = Pick<Env, 'WEB_PROXY_SECRET' | 'CLIENT_IP_HEADER'>;

/**
 * The visitor's IP address, used for rate limiting. In order:
 * 1. Requests from our own web server carry the real visitor IP in a header,
 *    trusted only when the shared WEB_PROXY_SECRET matches (otherwise every
 *    web visitor would share the web server's single IP).
 * 2. CLIENT_IP_HEADER, if configured (a header the hosting edge always sets).
 * 3. req.ip, which Express works out from X-Forwarded-For using "trust proxy"
 *    (the number of proxies in front of us), ignoring entries a visitor added.
 */
export function getClientIp(req: Request, settings: ClientIpSettings): string {
  return describeClientIp(req, settings).ip;
}

export type ClientIpSource = 'web server' | 'edge header' | 'proxy chain';

/** Like getClientIp, but also says where the IP came from (for IP_DEBUG logs). */
export function describeClientIp(req: Request, settings: ClientIpSettings): { ip: string; source: ClientIpSource } {
  const forwarded = req.headers['x-orderrite-client-ip'];
  const secretHeader = req.headers['x-orderrite-proxy-secret'];
  if (
    settings.WEB_PROXY_SECRET &&
    typeof forwarded === 'string' &&
    typeof secretHeader === 'string' &&
    safeEqual(secretHeader, settings.WEB_PROXY_SECRET)
  ) {
    return { ip: forwarded.slice(0, 64), source: 'web server' };
  }

  if (settings.CLIENT_IP_HEADER) {
    const value = req.headers[settings.CLIENT_IP_HEADER];
    if (typeof value === 'string' && value.length > 0) {
      return { ip: value.split(',')[0]!.trim().slice(0, 64), source: 'edge header' };
    }
  }

  return { ip: req.ip ?? 'unknown', source: 'proxy chain' };
}

/** Shortens an IP for logs: 154.x.x.69 or 2c0f:6dc0:… */
export function maskIp(ip: string): string {
  const v4 = ip.replace(/^::ffff:/, '').match(/^(\d+)\.\d+\.\d+\.(\d+)$/);
  if (v4) return `${v4[1]}.x.x.${v4[2]}`;
  const parts = ip.split(':');
  return parts.length > 2 ? `${parts.slice(0, 2).join(':')}:… (IPv6)` : 'unknown';
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
