import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { AdminProductImagesService } from './admin-product-images.service.js';
import {
  productImageOrderSchema,
  type ProductImageOrderInput,
} from './admin-product-images.schemas.js';
import { PRODUCT_IMAGE_UPLOAD_FIELD } from './product-image-upload.constants.js';
import { productImageMulterOptions } from './product-image-upload.multer.js';

@Roles('ADMIN')
@Controller('admin/products')
export class AdminProductImagesController {
  constructor(private readonly images: AdminProductImagesService) {}

  @Get(':productId/images')
  list(@Param('productId') productId: string) {
    return this.images.list(productId);
  }

  @Post(':productId/images')
  @UseInterceptors(FileInterceptor(PRODUCT_IMAGE_UPLOAD_FIELD, productImageMulterOptions()))
  upload(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.images.upload(productId, file);
  }

  @Patch(':productId/images/order')
  reorder(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(productImageOrderSchema)) body: ProductImageOrderInput,
  ) {
    return this.images.reorder(productId, body);
  }

  @Delete(':productId/images/:imageId')
  remove(@Param('productId') productId: string, @Param('imageId') imageId: string) {
    return this.images.remove(productId, imageId);
  }
}
