import type { Request } from 'express';
import { describeClientIp, maskIp } from './client-ip.js';

const SECRET = 's'.repeat(40);
const req = (headers: Record<string, string>, ip = '10.0.0.1') => ({ headers, ip }) as unknown as Request;

describe('describeClientIp', () => {
  it('trusts the IP forwarded by our web server only with the right secret', () => {
    const headers = { 'x-orderrite-client-ip': '2c0f:6dc0::1', 'x-orderrite-proxy-secret': SECRET };
    expect(describeClientIp(req(headers), { WEB_PROXY_SECRET: SECRET })).toMatchObject({ ip: '2c0f:6dc0::1', source: 'web server' });
    expect(describeClientIp(req({ ...headers, 'x-orderrite-proxy-secret': 'wrong'.repeat(8) }), { WEB_PROXY_SECRET: SECRET })).toEqual({
      ip: '10.0.0.1',
      source: 'proxy chain',
      webForward: 'secret does not match',
    });
  });

  it('ignores invisible spaces or line breaks around the secret (copy-paste)', () => {
    const headers = { 'x-orderrite-client-ip': '154.72.1.1', 'x-orderrite-proxy-secret': `${SECRET}\n` };
    expect(describeClientIp(req(headers), { WEB_PROXY_SECRET: ` ${SECRET} ` })).toMatchObject({ ip: '154.72.1.1', webForward: 'accepted' });
  });

  it('explains why a web request was not trusted', () => {
    expect(describeClientIp(req({}), { WEB_PROXY_SECRET: SECRET }).webForward).toBe('not sent (no forwarded IP header)');
    expect(describeClientIp(req({ 'x-orderrite-client-ip': '1.2.3.4' }), { WEB_PROXY_SECRET: SECRET }).webForward).toBe('no secret header sent');
    expect(describeClientIp(req({ 'x-orderrite-client-ip': '1.2.3.4', 'x-orderrite-proxy-secret': SECRET }), {}).webForward).toBe(
      'API has no WEB_PROXY_SECRET',
    );
  });
});

describe('maskIp', () => {
  it('hides the middle of IPv4 and most of IPv6 addresses', () => {
    expect(maskIp('154.72.120.69')).toBe('154.x.x.69');
    expect(maskIp('::ffff:154.72.120.69')).toBe('154.x.x.69');
    expect(maskIp('2c0f:6dc0:60d:3a00:503a:9f7c:9abe:cda2')).toBe('2c0f:6dc0:… (IPv6)');
  });
});
