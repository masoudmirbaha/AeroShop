import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { toProductCard } from '../products/product.presenter.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { children: { orderBy: { name: 'asc' } } },
    });
  }

  async bySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { orderBy: { name: 'asc' } },
        products: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          include: { category: true, topic: true, images: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return {
      ...category,
      products: category.products.map(toProductCard),
    };
  }
}
