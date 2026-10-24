import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface DefaultCountry {
  code: string;
  name: string;
  dialCode: string;
  /** Added in Phase 3 */
  currencyCode: string;
  /** Added in Phase 3; null if not set */
  currencySymbol: string | null;
}

/** A country Orderrite operates in (shown first in the phone country picker). */
export type ActiveCountry = DefaultCountry;

/** Reads country data. The default country rarely changes, so it is cached briefly. */
@Injectable()
export class CountriesService {
  private cached?: { value: DefaultCountry; expires: number };
  private cachedActive?: { value: ActiveCountry[]; expires: number };

  constructor(private readonly prisma: PrismaService) {}

  async getDefault(): Promise<DefaultCountry> {
    if (this.cached && this.cached.expires > Date.now()) return this.cached.value;

    const country =
      (await this.prisma.country.findFirst({ where: { isDefault: true, isActive: true } })) ??
      (await this.prisma.country.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }));
    if (!country) {
      throw new Error('No active country found. Run the seed script: pnpm db:seed');
    }
    const value = toPublicCountry(country);
    this.cached = { value, expires: Date.now() + 5 * 60 * 1000 };
    return value;
  }

  /** Countries switched on in the database, default first. Cached for 5 minutes. */
  async getActive(): Promise<ActiveCountry[]> {
    if (this.cachedActive && this.cachedActive.expires > Date.now()) return this.cachedActive.value;
    const countries = await this.prisma.country.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    const value = countries.map(toPublicCountry);
    this.cachedActive = { value, expires: Date.now() + 5 * 60 * 1000 };
    return value;
  }
}

function toPublicCountry(country: {
  code: string;
  name: string;
  dialCode: string;
  currencyCode: string;
  currencySymbol: string | null;
}): DefaultCountry {
  return {
    code: country.code,
    name: country.name,
    dialCode: country.dialCode,
    currencyCode: country.currencyCode,
    currencySymbol: country.currencySymbol,
  };
}
