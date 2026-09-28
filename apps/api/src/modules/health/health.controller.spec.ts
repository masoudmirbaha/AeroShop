import { Test } from '@nestjs/testing';
import { healthResponseSchema } from '@aeroshop/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const prisma = { $queryRaw: vi.fn() };
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('reports ok when the database responds', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    const result = await controller.check();

    expect(healthResponseSchema.parse(result)).toMatchObject({
      status: 'ok',
      db: 'up',
    });
  });

  it('reports degraded when the database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await controller.check();

    expect(result).toMatchObject({ status: 'degraded', db: 'down' });
  });
});
