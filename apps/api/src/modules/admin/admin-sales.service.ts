import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toman } from '../../common/money.js';
import type { OrderStatus, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AdminListQuery, UserUpdate } from './admin.schemas.js';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];

@Injectable()
export class AdminSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(query: AdminListQuery) {
    const status = query.status as OrderStatus | undefined;
    if (status && !ORDER_STATUSES.includes(status)) {
      throw new BadRequestException('وضعیت سفارش نامعتبر است');
    }
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(query.q ? { user: { email: { contains: query.q, mode: 'insensitive' } } } : {}),
    };
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: true,
          payment: true,
        },
      }),
    ]);
    return {
      items: orders.map((order) => ({
        id: order.id,
        status: order.status,
        subtotal: toman(order.subtotal),
        discount: toman(order.discount),
        total: toman(order.total),
        createdAt: order.createdAt,
        user: order.user,
        payment: order.payment && {
          provider: order.payment.provider,
          status: order.payment.status,
        },
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          unitPrice: toman(item.unitPrice),
          quantity: item.quantity,
          lineTotal: toman(item.lineTotal),
        })),
      })),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async listUsers(query: AdminListQuery) {
    const where: Prisma.UserWhereInput = query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: 'insensitive' } },
            { firstName: { contains: query.q, mode: 'insensitive' } },
            { lastName: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);
    return {
      items: users.map(({ _count, ...user }) => ({ ...user, orderCount: _count.orders })),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async updateUser(actorId: string, id: string, input: UserUpdate) {
    if (actorId === id) {
      throw new BadRequestException('نقش یا وضعیت حساب خودتان را نمی‌توانید تغییر دهید');
    }
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('کاربر یافت نشد');

    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: input,
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (input.isActive === false || (input.role && input.role !== existing.role)) {
        await tx.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return updated;
    });
    return user;
  }
}
