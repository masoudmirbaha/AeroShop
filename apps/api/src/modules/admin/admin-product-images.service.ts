import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageProvider } from '../downloads/storage-provider.js';
import { productImagePublicUrl } from '../products/product-image.public.js';
import type { ProductImageOrderInput } from './admin-product-images.schemas.js';
import { validateProductImageUpload } from './product-image-upload.validation.js';

export type UploadedTempImage = {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class AdminProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
  ) {}

  async list(productId: string) {
    await this.requireProduct(productId);
    const rows = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => this.toSafeResponse(row));
  }

  async upload(productId: string, file: UploadedTempImage | undefined) {
    if (!file?.path) {
      throw new BadRequestException('فایل ارسال نشده است');
    }

    const tempPath = file.path;
    let permanentKey: string | undefined;

    try {
      await this.requireProduct(productId);

      const validated = validateProductImageUpload({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      const aggregate = await this.prisma.productImage.aggregate({
        where: { productId },
        _max: { sortOrder: true },
      });
      const sortOrder = (aggregate._max.sortOrder ?? -1) + 1;

      permanentKey = `products/${productId}/images/${randomUUID()}${validated.extension}`;
      await this.storage.put(permanentKey, createReadStream(tempPath));

      try {
        const row = await this.prisma.productImage.create({
          data: {
            productId,
            url: permanentKey,
            alt: null,
            sortOrder,
          },
        });
        return this.toSafeResponse(row);
      } catch (error) {
        await this.storage.delete(permanentKey);
        permanentKey = undefined;
        throw error;
      }
    } finally {
      await unlink(tempPath).catch(() => undefined);
    }
  }

  async remove(productId: string, imageId: string) {
    const row = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
      select: { id: true, url: true },
    });
    if (!row) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const storageKey = row.url;
    await this.prisma.productImage.delete({ where: { id: row.id } });
    try {
      await this.storage.delete(storageKey);
    } catch {
      // Best-effort: DB row is already removed.
    }
    return { ok: true as const };
  }

  async reorder(productId: string, items: ProductImageOrderInput) {
    await this.requireProduct(productId);

    const existing = await this.prisma.productImage.findMany({
      where: { productId },
      select: { id: true },
      orderBy: { sortOrder: 'asc' },
    });
    const existingIds = new Set(existing.map((row) => row.id));

    if (items.length !== existing.length) {
      throw new BadRequestException('فهرست ترتیب باید شامل همه تصاویر محصول باشد');
    }

    const seenIds = new Set<string>();
    const seenOrders = new Set<number>();
    for (const item of items) {
      if (!existingIds.has(item.id)) {
        throw new BadRequestException('شناسه تصویر نامعتبر است');
      }
      if (seenIds.has(item.id)) {
        throw new BadRequestException('شناسه تصویر تکراری است');
      }
      if (seenOrders.has(item.sortOrder)) {
        throw new BadRequestException('ترتیب نمایش تکراری است');
      }
      seenIds.add(item.id);
      seenOrders.add(item.sortOrder);
    }

    const expectedOrders = [...Array(items.length).keys()];
    const submittedOrders = [...seenOrders].sort((a, b) => a - b);
    if (submittedOrders.join(',') !== expectedOrders.join(',')) {
      throw new BadRequestException('ترتیب نمایش باید اعداد پیوسته از صفر باشد');
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.productImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.list(productId);
  }

  private async requireProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('محصول یافت نشد');
    }
  }

  private toSafeResponse(row: {
    id: string;
    productId: string;
    alt: string | null;
    sortOrder: number;
  }) {
    return {
      id: row.id,
      productId: row.productId,
      url: productImagePublicUrl(row.id),
      alt: row.alt,
      sortOrder: row.sortOrder,
    };
  }
}
