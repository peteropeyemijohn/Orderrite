// Checks the reusable guards through real HTTP requests:
// no token -> 401, wrong role -> 403, right role -> allowed.
import { Controller, Get, type INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TokensService } from '../../auth/tokens.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FakeClock, FakeRefreshTokenStore } from '../../test-utils/fakes.js';
import { CurrentUser, type AuthUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { Roles } from '../decorators/roles.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Controller('test')
class TestController {
  @Public()
  @Get('open')
  open() {
    return { ok: true };
  }

  @Get('signed-in')
  signedIn(@CurrentUser() user: AuthUser) {
    return { role: user.role };
  }

  @Roles('ADMIN')
  @Get('admin')
  admin() {
    return { ok: true };
  }

  @Roles('ADMIN', 'VENDOR')
  @Get('dashboard')
  dashboard() {
    return { ok: true };
  }
}

const users: Record<string, { id: string; phone: string; name: null; role: AuthUser['role']; isDemo: boolean; isActive: boolean }> = {
  admin: { id: 'admin', phone: '+2348000000001', name: null, role: 'ADMIN', isDemo: false, isActive: true },
  vendor: { id: 'vendor', phone: '+2348000000002', name: null, role: 'VENDOR', isDemo: false, isActive: true },
  customer: { id: 'customer', phone: '+2348000000003', name: null, role: 'CUSTOMER', isDemo: false, isActive: true },
  suspended: { id: 'suspended', phone: '+2348000000004', name: null, role: 'ADMIN', isDemo: false, isActive: false },
};

describe('JwtAuthGuard + RolesGuard', () => {
  let app: INestApplication;
  let tokens: TokensService;

  beforeAll(async () => {
    tokens = new TokensService(new JwtService({ secret: 'j'.repeat(40) }), new FakeRefreshTokenStore(), new FakeClock(new Date()), {
      ACCESS_TOKEN_TTL_MINUTES: 15,
      REFRESH_TOKEN_TTL_DAYS: 30,
    });
    const prisma = {
      user: { findUnique: ({ where }: { where: { id: string } }) => Promise.resolve(users[where.id] ?? null) },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        { provide: TokensService, useValue: tokens },
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  const tokenFor = async (id: keyof typeof users) => (await tokens.issue(users[id]!)).accessToken;
  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(path);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('lets anyone call @Public() endpoints', async () => {
    await get('/test/open').expect(200);
  });

  it('rejects requests without a token (401)', async () => {
    await get('/test/signed-in').expect(401);
    await get('/test/admin').expect(401);
  });

  it('rejects made-up or tampered tokens (401)', async () => {
    await get('/test/signed-in', 'not-a-token').expect(401);
    const forged = new JwtService({ secret: 'wrong-secret'.repeat(4) }).sign({ sub: 'admin', role: 'ADMIN' });
    await get('/test/admin', forged).expect(401);
  });

  it('rejects suspended accounts even with a valid token (401)', async () => {
    await get('/test/signed-in', await tokenFor('suspended')).expect(401);
  });

  it('allows any signed-in user where no role is required', async () => {
    const res = await get('/test/signed-in', await tokenFor('customer')).expect(200);
    expect(res.body).toEqual({ role: 'CUSTOMER' });
  });

  it('blocks the wrong role (403) and allows the right one', async () => {
    await get('/test/admin', await tokenFor('customer')).expect(403);
    await get('/test/admin', await tokenFor('vendor')).expect(403);
    await get('/test/admin', await tokenFor('admin')).expect(200);
    await get('/test/dashboard', await tokenFor('vendor')).expect(200);
    await get('/test/dashboard', await tokenFor('customer')).expect(403);
  });
});
