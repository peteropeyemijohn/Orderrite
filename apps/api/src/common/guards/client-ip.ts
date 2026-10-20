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

/** Why a request from our web server was or wasn't trusted (for IP_DEBUG logs). */
export type WebForwardStatus =
  | 'accepted'
  | 'not sent (no forwarded IP header)'
  | 'no secret header sent'
  | 'secret does not match'
  | 'API has no WEB_PROXY_SECRET';

/** Like getClientIp, but also says where the IP came from (for IP_DEBUG logs). */
export function describeClientIp(
  req: Request,
  settings: ClientIpSettings,
): { ip: string; source: ClientIpSource; webForward: WebForwardStatus } {
  const forwarded = req.headers['x-orderrite-client-ip'];
  const secretHeader = req.headers['x-orderrite-proxy-secret'];
  const webForward = webForwardStatus(forwarded, secretHeader, settings.WEB_PROXY_SECRET);
  if (webForward === 'accepted' && typeof forwarded === 'string') {
    return { ip: forwarded.trim().slice(0, 64), source: 'web server', webForward };
  }

  if (settings.CLIENT_IP_HEADER) {
    const value = req.headers[settings.CLIENT_IP_HEADER];
    if (typeof value === 'string' && value.length > 0) {
      return { ip: value.split(',')[0]!.trim().slice(0, 64), source: 'edge header', webForward };
    }
  }

  return { ip: req.ip ?? 'unknown', source: 'proxy chain', webForward };
}

function webForwardStatus(forwarded: unknown, secretHeader: unknown, secret: string | undefined): WebForwardStatus {
  if (typeof forwarded !== 'string' || forwarded.trim() === '') return 'not sent (no forwarded IP header)';
  if (typeof secretHeader !== 'string' || secretHeader.trim() === '') return 'no secret header sent';
  if (!secret) return 'API has no WEB_PROXY_SECRET';
  return safeEqual(secretHeader.trim(), secret.trim()) ? 'accepted' : 'secret does not match';
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
