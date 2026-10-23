import { CATEGORY_ORDER, toPublicCity } from './cities.service.js';

describe('toPublicCity', () => {
  const city = { id: 'c1', slug: 'akure', name: 'Akure', enabledCategories: ['FOOD' as const], country: { currencyCode: 'NGN' } };

  it('lists every category in a fixed order with its on/off state', () => {
    const result = toPublicCity(city);
    expect(result.categories.map((c) => c.key)).toEqual(['FOOD', 'SHOPS', 'PHARMACY', 'BEAUTY', 'PACKAGE']);
    expect(result.categories.filter((c) => c.enabled).map((c) => c.key)).toEqual(['FOOD']);
  });

  it('takes the currency from the country, not from code', () => {
    expect(toPublicCity(city).currencyCode).toBe('NGN');
    expect(toPublicCity({ ...city, country: { currencyCode: 'GHS' } }).currencyCode).toBe('GHS');
  });

  it('switching a category on in the database switches its tile on', () => {
    const result = toPublicCity({ ...city, enabledCategories: ['FOOD', 'PHARMACY'] });
    expect(result.categories.find((c) => c.key === 'PHARMACY')?.enabled).toBe(true);
  });

  it('knows all five categories', () => {
    expect(CATEGORY_ORDER).toHaveLength(5);
  });
});
