import { Controller, Get, HttpStatus, Inject, NotFoundException, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator.js';
import { getClientIp } from '../common/guards/client-ip.js';
import { ENV, type Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface HealthReport {
  status: 'ok' | 'error';
  database: 'ok' | 'error';
  time: string;
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV) private readonly env: Pick<Env, 'IP_DEBUG' | 'TRUST_PROXY_HOPS' | 'WEB_PROXY_SECRET' | 'CLIENT_IP_HEADER'>,
  ) {}

  /**
   * GET /health tells you whether the API is running and can reach the database.
   */
  @Public()
  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const time = new Date().toISOString();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ok', time };
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return { status: 'error', database: 'error', time };
    }
  }

  /**
   * GET /health/live: "the server is running". Used by Render's frequent health
   * checks and by the apps' wake-up call. It does not touch the database, so it
   * doesn't keep the free Neon database awake.
   */
  @Public()
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  /**
   * GET /health/ip (only while IP_DEBUG=true): shows how the API sees YOUR
   * request, to check that rate limiting uses the real visitor IP behind the
   * hosting proxy. It only echoes the caller's own request details.
   */
  @Public()
  @Get('ip')
  ip(@Req() req: Request) {
    if (!this.env.IP_DEBUG) throw new NotFoundException();
    const header = (name: string) => req.headers[name] ?? null;
    return {
      detectedIp: getClientIp(req, this.env),
      trustProxyHops: this.env.TRUST_PROXY_HOPS,
      clientIpHeader: this.env.CLIENT_IP_HEADER ?? null,
      socketIp: req.socket.remoteAddress ?? null,
      xForwardedFor: header('x-forwarded-for'),
      cfConnectingIp: header('cf-connecting-ip'),
      trueClientIp: header('true-client-ip'),
      xRealIp: header('x-real-ip'),
    };
  }
}
