import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { HealthResponse } from '@aeroshop/shared';
import { Public } from '../../common/public.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // 503 when the database is down so container/load-balancer probes see the failure.
  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const db = await this.prisma.$queryRaw`SELECT 1`.then(
      () => 'up' as const,
      () => 'down' as const,
    );

    res.status(db === 'up' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
