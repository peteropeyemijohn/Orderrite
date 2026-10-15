/**
 * Something that delivers sign-in codes to a phone.
 * Today: printed in the server log (development / demo) or disabled.
 * Later: a real SMS service implements this same interface.
 */
export abstract class OtpProvider {
  /** Short name shown in the startup log, e.g. "console" */
  abstract readonly name: string;
  /** False means codes cannot be delivered, so none should be created. */
  abstract readonly canSend: boolean;
  abstract send(phone: string, code: string): Promise<void>;
}
