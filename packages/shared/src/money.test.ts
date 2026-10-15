import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, minorUnitsPerMajor } from './money.ts';

test('formats kobo as naira', () => {
  assert.equal(formatMoney(50000, 'NGN'), '₦500.00');
  assert.equal(formatMoney(123456, 'NGN'), '₦1,234.56');
  assert.equal(formatMoney(0, 'NGN'), '₦0.00');
});

test('uses the symbol of the given currency', () => {
  assert.equal(formatMoney(1999, 'USD'), '$19.99');
  assert.equal(formatMoney(1999, 'GBP'), '£19.99');
});

test('knows minor units per currency', () => {
  assert.equal(minorUnitsPerMajor('NGN'), 100);
  assert.equal(minorUnitsPerMajor('JPY'), 1);
});

test('rejects amounts that are not whole minor units', () => {
  assert.throws(() => formatMoney(10.5, 'NGN'));
});
