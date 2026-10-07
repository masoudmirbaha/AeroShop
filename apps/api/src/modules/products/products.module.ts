import { Module } from '@nestjs/common';
import { DownloadsModule } from '../downloads/downloads.module.js';
import { ProductImagesController } from './product-images.controller.js';
import { ProductImagesService } from './product-images.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [DownloadsModule],
  controllers: [ProductsController, ProductImagesController],
  providers: [ProductsService, ProductImagesService],
  exports: [ProductsService],
})
export class ProductsModule {}
