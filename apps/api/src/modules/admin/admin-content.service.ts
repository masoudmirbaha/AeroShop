import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toman } from '../../common/money.js';
import type { ServiceRequestStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AdminListQuery, FaqInput, FaqUpdate } from './admin.schemas.js';

const REQUEST_STATUSES: ServiceRequestStatus[] = [
  'NEW',
  'REVIEWING',
  'QUOTED',
  'IN_PROGRESS',
  'DELIVERED',
  'CLOSED',
];

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [products, orders, paidOrders, users, requests, openRequests, messages] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PAID' } }),
        this.prisma.user.count(),
        this.prisma.serviceRequest.count(),
        this.prisma.serviceRequest.count({ where: { status: { not: 'CLOSED' } } }),
        this.prisma.contactMessage.count(),
      ]);
    return { products, orders, paidOrders, users, requests, openRequests, messages };
  }

  async listServiceRequests(query: AdminListQuery) {
    const status = query.status as ServiceRequestStatus | undefined;
    if (status && !REQUEST_STATUSES.includes(status)) {
      throw new BadRequestException('وضعیت درخواست نامعتبر است');
    }
    const where = status ? { status } : {};
    const [total, requests] = await Promise.all([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          service: { select: { title: true, slug: true } },
          user: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { messages: true } },
        },
      }),
    ]);
    return {
      items: requests.map(({ _count, ...request }) => ({
        id: request.id,
        status: request.status,
        subject: request.subject,
        message: request.message,
        quotedAmount: toman(request.quotedAmount),
        createdAt: request.createdAt,
        service: request.service,
        user: request.user,
        messageCount: _count.messages,
      })),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async listContactMessages(query: AdminListQuery) {
    const [total, items] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return { items, page: query.page, pageSize: query.pageSize, total };
  }

  async deleteContactMessage(id: string) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('پیام یافت نشد');
    await this.prisma.contactMessage.delete({ where: { id } });
    return { ok: true };
  }

  listFaq() {
    return this.prisma.faqItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  }

  createFaq(input: FaqInput) {
    return this.prisma.faqItem.create({ data: input });
  }

  async updateFaq(id: string, input: FaqUpdate) {
    await this.findFaq(id);
    return this.prisma.faqItem.update({ where: { id }, data: input });
  }

  async deleteFaq(id: string) {
    await this.findFaq(id);
    await this.prisma.faqItem.delete({ where: { id } });
    return { ok: true };
  }

  private async findFaq(id: string) {
    const item = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('پرسش یافت نشد');
    return item;
  }
}
