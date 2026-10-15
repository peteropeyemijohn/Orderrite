import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerStorage, type ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Request } from 'express';
import { ENV, type Env } from '../../config/env.js';
import { getClientIp } from './client-ip.js';

/** Rate limits by visitor IP (see getClientIp). */
@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storage: ThrottlerStorage,
    reflector: Reflector,
    @Inject(ENV) private readonly env: Pick<Env, 'WEB_PROXY_SECRET' | 'CLIENT_IP_HEADER'>,
  ) {
    super(options, storage, reflector);
  }

  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    return Promise.resolve(getClientIp(req as unknown as Request, this.env));
  }
}
