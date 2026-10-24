import { Injectable } from '@nestjs/common';
import { Category } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CityCategory {
  key: Category;
  /** Switched on in this city (City.enabledCategories). Off ones show "Soon". */
  enabled: boolean;
}

export interface PublicCity {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
  /** Added in Phase 3 (part 2); null if the country has none set */
  currencySymbol: string | null;
  /** Every category in a fixed order, each with its on/off state for this city. */
  categories: CityCategory[];
}

/** All categories, in the order the app shows them. */
export const CATEGORY_ORDER: Category[] = Object.values(Category);

@Injectable()
export class CitiesService {
  private cached?: { value: PublicCity | null; expires: number };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * The city the app shows before a customer picks one: the first active city
   * in the default country (Akure at launch). Read from the database, never
   * hard-coded. Cached for a minute.
   */
  async getDefaultCity(): Promise<PublicCity | null> {
    if (this.cached && this.cached.expires > Date.now()) return this.cached.value;

    const city = await this.prisma.city.findFirst({
      where: { isActive: true, country: { isActive: true, isDefault: true } },
      orderBy: { createdAt: 'asc' },
      include: { country: { select: { currencyCode: true, currencySymbol: true } } },
    });
    const value = city ? toPublicCity(city) : null;
    this.cached = { value, expires: Date.now() + 60 * 1000 };
    return value;
  }
}

export function toPublicCity(city: {
  id: string;
  slug: string;
  name: string;
  enabledCategories: Category[];
  country: { currencyCode: string; currencySymbol?: string | null };
}): PublicCity {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    currencyCode: city.country.currencyCode,
    currencySymbol: city.country.currencySymbol ?? null,
    categories: CATEGORY_ORDER.map((key) => ({ key, enabled: city.enabledCategories.includes(key) })),
  };
}
