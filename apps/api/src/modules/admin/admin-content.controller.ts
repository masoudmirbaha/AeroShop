import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { AdminContentService } from './admin-content.service.js';
import { adminListQuerySchema, faqInputSchema, faqUpdateSchema } from './admin.schemas.js';

@Roles('ADMIN')
@Controller('admin')
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}

  @Get('summary')
  summary() {
    return this.content.summary();
  }

  @Get('service-requests')
  listServiceRequests(@Query(new ZodValidationPipe(adminListQuerySchema)) query: unknown) {
    return this.content.listServiceRequests(adminListQuerySchema.parse(query));
  }

  @Get('contact-messages')
  listContactMessages(@Query(new ZodValidationPipe(adminListQuerySchema)) query: unknown) {
    return this.content.listContactMessages(adminListQuerySchema.parse(query));
  }

  @Delete('contact-messages/:id')
  deleteContactMessage(@Param('id') id: string) {
    return this.content.deleteContactMessage(id);
  }

  @Get('faq')
  listFaq() {
    return this.content.listFaq();
  }

  @Post('faq')
  createFaq(@Body(new ZodValidationPipe(faqInputSchema)) body: unknown) {
    return this.content.createFaq(faqInputSchema.parse(body));
  }

  @Patch('faq/:id')
  updateFaq(@Param('id') id: string, @Body(new ZodValidationPipe(faqUpdateSchema)) body: unknown) {
    return this.content.updateFaq(id, faqUpdateSchema.parse(body));
  }

  @Delete('faq/:id')
  deleteFaq(@Param('id') id: string) {
    return this.content.deleteFaq(id);
  }
}
