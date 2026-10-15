import type { ApiErrorBody } from '../api-types.ts';
import { en } from './en.ts';

/** Turns an API error into a friendly translated message. */
export function authErrorMessage(error: ApiErrorBody | undefined, t = en): string {
  const errors = t.auth.errors;
  if (!error) return t.common.cantReachServer;
  if (error.statusCode === 429 && !error.code) return errors.RATE_LIMITED;
  switch (error.code) {
    case 'WRONG_CODE':
      return errors.WRONG_CODE(error.attemptsLeft ?? 0);
    case 'RESEND_TOO_SOON':
      return errors.RESEND_TOO_SOON(error.retryAfterSeconds ?? 60);
    case 'INVALID_PHONE':
    case 'INVALID_INPUT':
    case 'TOO_MANY_CODES':
    case 'OTP_UNAVAILABLE':
    case 'CODE_EXPIRED':
    case 'CODE_NOT_FOUND':
    case 'TOO_MANY_ATTEMPTS':
    case 'ACCOUNT_DISABLED':
    case 'SESSION_EXPIRED':
      return errors[error.code];
    default:
      return t.common.somethingWrong;
  }
}
