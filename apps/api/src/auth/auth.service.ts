import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import type { AuthUser } from '../common/decorators/current-user.decorator.js';
import { ENV, type Env } from '../config/env.js';
import { CountriesService } from '../countries/countries.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { normalizePhone } from './phone.js';
import { TokensService, type TokenPair } from './tokens.service.js';

export type SessionResponse = TokenPair & { user: AuthUser };

const userSelect = { id: true, phone: true, name: true, role: true, isDemo: true, isActive: true } as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
    private readonly tokens: TokensService,
    private readonly countries: CountriesService,
    @Inject(ENV) private readonly env: Pick<Env, 'DEMO_MODE'>,
  ) {}

  async requestCode(rawPhone: string, ipAddress?: string) {
    const phone = await this.normalize(rawPhone);
    const user = await this.prisma.user.findUnique({ where: { phone }, select: userSelect });
    const result = await this.otp.requestCode(phone, { ipAddress, useDemoCode: this.canUseDemoCode(user) });
    return { phone, ...result };
  }

  async verifyCode(rawPhone: string, code: string, userAgent?: string): Promise<SessionResponse> {
    const phone = await this.normalize(rawPhone);
    await this.otp.verifyCode(phone, code);

    // First sign-in creates the account. New accounts are ALWAYS customers;
    // the role never comes from the request.
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, role: 'CUSTOMER' },
      select: userSelect,
    });
    if (!user.isActive) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'ACCOUNT_DISABLED', 'This account has been suspended.');
    }

    const pair = await this.tokens.issue(user, userAgent);
    return { ...pair, user: this.toAuthUser(user) };
  }

  async refresh(refreshToken: string): Promise<SessionResponse> {
    const { userId, familyId, userAgent } = await this.tokens.rotate(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user || !user.isActive) {
      await this.tokens.revoke(refreshToken);
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'SESSION_EXPIRED', 'Your session has ended. Please sign in again.');
    }
    const pair = await this.tokens.continueFamily(user, familyId, userAgent);
    return { ...pair, user: this.toAuthUser(user) };
  }

  logout(refreshToken: string): Promise<void> {
    return this.tokens.revoke(refreshToken);
  }

  /**
   * In DEMO_MODE the published code works for demo accounts, brand-new numbers
   * and ordinary customers. It never works for real (non-demo) admin, vendor
   * or rider accounts: those still get a random code, printed in the server log.
   */
  private canUseDemoCode(user: { role: string; isDemo: boolean } | null): boolean {
    if (!this.env.DEMO_MODE) return false;
    if (!user) return true;
    return user.isDemo || user.role === 'CUSTOMER';
  }

  private async normalize(rawPhone: string): Promise<string> {
    const country = await this.countries.getDefault();
    const phone = normalizePhone(rawPhone, { defaultCountry: country.code, allowDemoNumbers: this.env.DEMO_MODE });
    if (!phone) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'INVALID_PHONE', 'Please enter a valid phone number.');
    }
    return phone;
  }

  private toAuthUser(user: AuthUser & { isActive: boolean }): AuthUser {
    const { isActive: _isActive, ...rest } = user;
    return rest;
  }
}
