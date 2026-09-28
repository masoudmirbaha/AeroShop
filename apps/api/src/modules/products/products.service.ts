import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { productInclude, toProductCard } from './product.presenter.js';
import type { ProductQuery } from './products.schemas.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.topic ? { topic: { slug: query.topic } } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.level ? { level: query.level } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { summary: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: productInclude,
      }),
    ]);

    return {
      items: items.map(toProductCard),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        ...productInclude,
        files: { select: { id: true, filename: true, mimeType: true, sizeBytes: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: { lessons: { orderBy: { sortOrder: 'asc' } } },
        },
        bundleItems: {
          orderBy: { sortOrder: 'asc' },
          include: { product: { include: productInclude } },
        },
      },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const related = product.topicId
      ? await this.prisma.product.findMany({
          where: {
            isPublished: true,
            topicId: product.topicId,
            id: { not: product.id },
          },
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: productInclude,
        })
      : [];

    return {
      ...toProductCard(product),
      description: product.description,
      images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
      files: product.files,
      sections: product.sections,
      bundleItems: product.bundleItems.map((item) => toProductCard(item.product)),
      related: related.map(toProductCard),
    };
  }
}
