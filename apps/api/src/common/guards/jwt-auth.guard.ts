import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from '../../auth/tokens.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ApiError } from '../api-error.js';
import type { AuthedRequest } from '../decorators/current-user.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Runs on every endpoint. Unless it is marked @Public(), the request must carry
 * a valid access token ("Authorization: Bearer ..."). The user is loaded fresh
 * from the database, so a suspended account or a changed role takes effect at once.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokensService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) throw this.unauthorized();

    let userId: string;
    try {
      userId = (await this.tokens.verifyAccessToken(token)).sub;
    } catch {
      throw this.unauthorized();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, role: true, isDemo: true, isActive: true },
    });
    if (!user || !user.isActive) throw this.unauthorized();

    const { isActive: _isActive, ...authUser } = user;
    request.user = authUser;
    return true;
  }

  private unauthorized() {
    return new ApiError(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', 'Please sign in.');
  }
}
