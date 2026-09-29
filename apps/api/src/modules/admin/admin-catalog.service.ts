import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toman } from '../../common/money.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  AdminListQuery,
  CategoryInput,
  CategoryUpdate,
  ProductInput,
  ProductUpdate,
} from './admin.schemas.js';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: AdminListQuery) {
    const where: Prisma.ProductWhereInput = query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { slug: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { category: true, topic: true },
      }),
    ]);
    return {
      items: items.map((product) => ({
        id: product.id,
        type: product.type,
        title: product.title,
        slug: product.slug,
        price: toman(product.price),
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        category: product.category?.name ?? null,
        topic: product.topic?.name ?? null,
        updatedAt: product.updatedAt,
      })),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async productById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return {
      ...product,
      price: toman(product.price),
      comparePrice: toman(product.comparePrice),
    };
  }

  async createProduct(input: ProductInput) {
    assertFreePrice(input.type, input.price);
    const product = await this.prisma.product.create({ data: input });
    return this.productById(product.id);
  }

  async updateProduct(id: string, input: ProductUpdate) {
    const existing = await this.productById(id);
    assertFreePrice(input.type ?? existing.type, input.price ?? existing.price ?? 0);
    await this.prisma.product.update({ where: { id }, data: input });
    return this.productById(id);
  }

  async deleteProduct(id: string) {
    await this.productById(id);
    const sold = await this.prisma.orderItem.count({ where: { productId: id } });
    if (sold > 0) {
      throw new ConflictException(
        'این محصول فروخته شده است؛ به‌جای حذف، آن را از حالت انتشار خارج کنید',
      );
    }
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { parent: true, _count: { select: { products: true, children: true } } },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      parent: category.parent?.name ?? null,
      productCount: category._count.products,
      childCount: category._count.children,
    }));
  }

  async createCategory(input: CategoryInput) {
    return this.prisma.category.create({ data: input });
  }

  async updateCategory(id: string, input: CategoryUpdate) {
    await this.findCategory(id);
    if (input.parentId === id) {
      throw new BadRequestException('دسته نمی‌تواند والد خودش باشد');
    }
    return this.prisma.category.update({ where: { id }, data: input });
  }

  async deleteCategory(id: string) {
    await this.findCategory(id);
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  private async findCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('دسته یافت نشد');
    return category;
  }
}

function assertFreePrice(type: string, price: number) {
  if (type === 'FREE' && price !== 0) {
    throw new BadRequestException('قیمت محصول رایگان باید صفر باشد');
  }
}
