import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Error with a stable machine-readable code (e.g. "WRONG_CODE"). The apps use
 * the code to pick a translated message; "message" is a plain-English fallback.
 */
export class ApiError extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: string,
    message: string,
    extra: Record<string, unknown> = {},
  ) {
    super({ statusCode: status, code, message, ...extra }, status);
  }
}
