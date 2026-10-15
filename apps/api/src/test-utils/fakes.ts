// In-memory stand-ins used by tests, so they run fast without a database.
import { Clock } from '../common/clock.js';
import { OtpProvider } from '../auth/otp-providers/otp-provider.js';
import { OtpStore, type StoredOtp } from '../auth/otp.store.js';
import { RefreshTokenStore, type StoredRefreshToken } from '../auth/refresh-token.store.js';

export class FakeClock extends Clock {
  constructor(private current = new Date('2026-01-01T12:00:00Z')) {
    super();
  }
  now() {
    return new Date(this.current);
  }
  advanceSeconds(seconds: number) {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}

export class FakeOtpProvider extends OtpProvider {
  readonly name = 'fake';
  sent: Array<{ phone: string; code: string }> = [];
  constructor(readonly canSend = true) {
    super();
  }
  send(phone: string, code: string) {
    this.sent.push({ phone, code });
    return Promise.resolve();
  }
  get lastCode() {
    return this.sent.at(-1)?.code;
  }
}

export class FakeOtpStore extends OtpStore {
  rows: StoredOtp[] = [];
  private nextId = 1;
  findLatest(phone: string) {
    const rows = this.rows.filter((r) => r.phone === phone);
    return Promise.resolve(rows.at(-1) ?? null);
  }
  countSince(phone: string, since: Date) {
    return Promise.resolve(this.rows.filter((r) => r.phone === phone && r.createdAt >= since).length);
  }
  consumeAll(phone: string, at: Date) {
    for (const r of this.rows) if (r.phone === phone && !r.consumedAt) r.consumedAt = at;
    return Promise.resolve();
  }
  create(data: { phone: string; codeHash: string; expiresAt: Date; createdAt: Date }) {
    this.rows.push({ id: String(this.nextId++), attempts: 0, consumedAt: null, ...data });
    return Promise.resolve();
  }
  incrementAttempts(id: string) {
    const row = this.rows.find((r) => r.id === id)!;
    row.attempts += 1;
    return Promise.resolve(row.attempts);
  }
  consume(id: string, at: Date) {
    const row = this.rows.find((r) => r.id === id)!;
    if (row.consumedAt) return Promise.resolve(false);
    row.consumedAt = at;
    return Promise.resolve(true);
  }
}

export class FakeRefreshTokenStore extends RefreshTokenStore {
  rows: StoredRefreshToken[] = [];
  private nextId = 1;
  create(data: Omit<StoredRefreshToken, 'id' | 'usedAt' | 'revokedAt'>) {
    this.rows.push({ id: String(this.nextId++), usedAt: null, revokedAt: null, ...data });
    return Promise.resolve();
  }
  findByHash(tokenHash: string) {
    return Promise.resolve(this.rows.find((r) => r.tokenHash === tokenHash) ?? null);
  }
  markUsed(id: string, at: Date) {
    const row = this.rows.find((r) => r.id === id)!;
    if (row.usedAt) return Promise.resolve(false);
    row.usedAt = at;
    return Promise.resolve(true);
  }
  revokeFamily(familyId: string, at: Date) {
    for (const r of this.rows) if (r.familyId === familyId && !r.revokedAt) r.revokedAt = at;
    return Promise.resolve();
  }
}
