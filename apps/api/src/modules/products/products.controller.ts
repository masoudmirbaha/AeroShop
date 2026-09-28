import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/public.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { productQuerySchema } from './products.schemas.js';
import { ProductsService } from './products.service.js';

@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(productQuerySchema)) query: unknown) {
    return this.products.list(productQuerySchema.parse(query));
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.products.bySlug(slug);
  }
}
