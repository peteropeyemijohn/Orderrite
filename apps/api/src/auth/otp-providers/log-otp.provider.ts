import { Logger } from '@nestjs/common';
import { maskPhone } from '../phone.js';
import { OtpProvider } from './otp-provider.js';

/**
 * Prints sign-in codes in the API log instead of sending an SMS.
 * Only ever chosen in development or DEMO_MODE (see otp-provider.factory.ts).
 */
export class LogOtpProvider extends OtpProvider {
  readonly canSend = true;
  private readonly logger = new Logger('OTP');

  constructor(readonly name: 'console' | 'demo') {
    super();
  }

  send(phone: string, code: string): Promise<void> {
    this.logger.log(`Code for ${maskPhone(phone)}: ${code} (expires in 5 min)`);
    return Promise.resolve();
  }
}
