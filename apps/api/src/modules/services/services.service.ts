import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { toman } from '../../common/money.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.service.findMany({ orderBy: { title: 'asc' } });
  }

  async bySlug(slug: string) {
    const service = await this.prisma.service.findUnique({ where: { slug } });
    if (!service) throw new NotFoundException('خدمت یافت نشد');
    return service;
  }

  async createRequest(
    userId: string,
    input: { serviceSlug: string; subject: string; message: string },
  ) {
    const service = await this.bySlug(input.serviceSlug);
    const request = await this.prisma.serviceRequest.create({
      data: {
        userId,
        serviceId: service.id,
        subject: input.subject,
        message: input.message,
      },
      include: { service: true, messages: true },
    });
    return presentRequest(request);
  }

  async listRequests(userId: string, isAdmin: boolean) {
    const requests = await this.prisma.serviceRequest.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: 'desc' },
      include: { service: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    return requests.map(presentRequest);
  }

  async requestById(userId: string, isAdmin: boolean, id: string) {
    const request = await this.findOwned(userId, isAdmin, id);
    return presentRequest(request);
  }

  async addMessage(userId: string, isAdmin: boolean, id: string, body: string) {
    await this.findOwned(userId, isAdmin, id);
    await this.prisma.serviceRequestMessage.create({
      data: { requestId: id, authorId: userId, body },
    });
    return this.requestById(userId, isAdmin, id);
  }

  async updateStatus(
    id: string,
    status: 'NEW' | 'REVIEWING' | 'QUOTED' | 'IN_PROGRESS' | 'DELIVERED' | 'CLOSED',
    quotedAmount?: number,
  ) {
    const existing = await this.prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('درخواست یافت نشد');
    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        ...(quotedAmount == null ? {} : { quotedAmount }),
      },
      include: { service: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    return presentRequest(request);
  }

  private async findOwned(userId: string, isAdmin: boolean, id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: { service: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!request || (!isAdmin && request.userId !== userId)) {
      throw new NotFoundException('درخواست یافت نشد');
    }
    if (!isAdmin && request.userId !== userId) {
      throw new ForbiddenException('به این درخواست دسترسی ندارید');
    }
    return request;
  }
}

function presentRequest(request: {
  id: string;
  status: string;
  subject: string;
  message: string;
  quotedAmount: { toNumber(): number } | null;
  createdAt: Date;
  updatedAt: Date;
  service: { title: string; slug: string };
  messages: { id: string; body: string; authorId: string; createdAt: Date }[];
}) {
  return {
    id: request.id,
    status: request.status,
    subject: request.subject,
    message: request.message,
    quotedAmount: toman(request.quotedAmount),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    service: request.service,
    messages: request.messages,
  };
}
