import { normalizePhone } from './phone.js';

const ng = { defaultCountry: 'NG', allowDemoNumbers: false };

describe('normalizePhone', () => {
  it.each([
    ['08031234567', '+2348031234567'],
    ['0803 123 4567', '+2348031234567'],
    ['0803-123-4567', '+2348031234567'],
    ['8031234567', '+2348031234567'],
    ['2348031234567', '+2348031234567'],
    ['+2348031234567', '+2348031234567'],
    ['+234 803 123 4567', '+2348031234567'],
    ['002348031234567', '+2348031234567'],
    ['07061234567', '+2347061234567'],
  ])('converts %s to %s', (input, expected) => {
    expect(normalizePhone(input, ng)).toBe(expected);
  });

  it('keeps numbers from other countries', () => {
    expect(normalizePhone('+44 7911 123456', ng)).toBe('+447911123456');
    expect(normalizePhone('+233 24 123 4567', ng)).toBe('+233241234567');
  });

  it('uses the default country it is given, not a hard-coded one', () => {
    expect(normalizePhone('024 123 4567', { defaultCountry: 'GH', allowDemoNumbers: false })).toBe(
      '+233241234567',
    );
  });

  it.each(['', 'hello', '123', '0803', '+234', '080312345678901234'])('rejects %j', (input) => {
    expect(normalizePhone(input, ng)).toBeNull();
  });

  it('accepts demo numbers only when demo numbers are allowed', () => {
    expect(normalizePhone('+2340000000001', ng)).toBeNull();
    expect(normalizePhone('+2340000000001', { ...ng, allowDemoNumbers: true })).toBe('+2340000000001');
  });
});
