import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../common/public.decorator.js';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { contactSchema } from './content.schemas.js';

@Public()
@Controller()
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('faq')
  faq() {
    return this.prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Get('testimonials')
  testimonials() {
    return this.prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('pages')
  pages() {
    return this.prisma.page.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { title: true, slug: true, excerpt: true, kind: true, createdAt: true },
    });
  }

  @Post('contact')
  contact(@Body(new ZodValidationPipe(contactSchema)) body: unknown) {
    const input = contactSchema.parse(body);
    return this.prisma.contactMessage.create({ data: input }).then(() => ({ ok: true }));
  }

  @Roles('ADMIN')
  @Get('admin/summary')
  async summary() {
    const [products, orders, users, requests, messages] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.serviceRequest.count(),
      this.prisma.contactMessage.count(),
    ]);
    return { products, orders, users, requests, messages };
  }
}
