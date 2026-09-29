import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { AdminCatalogService } from './admin-catalog.service.js';
import {
  adminListQuerySchema,
  categoryInputSchema,
  categoryUpdateSchema,
  productInputSchema,
  productUpdateSchema,
} from './admin.schemas.js';

@Roles('ADMIN')
@Controller('admin')
export class AdminCatalogController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get('products')
  listProducts(@Query(new ZodValidationPipe(adminListQuerySchema)) query: unknown) {
    return this.catalog.listProducts(adminListQuerySchema.parse(query));
  }

  @Get('products/:id')
  productById(@Param('id') id: string) {
    return this.catalog.productById(id);
  }

  @Post('products')
  createProduct(@Body(new ZodValidationPipe(productInputSchema)) body: unknown) {
    return this.catalog.createProduct(productInputSchema.parse(body));
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(productUpdateSchema)) body: unknown,
  ) {
    return this.catalog.updateProduct(id, productUpdateSchema.parse(body));
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Post('categories')
  createCategory(@Body(new ZodValidationPipe(categoryInputSchema)) body: unknown) {
    return this.catalog.createCategory(categoryInputSchema.parse(body));
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(categoryUpdateSchema)) body: unknown,
  ) {
    return this.catalog.updateCategory(id, categoryUpdateSchema.parse(body));
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.catalog.deleteCategory(id);
  }
}
