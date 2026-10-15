import type { ApiError } from '../common/api-error.js';
import type { CountriesService } from '../countries/countries.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import type { OtpService } from './otp.service.js';
import type { TokensService } from './tokens.service.js';

type FakeUser = { id: string; phone: string; name: string | null; role: string; isDemo: boolean; isActive: boolean };

function setup({ demoMode, existingUser }: { demoMode: boolean; existingUser?: Partial<FakeUser> }) {
  const user: FakeUser | null = existingUser
    ? { id: 'u1', phone: '+2348031234567', name: null, role: 'CUSTOMER', isDemo: false, isActive: true, ...existingUser }
    : null;
  const prisma = {
    user: {
      findUnique: vi.fn(() => Promise.resolve(user)),
      upsert: vi.fn((args: { create: { phone: string; role: string } }) =>
        Promise.resolve(user ?? { id: 'new', name: null, isDemo: false, isActive: true, ...args.create }),
      ),
    },
  };
  const otp = { requestCode: vi.fn(() => Promise.resolve({ expiresInSeconds: 300, resendInSeconds: 60 })), verifyCode: vi.fn(() => Promise.resolve()) };
  const tokens = { issue: vi.fn(() => Promise.resolve({ accessToken: 'a', refreshToken: 'r', accessTokenExpiresIn: 900 })) };
  const countries = { getDefault: () => Promise.resolve({ code: 'NG', name: 'Nigeria', dialCode: '+234' }) };
  const service = new AuthService(
    prisma as unknown as PrismaService,
    otp as unknown as OtpService,
    tokens as unknown as TokensService,
    countries as unknown as CountriesService,
    { DEMO_MODE: demoMode },
  );
  return { service, prisma, otp };
}

const demoCodeUsed = (otp: ReturnType<typeof setup>['otp']) =>
  (otp.requestCode.mock.calls[0] as unknown as [string, { useDemoCode: boolean }])[1].useDemoCode;

describe('AuthService', () => {
  it('converts local numbers before sending a code', async () => {
    const { service, otp } = setup({ demoMode: false });
    const result = await service.requestCode('0803 123 4567');
    expect(result.phone).toBe('+2348031234567');
    expect(otp.requestCode).toHaveBeenCalledWith('+2348031234567', expect.anything());
  });

  it('rejects invalid phone numbers', async () => {
    const { service } = setup({ demoMode: false });
    await expect(service.requestCode('12345')).rejects.toMatchObject({ code: 'INVALID_PHONE' } satisfies Partial<ApiError>);
  });

  it('creates new accounts as CUSTOMER, always', async () => {
    const { service, prisma } = setup({ demoMode: false });
    const session = await service.verifyCode('08031234567', '123456');
    expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: { phone: '+2348031234567', role: 'CUSTOMER' }, update: {} }));
    expect(session.user.role).toBe('CUSTOMER');
  });

  it('refuses suspended accounts', async () => {
    const { service } = setup({ demoMode: false, existingUser: { isActive: false } });
    await expect(service.verifyCode('08031234567', '123456')).rejects.toMatchObject({ code: 'ACCOUNT_DISABLED' });
  });

  describe('published demo code', () => {
    it('is never used when DEMO_MODE is off', async () => {
      const { service, otp } = setup({ demoMode: false });
      await service.requestCode('08031234567');
      expect(demoCodeUsed(otp)).toBe(false);
    });

    it('works for brand-new numbers in DEMO_MODE', async () => {
      const { service, otp } = setup({ demoMode: true });
      await service.requestCode('08031234567');
      expect(demoCodeUsed(otp)).toBe(true);
    });

    it('works for demo accounts in DEMO_MODE', async () => {
      const { service, otp } = setup({ demoMode: true, existingUser: { role: 'ADMIN', isDemo: true, phone: '+2340000000004' } });
      await service.requestCode('+2340000000004');
      expect(demoCodeUsed(otp)).toBe(true);
    });

    it.each(['ADMIN', 'VENDOR', 'RIDER'])('does NOT work for a real %s account, even in DEMO_MODE', async (role) => {
      const { service, otp } = setup({ demoMode: true, existingUser: { role, isDemo: false } });
      await service.requestCode('08031234567');
      expect(demoCodeUsed(otp)).toBe(false);
    });
  });
});
