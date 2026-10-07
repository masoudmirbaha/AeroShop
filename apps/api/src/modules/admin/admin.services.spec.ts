import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminCatalogService } from './admin-catalog.service.js';
import { AdminSalesService } from './admin-sales.service.js';
import {
  adminProductQuerySchema,
  productInputSchema,
  productUpdateSchema,
} from './admin.schemas.js';

const validProduct = {
  type: 'SINGLE_PRODUCT' as const,
  title: 'محصول نمونه',
  slug: 'sample-product',
  summary: 'خلاصه',
  description: 'توضیح',
  price: 1000,
};

describe('Admin services', () => {
  const prisma = {
    product: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    orderItem: { count: vi.fn() },
    user: { findUnique: vi.fn() },
  };
  const catalog = new AdminCatalogService(prisma as unknown as PrismaService);
  const sales = new AdminSalesService(prisma as unknown as PrismaService);

  beforeEach(() => vi.resetAllMocks());

  it('rejects a FREE product with a non-zero price', async () => {
    const input = productInputSchema.parse({
      type: 'FREE',
      title: 'نمونه رایگان',
      slug: 'free-sample',
      summary: 'خلاصه',
      description: 'توضیح',
      price: 1000,
    });

    await expect(catalog.createProduct(input)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('refuses to delete a product that has been sold', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1', price: 1, comparePrice: null });
    prisma.orderItem.count.mockResolvedValueOnce(2);

    await expect(catalog.deleteProduct('p1')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.product.delete).not.toHaveBeenCalled();
  });

  it('does not let an admin change their own role or status', async () => {
    await expect(sales.updateUser('u1', 'u1', { isActive: false })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('keeps unspecified fields out of partial product updates', () => {
    expect(productUpdateSchema.parse({ title: 'عنوان تازه' })).toEqual({ title: 'عنوان تازه' });
  });

  it('defaults omitted create sortOrder to 0', () => {
    const input = productInputSchema.parse({
      type: 'SINGLE_PRODUCT',
      title: 'محصول نمونه',
      slug: 'sample-product',
      summary: 'خلاصه',
      description: 'توضیح',
      price: 1000,
    });
    expect(input.sortOrder).toBe(0);
  });

  it('rejects a negative sortOrder', () => {
    expect(productInputSchema.safeParse({ ...validProduct, sortOrder: -1 }).success).toBe(false);
  });

  it('rejects a sortOrder above 10000', () => {
    expect(productInputSchema.safeParse({ ...validProduct, sortOrder: 10001 }).success).toBe(false);
  });

  it('accepts a partial update with only sortOrder', () => {
    expect(productUpdateSchema.parse({ sortOrder: 5 })).toEqual({ sortOrder: 5 });
  });

  describe('product list filters', () => {
    async function listWith(query: Record<string, string>) {
      prisma.product.count.mockResolvedValueOnce(0);
      prisma.product.findMany.mockResolvedValueOnce([]);
      await catalog.listProducts(adminProductQuerySchema.parse(query));
      return prisma.product.findMany.mock.calls[0]![0].where as Record<string, unknown>;
    }

    it('lists drafts and published products when no status is given', async () => {
      expect(await listWith({})).toEqual({});
    });

    it('keeps only published products for status=published', async () => {
      expect(await listWith({ status: 'published' })).toEqual({ isPublished: true });
    });

    it('keeps only drafts for status=draft', async () => {
      expect(await listWith({ status: 'draft' })).toEqual({ isPublished: false });
    });

    it('filters by product type', async () => {
      expect(await listWith({ type: 'COURSE' })).toEqual({ type: 'COURSE' });
    });

    it('combines status and type', async () => {
      expect(await listWith({ status: 'draft', type: 'COURSE' })).toEqual({
        isPublished: false,
        type: 'COURSE',
      });
    });

    it('combines filters with the search term', async () => {
      expect(await listWith({ status: 'draft', type: 'COURSE', q: 'test' })).toEqual({
        isPublished: false,
        type: 'COURSE',
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { slug: { contains: 'test', mode: 'insensitive' } },
        ],
      });
    });

    it('keeps the existing pagination defaults', async () => {
      prisma.product.count.mockResolvedValueOnce(0);
      prisma.product.findMany.mockResolvedValueOnce([]);
      await catalog.listProducts(adminProductQuerySchema.parse({ page: '2' }));
      expect(prisma.product.findMany.mock.calls[0]![0]).toMatchObject({
        skip: 20,
        take: 20,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      });
    });

    it('rejects an unknown status before it reaches the service', () => {
      expect(adminProductQuerySchema.safeParse({ status: 'archived' }).success).toBe(false);
    });

    it('rejects an unknown product type before it reaches the service', () => {
      expect(adminProductQuerySchema.safeParse({ type: 'WEBINAR' }).success).toBe(false);
    });
  });
});
