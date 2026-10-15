// Shared lists used by the API, web and mobile apps.
// These must match the enums in apps/api/prisma/schema.prisma.

export const CATEGORIES = ['FOOD', 'SHOPS', 'PHARMACY', 'BEAUTY', 'PACKAGE'] as const;
export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ROLES = ['CUSTOMER', 'RIDER', 'VENDOR', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];
