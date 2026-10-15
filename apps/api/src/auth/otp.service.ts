import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { Clock } from '../common/clock.js';
import { ENV, type Env } from '../config/env.js';
import { DEMO_OTP_CODE } from './demo-accounts.js';
import { OtpProvider } from './otp-providers/otp-provider.js';
import { OtpStore } from './otp.store.js';

export const OTP_RULES = {
  /** How long a code works */
  ttlSeconds: 5 * 60,
  /** Wrong guesses allowed before the code stops working */
  maxAttempts: 5,
  /** Wait between two code requests for the same phone */
  resendCooldownSeconds: 60,
  /** Most codes one phone can request per hour */
  maxPerHour: 5,
} as const;

export interface RequestCodeResult {
  expiresInSeconds: number;
  resendInSeconds: number;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly store: OtpStore,
    private readonly provider: OtpProvider,
    private readonly clock: Clock,
    @Inject(ENV) private readonly env: Pick<Env, 'OTP_HASH_SECRET'>,
  ) {}

  get canSend(): boolean {
    return this.provider.canSend;
  }

  /**
   * Creates a new code for this phone and sends it.
   * useDemoCode: use the published demo code instead of a random one
   * (decided by AuthService, only ever true in DEMO_MODE).
   */
  async requestCode(phone: string, options: { ipAddress?: string; useDemoCode: boolean }): Promise<RequestCodeResult> {
    if (!this.provider.canSend) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        'OTP_UNAVAILABLE',
        'Sign-in codes cannot be sent right now. Please try again later.',
      );
    }
    const now = this.clock.now();

    const latest = await this.store.findLatest(phone);
    if (latest) {
      const secondsSince = (now.getTime() - latest.createdAt.getTime()) / 1000;
      if (secondsSince < OTP_RULES.resendCooldownSeconds) {
        const retryAfterSeconds = Math.ceil(OTP_RULES.resendCooldownSeconds - secondsSince);
        throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'RESEND_TOO_SOON', `Please wait ${retryAfterSeconds} seconds before asking for a new code.`, { retryAfterSeconds });
      }
    }

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if ((await this.store.countSince(phone, oneHourAgo)) >= OTP_RULES.maxPerHour) {
      throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_CODES', 'Too many codes requested for this number. Please try again in an hour.');
    }

    const code = options.useDemoCode ? DEMO_OTP_CODE : randomInt(0, 1_000_000).toString().padStart(6, '0');

    // A new code replaces any older one.
    await this.store.consumeAll(phone, now);
    await this.store.create({
      phone,
      codeHash: this.hash(phone, code),
      expiresAt: new Date(now.getTime() + OTP_RULES.ttlSeconds * 1000),
      ipAddress: options.ipAddress,
      createdAt: now,
    });
    await this.provider.send(phone, code);

    return { expiresInSeconds: OTP_RULES.ttlSeconds, resendInSeconds: OTP_RULES.resendCooldownSeconds };
  }

  /** Checks a code. Throws a clear error if it is wrong, expired or used up. */
  async verifyCode(phone: string, code: string): Promise<void> {
    const now = this.clock.now();
    const latest = await this.store.findLatest(phone);

    if (!latest || latest.consumedAt) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'CODE_NOT_FOUND', 'No active code for this number. Please ask for a new code.');
    }
    if (latest.expiresAt <= now) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'CODE_EXPIRED', 'This code has expired. Please ask for a new code.');
    }
    if (latest.attempts >= OTP_RULES.maxAttempts) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'TOO_MANY_ATTEMPTS', 'Too many wrong tries. Please ask for a new code.');
    }

    if (!this.matches(latest.codeHash, this.hash(phone, code))) {
      const attempts = await this.store.incrementAttempts(latest.id);
      const attemptsLeft = Math.max(0, OTP_RULES.maxAttempts - attempts);
      if (attemptsLeft === 0) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'TOO_MANY_ATTEMPTS', 'Too many wrong tries. Please ask for a new code.');
      }
      throw new ApiError(HttpStatus.BAD_REQUEST, 'WRONG_CODE', `Wrong code. ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left.`, { attemptsLeft });
    }

    if (!(await this.store.consume(latest.id, now))) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'CODE_NOT_FOUND', 'This code was already used. Please ask for a new code.');
    }
  }

  /**
   * A 6-digit code has only a million possible values, so a plain hash could be
   * reversed quickly. HMAC with a server secret means a stolen database alone
   * is not enough to work out codes. The phone is included so a code only
   * works for the number it was sent to.
   */
  private hash(phone: string, code: string): string {
    return createHmac('sha256', this.env.OTP_HASH_SECRET).update(`${phone}:${code}`).digest('hex');
  }

  /** Compares in constant time, so response timing reveals nothing. */
  private matches(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
