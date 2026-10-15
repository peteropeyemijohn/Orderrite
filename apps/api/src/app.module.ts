import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { IpThrottlerGuard } from './common/guards/ip-throttler.guard.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { ConfigModule } from './config/config.module.js';
import { CountriesModule } from './countries/countries.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PublicConfigController } from './public-config/public-config.controller.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CountriesModule,
    // General per-IP limit for every endpoint; auth endpoints set stricter ones.
    // Stored in memory: fine for one server. (Several servers would need Redis.)
    ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 15 * 60 * 1000, limit: 600 }] }),
    HealthModule,
    AuthModule,
  ],
  controllers: [PublicConfigController],
  providers: [
    // Order matters: rate limit first, then check sign-in, then check role.
    { provide: APP_GUARD, useClass: IpThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
