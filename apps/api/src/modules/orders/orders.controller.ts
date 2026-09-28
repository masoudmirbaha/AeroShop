import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import type { AuthUser } from '../auth/auth.types.js';
import { checkoutSchema } from './orders.schemas.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.orders.list(user.sub, user.role === 'ADMIN');
  }

  @Get(':id')
  byId(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.byId(user.sub, user.role === 'ADMIN', id);
  }

  @Post()
  checkout(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(checkoutSchema)) body: unknown,
  ) {
    const input = checkoutSchema.parse(body);
    return this.orders.checkout(user.sub, input.result);
  }
}
