import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface StoredOtp {
  id: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
}

/** Database access for sign-in codes. Kept small so tests can use a fake. */
export abstract class OtpStore {
  abstract findLatest(phone: string): Promise<StoredOtp | null>;
  abstract countSince(phone: string, since: Date): Promise<number>;
  /** Marks every unused code for this phone as used (a new code replaces them). */
  abstract consumeAll(phone: string, at: Date): Promise<void>;
  abstract create(data: { phone: string; codeHash: string; expiresAt: Date; ipAddress?: string; createdAt: Date }): Promise<void>;
  /** Adds one wrong attempt and returns the new count. */
  abstract incrementAttempts(id: string): Promise<number>;
  /** Marks a code as used. Returns false if it was already used (e.g. two requests at once). */
  abstract consume(id: string, at: Date): Promise<boolean>;
}

@Injectable()
export class PrismaOtpStore extends OtpStore {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findLatest(phone: string) {
    return this.prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' } });
  }

  countSince(phone: string, since: Date) {
    return this.prisma.otpCode.count({ where: { phone, createdAt: { gte: since } } });
  }

  async consumeAll(phone: string, at: Date) {
    await this.prisma.otpCode.updateMany({ where: { phone, consumedAt: null }, data: { consumedAt: at } });
  }

  async create(data: { phone: string; codeHash: string; expiresAt: Date; ipAddress?: string; createdAt: Date }) {
    await this.prisma.otpCode.create({ data });
  }

  async incrementAttempts(id: string) {
    const updated = await this.prisma.otpCode.update({ where: { id }, data: { attempts: { increment: 1 } } });
    return updated.attempts;
  }

  async consume(id: string, at: Date) {
    const result = await this.prisma.otpCode.updateMany({ where: { id, consumedAt: null }, data: { consumedAt: at } });
    return result.count === 1;
  }
}
