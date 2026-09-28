import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toman } from '../../common/money.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const itemInclude = {
  product: { include: { images: { orderBy: { sortOrder: 'asc' as const }, take: 1 } } },
} as const;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const cart = await this.ensure(userId);
    return this.present(cart.id);
  }

  async add(userId: string, productId: string, quantity: number) {
    const product = await this.publishedProduct(productId);
    const cart = await this.ensure(userId);
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    });
    const next = (existing?.quantity ?? 0) + quantity;
    if (next > 99) throw new BadRequestException('تعداد مجاز نیست');

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: { cartId: cart.id, productId: product.id, quantity },
      update: { quantity: next },
    });
    return this.present(cart.id);
  }

  async update(userId: string, itemId: string, quantity: number) {
    const cart = await this.ensure(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('آیتم سبد یافت نشد');
    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return this.present(cart.id);
  }

  async remove(userId: string, itemId: string) {
    const cart = await this.ensure(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('آیتم سبد یافت نشد');
    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.present(cart.id);
  }

  async clear(userId: string) {
    const cart = await this.ensure(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.present(cart.id);
  }

  private ensure(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async publishedProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isPublished: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  private async present(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: itemInclude,
      orderBy: { id: 'asc' },
    });
    const lines = items.map((item) => {
      const price = toman(item.product.price) ?? 0;
      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          type: item.product.type,
          price,
          isDigital: item.product.isDigital,
          image: item.product.images[0]?.url ?? null,
        },
        lineTotal: price * item.quantity,
      };
    });
    return {
      items: lines,
      subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    };
  }
}
