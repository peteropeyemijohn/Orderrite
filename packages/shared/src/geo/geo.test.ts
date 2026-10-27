import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIAL_COUNTRIES } from './countries.ts';
import { formatPhone, internationalNumber, pickerCountries } from './dial-countries.ts';
import { flagEmoji } from './flags.ts';

test('the reference list has every country with a dialling code', () => {
  assert.ok(DIAL_COUNTRIES.length > 200);
  assert.deepEqual(DIAL_COUNTRIES.find((c) => c.code === 'NG'), { code: 'NG', name: 'Nigeria', dialCode: '+234' });
  assert.ok(DIAL_COUNTRIES.every((c) => /^\+\d{1,4}$/.test(c.dialCode)));
});

test('active countries come first, then all others without duplicates', () => {
  const { active, others } = pickerCountries([{ code: 'NG', name: 'Nigeria', dialCode: '+234' }]);
  assert.equal(active[0]?.code, 'NG');
  assert.ok(!others.some((c) => c.code === 'NG'));
  assert.equal(active.length + others.length, DIAL_COUNTRIES.length);
});

test('builds an international number for other countries', () => {
  const ng = { code: 'NG', name: 'Nigeria', dialCode: '+234' };
  const gb = { code: 'GB', name: 'United Kingdom', dialCode: '+44' };
  assert.equal(internationalNumber('0803 123 4567', ng, 'NG'), '0803 123 4567'); // API converts it
  assert.equal(internationalNumber('07911 123456', gb, 'NG'), '+447911123456');
  assert.equal(internationalNumber('+233 24 123 4567', gb, 'NG'), '+233 24 123 4567');
});

test('formats stored phone numbers for display', () => {
  assert.equal(formatPhone('+2340000000001'), '+234 000 000 0001');
  assert.equal(formatPhone('+2348031234567'), '+234 803 123 4567');
  assert.equal(formatPhone('+447911123456'), '+44 791 112 3456');
  assert.equal(formatPhone('+233241234567'), '+233 241 23 4567');
  assert.equal(formatPhone('08031234567'), '08031234567'); // not international: unchanged
  assert.equal(formatPhone(''), '');
});

test('makes flag emoji from country codes', () => {
  assert.equal(flagEmoji('NG'), '🇳🇬');
  assert.equal(flagEmoji('gb'), '🇬🇧');
  assert.equal(flagEmoji('???'), '🏳️');
});
