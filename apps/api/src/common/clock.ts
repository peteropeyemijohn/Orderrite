/**
 * Where services get "now" from. Tests swap in a fake clock so they can
 * check things like code expiry without waiting.
 */
export abstract class Clock {
  abstract now(): Date;
}

export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
