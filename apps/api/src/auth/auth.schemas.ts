import { z } from 'zod';

// .strict() rejects unknown fields, so nobody can sneak in e.g. { role: "ADMIN" }.

export const requestCodeSchema = z.object({ phone: z.string().min(1).max(30) }).strict();
export type RequestCodeBody = z.infer<typeof requestCodeSchema>;

export const verifyCodeSchema = z
  .object({
    phone: z.string().min(1).max(30),
    code: z.string().regex(/^\d{6}$/, 'The code must be 6 digits'),
  })
  .strict();
export type VerifyCodeBody = z.infer<typeof verifyCodeSchema>;

export const refreshTokenSchema = z.object({ refreshToken: z.string().min(20).max(200) }).strict();
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
