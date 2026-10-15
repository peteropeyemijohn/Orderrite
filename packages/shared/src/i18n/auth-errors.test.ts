import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authErrorMessage } from './auth-errors.ts';

test('shows tries left for a wrong code', () => {
  assert.equal(authErrorMessage({ statusCode: 400, code: 'WRONG_CODE', attemptsLeft: 3 }), 'Wrong code. 3 tries left.');
  assert.equal(authErrorMessage({ statusCode: 400, code: 'WRONG_CODE', attemptsLeft: 1 }), 'Wrong code. 1 try left.');
});

test('explains IP rate limits', () => {
  assert.match(authErrorMessage({ statusCode: 429 }), /Too many attempts/);
});

test('falls back to friendly messages', () => {
  assert.match(authErrorMessage(undefined), /Can't reach/);
  assert.match(authErrorMessage({ statusCode: 500, code: 'SOMETHING_ODD' }), /Something went wrong/);
});
