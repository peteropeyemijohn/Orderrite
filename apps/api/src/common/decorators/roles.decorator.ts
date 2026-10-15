import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';

/** Only users with one of these roles may call the endpoint, e.g. @Roles('ADMIN'). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
