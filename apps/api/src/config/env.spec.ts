import { loadEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://example',
  JWT_ACCESS_SECRET: 'a'.repeat(40),
  OTP_HASH_SECRET: 'b'.repeat(40),
};

describe('loadEnv', () => {
  it('applies safe defaults', () => {
    const env = loadEnv(base);
    expect(env.PORT).toBe(4000);
    expect(env.DEMO_MODE).toBe(false);
    // Not "development" unless explicitly set, so codes are never printed by accident
    expect(env.NODE_ENV).toBe('production');
  });

  it('reads DEMO_MODE only from the exact word "true"', () => {
    expect(loadEnv({ ...base, DEMO_MODE: 'true' }).DEMO_MODE).toBe(true);
    expect(() => loadEnv({ ...base, DEMO_MODE: 'yes' })).toThrow();
  });

  it('stops with a clear message when DATABASE_URL is missing', () => {
    expect(() => loadEnv({ ...base, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });

  it('requires long secrets', () => {
    expect(() => loadEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('requires the two secrets to be different', () => {
    expect(() => loadEnv({ ...base, OTP_HASH_SECRET: base.JWT_ACCESS_SECRET })).toThrow(/different/);
  });
});
