import { Injectable, NotFoundException } from '@nestjs/common';
import { access } from 'node:fs/promises';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LocalStorageProvider } from '../downloads/storage-provider.js';
import { contentTypeFromImageStorageKey } from './product-image.public.js';

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageProvider,
  ) {}

  async open(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, url: true },
    });
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const fullPath = this.storage.resolve(image.url);
    try {
      await access(fullPath);
    } catch {
      throw new NotFoundException('تصویر یافت نشد');
    }

    return {
      mimeType: contentTypeFromImageStorageKey(image.url),
      stream: this.storage.open(image.url),
    };
  }
}
