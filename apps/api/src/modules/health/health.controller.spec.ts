import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { healthResponseSchema } from '@aeroshop/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const prisma = { $queryRaw: vi.fn() };
  const res = { status: vi.fn() };
  let controller: HealthController;

  beforeEach(async () => {
    res.status.mockClear();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('reports ok when the database responds', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    const result = await controller.check(res as unknown as Response);

    expect(healthResponseSchema.parse(result)).toMatchObject({
      status: 'ok',
      db: 'up',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('reports degraded with 503 when the database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await controller.check(res as unknown as Response);

    expect(result).toMatchObject({ status: 'degraded', db: 'down' });
    expect(res.status).toHaveBeenCalledWith(503);
  });
});
