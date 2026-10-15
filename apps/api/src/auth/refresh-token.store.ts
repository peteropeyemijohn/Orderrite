import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  userAgent?: string | null;
  createdAt: Date;
}

/** Database access for refresh tokens. Kept small so tests can use a fake. */
export abstract class RefreshTokenStore {
  abstract create(data: Omit<StoredRefreshToken, 'id' | 'usedAt' | 'revokedAt'>): Promise<void>;
  abstract findByHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  /** Returns false if the token was already used (possible theft). */
  abstract markUsed(id: string, at: Date): Promise<boolean>;
  abstract revokeFamily(familyId: string, at: Date): Promise<void>;
}

@Injectable()
export class PrismaRefreshTokenStore extends RefreshTokenStore {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Omit<StoredRefreshToken, 'id' | 'usedAt' | 'revokedAt'>) {
    await this.prisma.refreshToken.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string, at: Date) {
    const result = await this.prisma.refreshToken.updateMany({ where: { id, usedAt: null }, data: { usedAt: at } });
    return result.count === 1;
  }

  async revokeFamily(familyId: string, at: Date) {
    await this.prisma.refreshToken.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: at } });
  }
}
