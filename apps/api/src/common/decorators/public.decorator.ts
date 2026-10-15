import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks an endpoint as open to everyone (no sign-in needed). Everything else requires sign-in. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
