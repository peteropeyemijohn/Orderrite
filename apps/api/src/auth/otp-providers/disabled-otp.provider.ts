import { OtpProvider } from './otp-provider.js';

/** The safe default: no SMS service is configured, so no codes are sent. */
export class DisabledOtpProvider extends OtpProvider {
  readonly name = 'disabled';
  readonly canSend = false;

  send(): Promise<void> {
    return Promise.reject(new Error('No SMS provider is configured'));
  }
}
