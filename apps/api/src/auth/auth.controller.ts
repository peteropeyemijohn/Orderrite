import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Inject, Logger, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { describeClientIp, maskIp } from '../common/guards/client-ip.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { ENV, type Env } from '../config/env.js';
import {
  refreshTokenSchema,
  requestCodeSchema,
  verifyCodeSchema,
  type RefreshTokenBody,
  type RequestCodeBody,
  type VerifyCodeBody,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** Per-IP limits on top of the per-phone limits in OtpService. */
export const AUTH_IP_LIMITS = {
  requestCode: { limit: 10, ttl: FIFTEEN_MINUTES },
  verifyCode: { limit: 20, ttl: FIFTEEN_MINUTES },
  refresh: { limit: 60, ttl: FIFTEEN_MINUTES },
} as const;

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('IP check');

  constructor(
    private readonly auth: AuthService,
    @Inject(ENV) private readonly env: Pick<Env, 'WEB_PROXY_SECRET' | 'CLIENT_IP_HEADER' | 'IP_DEBUG'>,
  ) {}

  /** Step 1: send a sign-in code to a phone number. */
  @Public()
  @Throttle({ default: AUTH_IP_LIMITS.requestCode })
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestCode(@Body(new ZodValidationPipe(requestCodeSchema)) body: RequestCodeBody, @Req() req: Request) {
    const client = describeClientIp(req, this.env);
    if (this.env.IP_DEBUG) {
      // Temporary, only while checking rate limiting after a deploy.
      this.logger.log(`Code request counted for ${maskIp(client.ip)} (source: ${client.source})`);
    }
    return this.auth.requestCode(body.phone, client.ip);
  }

  /** Step 2: check the code and start a session. */
  @Public()
  @Throttle({ default: AUTH_IP_LIMITS.verifyCode })
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyCode(@Body(new ZodValidationPipe(verifyCodeSchema)) body: VerifyCodeBody, @Headers('user-agent') userAgent?: string) {
    return this.auth.verifyCode(body.phone, body.code, userAgent);
  }

  /** Swap a refresh token for a new pair of tokens. */
  @Public()
  @Throttle({ default: AUTH_IP_LIMITS.refresh })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenBody) {
    return this.auth.refresh(body.refreshToken);
  }

  /** End the session on this device. */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenBody) {
    await this.auth.logout(body.refreshToken);
  }

  /** Who is signed in. */
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
