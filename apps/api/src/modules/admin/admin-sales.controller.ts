import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/current-user.decorator.js';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import type { AuthUser } from '../auth/auth.types.js';
import { AdminSalesService } from './admin-sales.service.js';
import { adminListQuerySchema, userUpdateSchema } from './admin.schemas.js';

@Roles('ADMIN')
@Controller('admin')
export class AdminSalesController {
  constructor(private readonly sales: AdminSalesService) {}

  @Get('orders')
  listOrders(@Query(new ZodValidationPipe(adminListQuerySchema)) query: unknown) {
    return this.sales.listOrders(adminListQuerySchema.parse(query));
  }

  @Get('users')
  listUsers(@Query(new ZodValidationPipe(adminListQuerySchema)) query: unknown) {
    return this.sales.listUsers(adminListQuerySchema.parse(query));
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) body: unknown,
  ) {
    return this.sales.updateUser(actor.sub, id, userUpdateSchema.parse(body));
  }
}
