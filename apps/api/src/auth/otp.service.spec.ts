import { HttpStatus } from '@nestjs/common';
import type { ApiError } from '../common/api-error.js';
import { FakeClock, FakeOtpProvider, FakeOtpStore } from '../test-utils/fakes.js';
import { OTP_RULES, OtpService } from './otp.service.js';

const PHONE = '+2348031234567';

function setup(canSend = true) {
  const clock = new FakeClock();
  const store = new FakeOtpStore();
  const provider = new FakeOtpProvider(canSend);
  const service = new OtpService(store, provider, clock, { OTP_HASH_SECRET: 's'.repeat(40) });
  return { clock, store, provider, service };
}

async function errorCode(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return (error as ApiError).code;
  }
}

function wrongCodeFor(code: string) {
  return code === '000000' ? '111111' : '000000';
}

describe('OtpService', () => {
  it('sends a 6-digit code and stores only a hash', async () => {
    const { service, provider, store } = setup();
    await service.requestCode(PHONE, { useDemoCode: false });

    expect(provider.lastCode).toMatch(/^\d{6}$/);
    expect(store.rows[0]!.codeHash).not.toContain(provider.lastCode);
    expect(store.rows[0]!.codeHash).toHaveLength(64);
  });

  it('accepts the right code once', async () => {
    const { service, provider } = setup();
    await service.requestCode(PHONE, { useDemoCode: false });

    await expect(service.verifyCode(PHONE, provider.lastCode!)).resolves.toBeUndefined();
    expect(await errorCode(service.verifyCode(PHONE, provider.lastCode!))).toBe('CODE_NOT_FOUND');
  });

  it('does not accept a code for a different phone', async () => {
    const { service, provider } = setup();
    await service.requestCode(PHONE, { useDemoCode: false });
    await service.requestCode('+2348039999999', { useDemoCode: false });
    const otherCode = provider.lastCode!;
    expect(await errorCode(service.verifyCode(PHONE, otherCode))).toMatch(/WRONG_CODE|CODE_NOT_FOUND/);
  });

  describe('expiry', () => {
    it('accepts a code just before 5 minutes', async () => {
      const { service, provider, clock } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      clock.advanceSeconds(OTP_RULES.ttlSeconds - 1);
      await expect(service.verifyCode(PHONE, provider.lastCode!)).resolves.toBeUndefined();
    });

    it('rejects a code after 5 minutes', async () => {
      const { service, provider, clock } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      clock.advanceSeconds(OTP_RULES.ttlSeconds + 1);
      expect(await errorCode(service.verifyCode(PHONE, provider.lastCode!))).toBe('CODE_EXPIRED');
    });
  });

  describe('wrong attempts', () => {
    it('counts down tries left', async () => {
      const { service, provider } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      try {
        await service.verifyCode(PHONE, wrongCodeFor(provider.lastCode!));
        expect.unreachable();
      } catch (error) {
        const response = (error as ApiError).getResponse() as Record<string, unknown>;
        expect(response.code).toBe('WRONG_CODE');
        expect(response.attemptsLeft).toBe(4);
      }
    });

    it('locks the code after 5 wrong tries, even for the right code', async () => {
      const { service, provider } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      const right = provider.lastCode!;
      const wrong = wrongCodeFor(right);

      for (let i = 0; i < 4; i++) expect(await errorCode(service.verifyCode(PHONE, wrong))).toBe('WRONG_CODE');
      expect(await errorCode(service.verifyCode(PHONE, wrong))).toBe('TOO_MANY_ATTEMPTS');
      expect(await errorCode(service.verifyCode(PHONE, right))).toBe('TOO_MANY_ATTEMPTS');
    });

    it('a new code starts fresh', async () => {
      const { service, provider, clock } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      for (let i = 0; i < 5; i++) await errorCode(service.verifyCode(PHONE, wrongCodeFor(provider.lastCode!)));
      clock.advanceSeconds(OTP_RULES.resendCooldownSeconds);
      await service.requestCode(PHONE, { useDemoCode: false });
      await expect(service.verifyCode(PHONE, provider.lastCode!)).resolves.toBeUndefined();
    });
  });

  describe('per-phone rate limits', () => {
    it('makes you wait 60 seconds before resending', async () => {
      const { service, clock } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      clock.advanceSeconds(30);
      try {
        await service.requestCode(PHONE, { useDemoCode: false });
        expect.unreachable();
      } catch (error) {
        const e = error as ApiError;
        expect(e.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect((e.getResponse() as Record<string, unknown>).retryAfterSeconds).toBe(30);
      }
      clock.advanceSeconds(30);
      await expect(service.requestCode(PHONE, { useDemoCode: false })).resolves.toBeDefined();
    });

    it('allows at most 5 codes per hour', async () => {
      const { service, clock } = setup();
      for (let i = 0; i < OTP_RULES.maxPerHour; i++) {
        await service.requestCode(PHONE, { useDemoCode: false });
        clock.advanceSeconds(OTP_RULES.resendCooldownSeconds);
      }
      expect(await errorCode(service.requestCode(PHONE, { useDemoCode: false }))).toBe('TOO_MANY_CODES');
      clock.advanceSeconds(60 * 60);
      await expect(service.requestCode(PHONE, { useDemoCode: false })).resolves.toBeDefined();
    });

    it('a new code replaces the old one', async () => {
      const { service, provider, clock } = setup();
      await service.requestCode(PHONE, { useDemoCode: false });
      const first = provider.lastCode!;
      clock.advanceSeconds(OTP_RULES.resendCooldownSeconds);
      await service.requestCode(PHONE, { useDemoCode: false });
      if (first !== provider.lastCode) {
        expect(await errorCode(service.verifyCode(PHONE, first))).toBe('WRONG_CODE');
      }
    });
  });

  it('uses the published demo code only when asked to', async () => {
    const { service, provider } = setup();
    await service.requestCode(PHONE, { useDemoCode: true });
    expect(provider.lastCode).toBe('123456');
  });

  it('refuses to create codes when no provider can send', async () => {
    const { service, store } = setup(false);
    expect(await errorCode(service.requestCode(PHONE, { useDemoCode: false }))).toBe('OTP_UNAVAILABLE');
    expect(store.rows).toHaveLength(0);
  });
});
