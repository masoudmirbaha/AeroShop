import { Module } from '@nestjs/common';
import { AdminCatalogController } from './admin-catalog.controller.js';
import { AdminCatalogService } from './admin-catalog.service.js';
import { AdminContentController } from './admin-content.controller.js';
import { AdminContentService } from './admin-content.service.js';
import { AdminSalesController } from './admin-sales.controller.js';
import { AdminSalesService } from './admin-sales.service.js';

@Module({
  controllers: [AdminCatalogController, AdminSalesController, AdminContentController],
  providers: [AdminCatalogService, AdminSalesService, AdminContentService],
})
export class AdminModule {}
