import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/jwt-auth.guard.js';
import { RolesGuard } from '../../common/roles.guard.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ContentController } from './content.controller.js';

type BannerRow = {
  id: string;
  title: string;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FindManyArgs = {
  where: { isActive: boolean };
  orderBy: Record<string, 'asc' | 'desc'>[];
  select: Record<string, boolean>;
};

function banner(overrides: Partial<BannerRow> & Pick<BannerRow, 'id'>): BannerRow {
  return {
    title: `banner ${overrides.id}`,
    description: null,
    ctaText: null,
    ctaUrl: null,
    imageUrl: null,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-10-01T00:00:00Z'),
    updatedAt: new Date('2026-10-01T00:00:00Z'),
    ...overrides,
  };
}

/** Applies the where/orderBy/select arguments the controller passes, like Postgres would. */
function fakeFindMany(rows: BannerRow[]) {
  return vi.fn(({ where, orderBy, select }: FindManyArgs) => {
    const filtered = rows.filter((row) => row.isActive === where.isActive);
    filtered.sort((a, b) => {
      for (const clause of orderBy) {
        const [field, direction] = Object.entries(clause)[0] as [keyof BannerRow, 'asc' | 'desc'];
        const left = a[field] instanceof Date ? (a[field] as Date).getTime() : a[field];
        const right = b[field] instanceof Date ? (b[field] as Date).getTime() : b[field];
        if (left === right) continue;
        const result = (left as string | number) < (right as string | number) ? -1 : 1;
        return direction === 'asc' ? result : -result;
      }
      return 0;
    });
    const picked = filtered.map((row) =>
      Object.fromEntries(Object.keys(select).filter((key) => select[key]).map((key) => [key, row[key as keyof BannerRow]])),
    );
    return Promise.resolve(picked);
  });
}

describe('ContentController GET /home-banners', () => {
  const prisma = { homeBanner: { findMany: vi.fn() } };
  let controller: ContentController;

  beforeEach(async () => {
    prisma.homeBanner.findMany.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = moduleRef.get(ContentController);
  });

  it('returns only active banners with the public field set', async () => {
    prisma.homeBanner.findMany.mockImplementation(
      fakeFindMany([
        banner({ id: 'active', ctaText: 'مشاهده', ctaUrl: '/products', imageUrl: '/img.webp' }),
        banner({ id: 'inactive', isActive: false }),
      ]),
    );

    const result = await controller.homeBanners();

    expect(result).toEqual([
      {
        id: 'active',
        title: 'banner active',
        description: null,
        ctaText: 'مشاهده',
        ctaUrl: '/products',
        imageUrl: '/img.webp',
        sortOrder: 0,
      },
    ]);
    expect(prisma.homeBanner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it('never exposes isActive or timestamps', async () => {
    prisma.homeBanner.findMany.mockImplementation(fakeFindMany([banner({ id: 'a' })]));

    const [row] = await controller.homeBanners();

    expect(Object.keys(row).sort()).toEqual(
      ['ctaText', 'ctaUrl', 'description', 'id', 'imageUrl', 'sortOrder', 'title'].sort(),
    );
  });

  it('orders by sortOrder, then createdAt, then id', async () => {
    prisma.homeBanner.findMany.mockImplementation(
      fakeFindMany([
        banner({ id: 'late', sortOrder: 2 }),
        banner({ id: 'b', sortOrder: 1, createdAt: new Date('2026-10-02T00:00:00Z') }),
        banner({ id: 'tie-z', sortOrder: 1, createdAt: new Date('2026-10-01T00:00:00Z') }),
        banner({ id: 'tie-a', sortOrder: 1, createdAt: new Date('2026-10-01T00:00:00Z') }),
        banner({ id: 'first', sortOrder: 0, createdAt: new Date('2026-10-05T00:00:00Z') }),
      ]),
    );

    const result = await controller.homeBanners();

    expect(result.map((row) => row.id)).toEqual(['first', 'tie-a', 'tie-z', 'b', 'late']);
    expect(prisma.homeBanner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('returns an empty array when there are no active banners', async () => {
    prisma.homeBanner.findMany.mockImplementation(fakeFindMany([banner({ id: 'off', isActive: false })]));

    await expect(controller.homeBanners()).resolves.toEqual([]);
  });

  it('returns an empty array when the table is empty', async () => {
    prisma.homeBanner.findMany.mockImplementation(fakeFindMany([]));

    await expect(controller.homeBanners()).resolves.toEqual([]);
  });

  it('is reachable without authentication', () => {
    const reflector = new Reflector();
    const handler: unknown = Object.getOwnPropertyDescriptor(ContentController.prototype, 'homeBanners')?.value;
    const context = {
      getHandler: () => handler,
      getClass: () => ContentController,
      switchToHttp: () => ({ getRequest: () => ({ headers: {}, cookies: {} }) }),
    } as unknown as ExecutionContext;
    const jwt = { verify: vi.fn() };

    expect(new JwtAuthGuard(jwt as never, reflector).canActivate(context)).toBe(true);
    expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
    expect(jwt.verify).not.toHaveBeenCalled();
  });
});
