import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LocalStorageProvider } from './storage-provider.js';

@Injectable()
export class DownloadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageProvider,
  ) {}

  async list(userId: string) {
    const grants = await this.prisma.downloadGrant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { productFile: { include: { product: true } } },
    });
    return grants.map((grant) => ({
      id: grant.id,
      filename: grant.productFile.filename,
      productTitle: grant.productFile.product.title,
      expiresAt: grant.expiresAt,
      createdAt: grant.createdAt,
    }));
  }

  async open(userId: string, grantId: string) {
    const grant = await this.prisma.downloadGrant.findUnique({
      where: { id: grantId },
      include: { productFile: true },
    });
    if (!grant || grant.userId !== userId) {
      throw new NotFoundException('مجوز دانلود یافت نشد');
    }
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      throw new ForbiddenException('مهلت دانلود این فایل تمام شده است');
    }
    const fullPath = this.storage.resolve(grant.productFile.storageKey);
    try {
      await access(fullPath);
    } catch {
      throw new NotFoundException('فایل یافت نشد');
    }
    return {
      filename: grant.productFile.filename,
      mimeType: grant.productFile.mimeType,
      stream: createReadStream(fullPath),
    };
  }
}
