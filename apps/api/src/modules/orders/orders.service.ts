import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toman } from '../../common/money.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PaymentProvider, type PaymentResult } from '../payments/payment-provider.js';

const GRANT_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentProvider,
  ) {}

  list(userId: string, isAdmin: boolean) {
    return this.prisma.order.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payment: true },
    }).then((orders) => orders.map(presentOrder));
  }

  async byId(userId: string, isAdmin: boolean, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return presentOrder(order);
  }

  async checkout(userId: string, result: PaymentResult) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                files: true,
                bundleItems: { include: { product: { include: { files: true } } } },
              },
            },
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('سبد خرید خالی است');
    }
    if (cart.items.some((item) => !item.product.isPublished)) {
      throw new BadRequestException('یکی از محصولات دیگر قابل خرید نیست');
    }

    const lines = cart.items.map((item) => {
      const unitPrice = toman(item.product.price) ?? 0;
      return {
        productId: item.product.id,
        productName: item.product.title,
        unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
        fileIds: collectFileIds(item.product),
      };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const outcome = await this.payments.charge(subtotal, result);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: outcome === 'SUCCESS' ? 'PAID' : 'FAILED',
          subtotal,
          discount: 0,
          total: subtotal,
          payment: {
            create: {
              provider: 'MOCK',
              status: outcome === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
              amount: subtotal,
            },
          },
        },
      });
      const createdItems = [];
      for (const line of lines) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.productId,
            productName: line.productName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
          },
        });
        createdItems.push({ orderItem, line });
      }

      if (outcome === 'SUCCESS') {
        const expiresAt = new Date(Date.now() + GRANT_MS);
        for (const { orderItem, line } of createdItems) {
          for (const productFileId of line.fileIds) {
            await tx.downloadGrant.upsert({
              where: { userId_productFileId: { userId, productFileId } },
              create: { userId, productFileId, orderItemId: orderItem.id, expiresAt },
              update: { orderItemId: orderItem.id, expiresAt },
            });
          }
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      const full = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, payment: true },
      });
      return presentOrder(full);
    });
  }
}

function collectFileIds(product: {
  files: { id: string }[];
  bundleItems: { product: { files: { id: string }[] } }[];
}) {
  const ids = new Set(product.files.map((file) => file.id));
  for (const item of product.bundleItems) {
    for (const file of item.product.files) ids.add(file.id);
  }
  return [...ids];
}

function presentOrder(order: {
  id: string;
  status: string;
  subtotal: { toNumber(): number };
  discount: { toNumber(): number };
  total: { toNumber(): number };
  createdAt: Date;
  items: {
    id: string;
    productName: string;
    unitPrice: { toNumber(): number };
    quantity: number;
    lineTotal: { toNumber(): number };
  }[];
  payment: { id: string; provider: string; status: string; amount: { toNumber(): number } } | null;
}) {
  return {
    id: order.id,
    status: order.status,
    subtotal: toman(order.subtotal),
    discount: toman(order.discount),
    total: toman(order.total),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      unitPrice: toman(item.unitPrice),
      quantity: item.quantity,
      lineTotal: toman(item.lineTotal),
    })),
    payment: order.payment && {
      id: order.payment.id,
      provider: order.payment.provider,
      status: order.payment.status,
      amount: toman(order.payment.amount),
    },
  };
}
