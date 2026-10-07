import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/roles.decorator.js';
import { AdminProductFilesService } from './admin-product-files.service.js';
import { PRODUCT_FILE_UPLOAD_FIELD } from './product-file-upload.constants.js';
import { productFileMulterOptions } from './product-file-upload.multer.js';

@Roles('ADMIN')
@Controller('admin/products')
export class AdminProductFilesController {
  constructor(private readonly files: AdminProductFilesService) {}

  @Post(':productId/files')
  @UseInterceptors(FileInterceptor(PRODUCT_FILE_UPLOAD_FIELD, productFileMulterOptions()))
  upload(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.files.upload(productId, file);
  }
}
