import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface DefaultCountry {
  code: string;
  name: string;
  dialCode: string;
}

/** Reads country data. The default country rarely changes, so it is cached briefly. */
@Injectable()
export class CountriesService {
  private cached?: { value: DefaultCountry; expires: number };

  constructor(private readonly prisma: PrismaService) {}

  async getDefault(): Promise<DefaultCountry> {
    if (this.cached && this.cached.expires > Date.now()) return this.cached.value;

    const country =
      (await this.prisma.country.findFirst({ where: { isDefault: true, isActive: true } })) ??
      (await this.prisma.country.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }));
    if (!country) {
      throw new Error('No active country found. Run the seed script: pnpm db:seed');
    }
    const value = { code: country.code, name: country.name, dialCode: country.dialCode };
    this.cached = { value, expires: Date.now() + 5 * 60 * 1000 };
    return value;
  }
}
