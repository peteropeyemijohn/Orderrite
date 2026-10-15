import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Clock, SystemClock } from '../common/clock.js';
import { ENV, type Env } from '../config/env.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { OtpProvider } from './otp-providers/otp-provider.js';
import { createOtpProvider } from './otp-providers/otp-provider.factory.js';
import { OtpService } from './otp.service.js';
import { OtpStore, PrismaOtpStore } from './otp.store.js';
import { PrismaRefreshTokenStore, RefreshTokenStore } from './refresh-token.store.js';
import { TokensService } from './tokens.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ENV],
      useFactory: (env: Env) => ({ secret: env.JWT_ACCESS_SECRET }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    TokensService,
    { provide: Clock, useClass: SystemClock },
    { provide: OtpStore, useClass: PrismaOtpStore },
    { provide: RefreshTokenStore, useClass: PrismaRefreshTokenStore },
    { provide: OtpProvider, inject: [ENV], useFactory: (env: Env) => createOtpProvider(env) },
  ],
  exports: [TokensService, OtpProvider],
})
export class AuthModule {}
