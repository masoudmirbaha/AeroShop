import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminCatalogService } from './admin-catalog.service.js';
import { AdminSalesService } from './admin-sales.service.js';
import { productInputSchema, productUpdateSchema } from './admin.schemas.js';

describe('Admin services', () => {
  const prisma = {
    product: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
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
});
