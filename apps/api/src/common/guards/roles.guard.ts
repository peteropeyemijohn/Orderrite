import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/prisma/enums.js';
import { ApiError } from '../api-error.js';
import type { AuthedRequest } from '../decorators/current-user.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Runs after JwtAuthGuard. If an endpoint has @Roles(...), the signed-in user
 * must have one of those roles. Endpoints without @Roles are open to any signed-in user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles || roles.length === 0) return true;

    const user = context.switchToHttp().getRequest<AuthedRequest>().user;
    if (!user) throw new ApiError(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', 'Please sign in.');
    if (!roles.includes(user.role)) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'FORBIDDEN', 'You do not have access to this.');
    }
    return true;
  }
}
