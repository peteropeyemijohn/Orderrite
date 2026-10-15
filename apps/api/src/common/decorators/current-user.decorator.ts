import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from '../../generated/prisma/enums.js';

/** The signed-in user, attached to the request by JwtAuthGuard. */
export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: Role;
  isDemo: boolean;
}

export type AuthedRequest = Request & { user?: AuthUser };

/** Gives an endpoint the signed-in user: `me(@CurrentUser() user: AuthUser)`. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser | undefined => {
  return context.switchToHttp().getRequest<AuthedRequest>().user;
});
