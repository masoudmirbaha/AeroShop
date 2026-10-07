import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageProvider } from '../downloads/storage-provider.js';
import { validateProductUploadFile } from './product-file-upload.validation.js';

export type UploadedTempFile = {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class AdminProductFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
  ) {}

  async upload(productId: string, file: UploadedTempFile | undefined) {
    if (!file?.path) {
      throw new BadRequestException('فایل ارسال نشده است');
    }

    const tempPath = file.path;
    let permanentKey: string | undefined;

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) {
        throw new NotFoundException('محصول یافت نشد');
      }

      const validated = validateProductUploadFile({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      permanentKey = `products/${productId}/${randomUUID()}${validated.extension}`;
      await this.storage.put(permanentKey, createReadStream(tempPath));

      try {
        const row = await this.prisma.productFile.create({
          data: {
            productId,
            filename: validated.filename,
            storageKey: permanentKey,
            mimeType: validated.mimeType,
            sizeBytes: validated.sizeBytes,
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

  private toSafeResponse(row: {
    id: string;
    productId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      productId: row.productId,
      filename: row.filename,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt,
    };
  }
}
