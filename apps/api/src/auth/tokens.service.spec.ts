import { JwtService } from '@nestjs/jwt';
import type { ApiError } from '../common/api-error.js';
import { FakeClock, FakeRefreshTokenStore } from '../test-utils/fakes.js';
import { TokensService } from './tokens.service.js';

const user = { id: 'user-1', role: 'CUSTOMER' as const };

function setup() {
  const clock = new FakeClock();
  const store = new FakeRefreshTokenStore();
  const jwt = new JwtService({ secret: 'j'.repeat(40) });
  const service = new TokensService(jwt, store, clock, { ACCESS_TOKEN_TTL_MINUTES: 15, REFRESH_TOKEN_TTL_DAYS: 30 });
  return { clock, store, service };
}

async function errorCode(promise: Promise<unknown>) {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return (error as ApiError).code;
  }
}

describe('TokensService', () => {
  it('issues an access token with the user id and role, and stores only a hash of the refresh token', async () => {
    const { service, store } = setup();
    const pair = await service.issue(user);
    const payload = await service.verifyAccessToken(pair.accessToken);

    expect(payload).toMatchObject({ sub: 'user-1', role: 'CUSTOMER' });
    expect(pair.accessTokenExpiresIn).toBe(900);
    expect(store.rows[0]!.tokenHash).not.toBe(pair.refreshToken);
  });

  it('lets a refresh token be used once', async () => {
    const { service } = setup();
    const pair = await service.issue(user);

    const rotated = await service.rotate(pair.refreshToken);
    expect(rotated.userId).toBe('user-1');
    expect(await errorCode(service.rotate(pair.refreshToken))).toBe('SESSION_EXPIRED');
  });

  it('revokes the whole sign-in when an old refresh token is reused (possible theft)', async () => {
    const { service } = setup();
    const first = await service.issue(user);
    const { familyId } = await service.rotate(first.refreshToken);
    const second = await service.continueFamily(user, familyId);

    // Someone replays the first (already used) token...
    expect(await errorCode(service.rotate(first.refreshToken))).toBe('SESSION_EXPIRED');
    // ...so even the newest token stops working.
    expect(await errorCode(service.rotate(second.refreshToken))).toBe('SESSION_EXPIRED');
  });

  it('rejects expired refresh tokens', async () => {
    const { service, clock } = setup();
    const pair = await service.issue(user);
    clock.advanceSeconds(31 * 24 * 60 * 60);
    expect(await errorCode(service.rotate(pair.refreshToken))).toBe('SESSION_EXPIRED');
  });

  it('logs out by revoking the refresh token', async () => {
    const { service } = setup();
    const pair = await service.issue(user);
    await service.revoke(pair.refreshToken);
    expect(await errorCode(service.rotate(pair.refreshToken))).toBe('SESSION_EXPIRED');
  });

  it('rejects made-up refresh tokens', async () => {
    const { service } = setup();
    expect(await errorCode(service.rotate('not-a-real-token'))).toBe('SESSION_EXPIRED');
  });
});
