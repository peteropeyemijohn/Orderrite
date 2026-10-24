import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currencyDecimals, formatMoney, minorUnitsPerMajor } from './money.ts';

const NGN = { code: 'NGN', symbol: '₦' };

test('uses the symbol from data and drops .00 for whole amounts', () => {
  assert.equal(formatMoney(50000, NGN), '₦500');
  assert.equal(formatMoney(0, NGN), '₦0');
  assert.equal(formatMoney(100, NGN), '₦1');
});

test('keeps decimals when there are some', () => {
  assert.equal(formatMoney(125050, NGN), '₦1,250.50');
  assert.equal(formatMoney(125005, NGN), '₦1,250.05');
  assert.equal(formatMoney(5, NGN), '₦0.05');
});

test('groups thousands', () => {
  assert.equal(formatMoney(123456789, NGN), '₦1,234,567.89');
  assert.equal(formatMoney(100000000, NGN), '₦1,000,000');
});

test('falls back to the currency code when there is no symbol', () => {
  assert.equal(formatMoney(50000, { code: 'NGN' }), 'NGN 500');
  assert.equal(formatMoney(1250, { code: 'GHS', symbol: null }), 'GHS 12.50');
});

test('handles currencies without decimals or with three', () => {
  assert.equal(formatMoney(1500, { code: 'JPY', symbol: '¥' }), '¥1,500');
  assert.equal(formatMoney(1500, { code: 'KWD', symbol: 'KD ' }), 'KD 1.500');
  assert.equal(currencyDecimals('ngn'), 2);
  assert.equal(minorUnitsPerMajor('NGN'), 100);
  assert.equal(minorUnitsPerMajor('JPY'), 1);
});

test('shows negative amounts (refunds) with a minus sign', () => {
  assert.equal(formatMoney(-50000, NGN), '-₦500');
});

test('rejects amounts that are not whole minor units', () => {
  assert.throws(() => formatMoney(10.5, NGN));
});
