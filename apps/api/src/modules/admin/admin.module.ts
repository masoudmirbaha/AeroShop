import { Module } from '@nestjs/common';
import { DownloadsModule } from '../downloads/downloads.module.js';
import { AdminCatalogController } from './admin-catalog.controller.js';
import { AdminCatalogService } from './admin-catalog.service.js';
import { AdminContentController } from './admin-content.controller.js';
import { AdminContentService } from './admin-content.service.js';
import { AdminProductFilesController } from './admin-product-files.controller.js';
import { AdminProductFilesService } from './admin-product-files.service.js';
import { AdminSalesController } from './admin-sales.controller.js';
import { AdminSalesService } from './admin-sales.service.js';

@Module({
  imports: [DownloadsModule],
  controllers: [
    AdminCatalogController,
    AdminSalesController,
    AdminContentController,
    AdminProductFilesController,
  ],
  providers: [
    AdminCatalogService,
    AdminSalesService,
    AdminContentService,
    AdminProductFilesService,
  ],
})
export class AdminModule {}
