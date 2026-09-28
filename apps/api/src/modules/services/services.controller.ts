import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/current-user.decorator.js';
import { Public } from '../../common/public.decorator.js';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import type { AuthUser } from '../auth/auth.types.js';
import {
  createRequestSchema,
  messageSchema,
  updateRequestSchema,
} from './services.schemas.js';
import { ServicesService } from './services.service.js';

@Controller()
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Public()
  @Get('services')
  list() {
    return this.services.list();
  }

  @Public()
  @Get('services/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.services.bySlug(slug);
  }

  @Post('service-requests')
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createRequestSchema)) body: unknown,
  ) {
    return this.services.createRequest(user.sub, createRequestSchema.parse(body));
  }

  @Get('service-requests')
  listRequests(@CurrentUser() user: AuthUser) {
    return this.services.listRequests(user.sub, user.role === 'ADMIN');
  }

  @Get('service-requests/:id')
  requestById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.services.requestById(user.sub, user.role === 'ADMIN', id);
  }

  @Post('service-requests/:id/messages')
  message(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(messageSchema)) body: unknown,
  ) {
    const input = messageSchema.parse(body);
    return this.services.addMessage(user.sub, user.role === 'ADMIN', id, input.body);
  }

  @Roles('ADMIN')
  @Patch('service-requests/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRequestSchema)) body: unknown,
  ) {
    const input = updateRequestSchema.parse(body);
    return this.services.updateStatus(id, input.status, input.quotedAmount);
  }
}
