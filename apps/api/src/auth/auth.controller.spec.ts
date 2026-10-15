// HTTP-level checks for the auth endpoints: per-IP rate limits and input rules.
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { IpThrottlerGuard } from '../common/guards/ip-throttler.guard.js';
import { ENV } from '../config/env.js';
import { AUTH_IP_LIMITS, AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const WEB_PROXY_SECRET = 'w'.repeat(40);

async function makeApp(options: { trustProxyHops?: number; clientIpHeader?: string } = {}) {
  const auth = {
    requestCode: vi.fn((phone: string) => Promise.resolve({ phone, expiresInSeconds: 300, resendInSeconds: 60 })),
    verifyCode: vi.fn(() => Promise.resolve({})),
  };
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 60_000, limit: 1000 }] })],
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: ENV, useValue: { WEB_PROXY_SECRET, CLIENT_IP_HEADER: options.clientIpHeader } },
      { provide: APP_GUARD, useClass: IpThrottlerGuard },
    ],
  }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  // Same setting as main.ts: how many proxies sit in front of the API.
  app.set('trust proxy', options.trustProxyHops ?? 0);
  await app.init();
  return { app, auth };
}

describe('AuthController', () => {
  let app: INestApplication;
  let auth: Awaited<ReturnType<typeof makeApp>>['auth'];

  beforeEach(async () => {
    ({ app, auth } = await makeApp());
  });
  afterEach(() => app.close());

  const requestCode = (headers: Record<string, string> = {}) =>
    request(app.getHttpServer()).post('/auth/otp/request').set(headers).send({ phone: '08031234567' });

  it('limits code requests per IP address', async () => {
    for (let i = 0; i < AUTH_IP_LIMITS.requestCode.limit; i++) await requestCode().expect(200);
    const blocked = await requestCode().expect(429);
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('limits code checks per IP address', async () => {
    const verify = () =>
      request(app.getHttpServer()).post('/auth/otp/verify').send({ phone: '08031234567', code: '123456' });
    for (let i = 0; i < AUTH_IP_LIMITS.verifyCode.limit; i++) await verify().expect(200);
    await verify().expect(429);
  });

  it('ignores a forwarded IP header without the shared secret (cannot dodge the limit)', async () => {
    for (let i = 0; i < AUTH_IP_LIMITS.requestCode.limit; i++) {
      await requestCode({ 'x-orderrite-client-ip': `10.0.0.${i}` }).expect(200);
    }
    await requestCode({ 'x-orderrite-client-ip': '10.0.0.99' }).expect(429);
  });

  it('counts each visitor separately when our web server forwards their IP with the secret', async () => {
    for (let i = 0; i < AUTH_IP_LIMITS.requestCode.limit; i++) {
      await requestCode({ 'x-orderrite-client-ip': '10.0.0.1', 'x-orderrite-proxy-secret': WEB_PROXY_SECRET }).expect(200);
    }
    await requestCode({ 'x-orderrite-client-ip': '10.0.0.1', 'x-orderrite-proxy-secret': WEB_PROXY_SECRET }).expect(429);
    await requestCode({ 'x-orderrite-client-ip': '10.0.0.2', 'x-orderrite-proxy-secret': WEB_PROXY_SECRET }).expect(200);
  });

  it('rejects extra fields, so nobody can choose their own role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/otp/verify')
      .send({ phone: '08031234567', code: '123456', role: 'ADMIN' })
      .expect(400);
    expect(res.body.code).toBe('INVALID_INPUT');
    expect(auth.verifyCode).not.toHaveBeenCalled();
  });

  it('rejects codes that are not 6 digits', async () => {
    await request(app.getHttpServer()).post('/auth/otp/verify').send({ phone: '08031234567', code: '12ab' }).expect(400);
  });
});

// Simulates the hosting proxy (e.g. Render): it adds the visitor's real IP to
// the END of X-Forwarded-For. Anything a visitor writes in that header themselves
// ends up at the START, so it must be ignored.
describe('AuthController behind a hosting proxy', () => {
  const limit = AUTH_IP_LIMITS.requestCode.limit;
  let app: INestApplication;
  afterEach(() => app.close());

  const fromVisitor = (realIp: string, spoofed?: string) =>
    request(app.getHttpServer())
      .post('/auth/otp/request')
      .set('X-Forwarded-For', spoofed ? `${spoofed}, ${realIp}` : realIp)
      .send({ phone: '08031234567' });

  it('gives two different visitors separate limits', async () => {
    ({ app } = await makeApp({ trustProxyHops: 1 }));
    for (let i = 0; i < limit; i++) await fromVisitor('203.0.113.10').expect(200);
    await fromVisitor('203.0.113.10').expect(429);
    // A second visitor is not affected by the first one's limit.
    await fromVisitor('198.51.100.20').expect(200);
  });

  it('cannot be dodged by writing a fake IP into X-Forwarded-For', async () => {
    ({ app } = await makeApp({ trustProxyHops: 1 }));
    for (let i = 0; i < limit; i++) await fromVisitor('203.0.113.10', `10.0.0.${i}`).expect(200);
    await fromVisitor('203.0.113.10', '10.9.9.9').expect(429);
  });

  it('with a wrong (too low) proxy count, everyone would share one limit: this is what the live check guards against', async () => {
    ({ app } = await makeApp({ trustProxyHops: 0 }));
    for (let i = 0; i < limit; i++) await fromVisitor(`203.0.113.${i}`).expect(200);
    await fromVisitor('198.51.100.20').expect(429);
  });

  it('can use a configured edge header (e.g. cf-connecting-ip) for the visitor IP', async () => {
    ({ app } = await makeApp({ clientIpHeader: 'cf-connecting-ip' }));
    const send = (ip: string) =>
      request(app.getHttpServer()).post('/auth/otp/request').set('cf-connecting-ip', ip).send({ phone: '08031234567' });
    for (let i = 0; i < limit; i++) await send('203.0.113.10').expect(200);
    await send('203.0.113.10').expect(429);
    await send('198.51.100.20').expect(200);
  });
});

