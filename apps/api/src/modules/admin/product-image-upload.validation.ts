import path from 'node:path';
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import {
  PRODUCT_IMAGE_ALLOWED_EXTENSIONS,
  PRODUCT_IMAGE_EXTENSION_MIME,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MAX_FILENAME_CHARS,
} from './product-image-upload.constants.js';

export type ValidatedProductImageUpload = {
  filename: string;
  extension: (typeof PRODUCT_IMAGE_ALLOWED_EXTENSIONS)[number];
  mimeType: string;
  sizeBytes: number;
};

function charLength(value: string) {
  let count = 0;
  for (const _char of value) count += 1;
  return count;
}

export function sanitizeProductImageFilename(originalName: string): string {
  const normalized = originalName.replaceAll('\\', '/');
  const base = path.basename(normalized).trim();
  if (!base || base === '.' || base === '..') {
    throw new BadRequestException('نام فایل نامعتبر است');
  }
  if (charLength(base) > PRODUCT_IMAGE_MAX_FILENAME_CHARS) {
    throw new BadRequestException('نام فایل بیش از حد طولانی است');
  }
  return base;
}

export function validateProductImageUpload(input: {
  originalname: string;
  mimetype: string;
  size: number;
}): ValidatedProductImageUpload {
  if (!Number.isFinite(input.size) || input.size < 0) {
    throw new BadRequestException('اندازه فایل نامعتبر است');
  }
  if (input.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new PayloadTooLargeException('حجم فایل بیش از حد مجاز است');
  }
  if (input.size === 0) {
    throw new BadRequestException('فایل خالی است');
  }

  const filename = sanitizeProductImageFilename(input.originalname);
  const extension = path.extname(filename).toLowerCase() as (typeof PRODUCT_IMAGE_ALLOWED_EXTENSIONS)[number];
  if (!PRODUCT_IMAGE_ALLOWED_EXTENSIONS.includes(extension)) {
    throw new BadRequestException('پسوند فایل مجاز نیست');
  }

  const mimeType = (input.mimetype || '').trim().toLowerCase();
  if (!mimeType) {
    throw new BadRequestException('نوع فایل نامعتبر است');
  }

  const allowedForExtension = PRODUCT_IMAGE_EXTENSION_MIME[extension];
  if (!allowedForExtension.includes(mimeType)) {
    throw new BadRequestException('نوع فایل با پسوند آن سازگار نیست');
  }

  return { filename, extension, mimeType, sizeBytes: input.size };
}
