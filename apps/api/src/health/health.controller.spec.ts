import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { HealthController } from './health.controller.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makeController(queryRaw: () => Promise<unknown>) {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  return new HealthController(prisma, { IP_DEBUG: false, TRUST_PROXY_HOPS: 0 });
}

function makeResponse() {
  const res = { status: vi.fn() };
  return res as unknown as Response & { status: ReturnType<typeof vi.fn> };
}

describe('HealthController', () => {
  it('reports ok when the database answers', async () => {
    const res = makeResponse();
    const report = await makeController(() => Promise.resolve([{ '?column?': 1 }])).check(res);

    expect(report.status).toBe('ok');
    expect(report.database).toBe('ok');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('reports an error with status 503 when the database is unreachable', async () => {
    const res = makeResponse();
    const report = await makeController(() => Promise.reject(new Error('down'))).check(res);

    expect(report).toMatchObject({ status: 'error', database: 'error' });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('has a database-free liveness check', () => {
    expect(makeController(() => Promise.reject(new Error('down'))).live()).toEqual({ status: 'ok' });
  });

  it('hides the IP diagnostic unless IP_DEBUG is on', () => {
    expect(() => makeController(() => Promise.resolve([])).ip({} as never)).toThrow();
  });
});
