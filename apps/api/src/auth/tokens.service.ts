import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiError } from '../common/api-error.js';
import { Clock } from '../common/clock.js';
import { ENV, type Env } from '../config/env.js';
import type { Role } from '../generated/prisma/enums.js';
import { RefreshTokenStore } from './refresh-token.store.js';

/** What is inside an access token. */
export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires */
  accessTokenExpiresIn: number;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger('Tokens');

  constructor(
    private readonly jwt: JwtService,
    private readonly store: RefreshTokenStore,
    private readonly clock: Clock,
    @Inject(ENV) private readonly env: Pick<Env, 'ACCESS_TOKEN_TTL_MINUTES' | 'REFRESH_TOKEN_TTL_DAYS'>,
  ) {}

  /** Starts a new sign-in (a new token family) for this user. */
  issue(user: { id: string; role: Role }, userAgent?: string): Promise<TokenPair> {
    return this.createPair(user, randomUUID(), userAgent);
  }

  /**
   * Swaps a refresh token for a new pair. Each refresh token works once.
   * If a token that was already swapped is used again, someone may have
   * copied it, so the whole family (that device's sign-in) is revoked.
   * Returns the user id so the caller can load the current role.
   */
  async rotate(refreshToken: string): Promise<{ userId: string; familyId: string; userAgent?: string | null }> {
    const now = this.clock.now();
    const stored = await this.store.findByHash(this.hash(refreshToken));

    if (!stored || stored.revokedAt || stored.expiresAt <= now) {
      throw this.invalid();
    }
    if (stored.usedAt || !(await this.store.markUsed(stored.id, now))) {
      this.logger.warn(`Refresh token reuse detected; revoking sign-in family ${stored.familyId}`);
      await this.store.revokeFamily(stored.familyId, now);
      throw this.invalid();
    }
    return { userId: stored.userId, familyId: stored.familyId, userAgent: stored.userAgent };
  }

  /** Creates the next pair in an existing family (after rotate). */
  continueFamily(user: { id: string; role: Role }, familyId: string, userAgent?: string | null): Promise<TokenPair> {
    return this.createPair(user, familyId, userAgent ?? undefined);
  }

  /** Logs out this device by revoking its token family. Unknown tokens are ignored. */
  async revoke(refreshToken: string): Promise<void> {
    const stored = await this.store.findByHash(this.hash(refreshToken));
    if (stored) await this.store.revokeFamily(stored.familyId, this.clock.now());
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwt.verifyAsync<AccessTokenPayload>(token);
  }

  private async createPair(user: { id: string; role: Role }, familyId: string, userAgent?: string): Promise<TokenPair> {
    const now = this.clock.now();
    const accessTokenExpiresIn = this.env.ACCESS_TOKEN_TTL_MINUTES * 60;
    const payload: AccessTokenPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: accessTokenExpiresIn });

    // Long random value; only its SHA-256 hash is stored.
    const refreshToken = randomBytes(32).toString('base64url');
    await this.store.create({
      userId: user.id,
      tokenHash: this.hash(refreshToken),
      familyId,
      expiresAt: new Date(now.getTime() + this.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      userAgent: userAgent?.slice(0, 200),
      createdAt: now,
    });
    return { accessToken, refreshToken, accessTokenExpiresIn };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private invalid() {
    return new ApiError(HttpStatus.UNAUTHORIZED, 'SESSION_EXPIRED', 'Your session has ended. Please sign in again.');
  }
}
