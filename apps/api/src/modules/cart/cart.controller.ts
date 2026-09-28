import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import type { AuthUser } from '../auth/auth.types.js';
import { addCartItemSchema, updateCartItemSchema } from './cart.schemas.js';
import { CartService } from './cart.service.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.cart.get(user.sub);
  }

  @Post('items')
  add(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(addCartItemSchema)) body: unknown,
  ) {
    const input = addCartItemSchema.parse(body);
    return this.cart.add(user.sub, input.productId, input.quantity);
  }

  @Patch('items/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCartItemSchema)) body: unknown,
  ) {
    const input = updateCartItemSchema.parse(body);
    return this.cart.update(user.sub, id, input.quantity);
  }

  @Delete('items/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cart.remove(user.sub, id);
  }

  @Delete()
  clear(@CurrentUser() user: AuthUser) {
    return this.cart.clear(user.sub);
  }
}
