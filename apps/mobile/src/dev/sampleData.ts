// MADE-UP data for the dev-only design preview. Never used in real screens.
// Photos: Unsplash (free licence, https://unsplash.com/license), checked by eye
// to show what each label says.
import type { Category } from 'shared';

/** A photo at a given width, cropped by Unsplash's image service. */
export function unsplash(id: string, width = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=70&auto=format&fit=crop`;
}

/**
 * A tiny, blurred version of the same photo (about 1 KB), shown while the real
 * one loads. Phase 4 does the same with Cloudinary for vendor photos.
 */
export function unsplashPlaceholder(id: string): { uri: string } {
  return { uri: `https://images.unsplash.com/photo-${id}?w=24&q=30&blur=40&auto=format&fit=crop` };
}

export const CATEGORY_PHOTOS: Record<Category, string> = {
  FOOD: '1504674900247-0877df9cc836',
  SHOPS: '1542838132-92c53300491e',
  PHARMACY: '1584308666744-24d5c474f2ae',
  BEAUTY: '1596462502278-27bfdc403348',
  PACKAGE: '1586528116311-ad8dd3c8310d',
};

export interface SampleVendor {
  id: string;
  name: string;
  cuisine: string;
  photo: string;
  minMinutes: number;
  maxMinutes: number;
  /** In kobo */
  deliveryFee: number;
  rating: number;
  promoPercent?: number;
  isOpen: boolean;
}

export const SAMPLE_VENDORS: SampleVendor[] = [
  { id: 'v1', name: 'Mama Tee Grill House', cuisine: 'Grill · Suya · Sides', photo: '1555939594-58d7cb561ad1', minMinutes: 20, maxMinutes: 30, deliveryFee: 50000, rating: 4.7, promoPercent: 20, isOpen: true },
  { id: 'v2', name: 'Oja Pizza Kitchen', cuisine: 'Pizza · Pasta', photo: '1565299624946-b28f40a0ae38', minMinutes: 25, maxMinutes: 40, deliveryFee: 70000, rating: 4.5, isOpen: true },
  { id: 'v3', name: 'Green Bowl Akure', cuisine: 'Bowls · Salads', photo: '1546069901-ba9599a7e63c', minMinutes: 15, maxMinutes: 25, deliveryFee: 60000, rating: 4.8, isOpen: true },
  { id: 'v4', name: 'Burger Corner', cuisine: 'Burgers · Fries', photo: '1568901346375-23c9450c58cd', minMinutes: 30, maxMinutes: 45, deliveryFee: 80000, rating: 4.3, isOpen: false },
];

export const SAMPLE_CITY = {
  name: 'Akure',
  currencyCode: 'NGN',
  categories: [
    { key: 'FOOD' as const, enabled: true },
    { key: 'SHOPS' as const, enabled: false },
    { key: 'PHARMACY' as const, enabled: false },
    { key: 'BEAUTY' as const, enabled: false },
    { key: 'PACKAGE' as const, enabled: false },
  ],
};

/** A valid example blurhash (from the blurhash project), to show that placeholder type too. */
export const SAMPLE_BLURHASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
