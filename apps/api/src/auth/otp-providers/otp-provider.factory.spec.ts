import { createOtpProvider } from './otp-provider.factory.js';

describe('createOtpProvider', () => {
  it('prints codes in development', () => {
    const provider = createOtpProvider({ NODE_ENV: 'development', DEMO_MODE: false });
    expect(provider.name).toBe('console');
    expect(provider.canSend).toBe(true);
  });

  it('uses the demo provider when DEMO_MODE is on', () => {
    const provider = createOtpProvider({ NODE_ENV: 'production', DEMO_MODE: true });
    expect(provider.name).toBe('demo');
    expect(provider.canSend).toBe(true);
  });

  it.each(['production', 'test'] as const)('refuses to send in %s without DEMO_MODE', (NODE_ENV) => {
    const provider = createOtpProvider({ NODE_ENV, DEMO_MODE: false });
    expect(provider.name).toBe('disabled');
    expect(provider.canSend).toBe(false);
  });
});
