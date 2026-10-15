import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('applies safe defaults', () => {
    const env = loadEnv({ DATABASE_URL: 'postgresql://example' });
    expect(env.PORT).toBe(4000);
    expect(env.DEMO_MODE).toBe(false);
  });

  it('reads DEMO_MODE only from the exact word "true"', () => {
    expect(loadEnv({ DATABASE_URL: 'x', DEMO_MODE: 'true' }).DEMO_MODE).toBe(true);
    expect(() => loadEnv({ DATABASE_URL: 'x', DEMO_MODE: 'yes' })).toThrow();
  });

  it('stops with a clear message when DATABASE_URL is missing', () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });
});
