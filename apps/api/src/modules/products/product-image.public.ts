import path from 'node:path';
import { BadRequestException } from '@nestjs/common';

export function productImagePublicUrl(imageId: string) {
  return `/api/v1/product-images/${imageId}`;
}

export function contentTypeFromImageStorageKey(storageKey: string) {
  const extension = path.extname(storageKey).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      throw new BadRequestException('نوع تصویر نامعتبر است');
  }
}
