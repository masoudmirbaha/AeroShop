import path from 'node:path';
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import {
  PRODUCT_FILE_ALLOWED_EXTENSIONS,
  PRODUCT_FILE_EXTENSION_MIME,
  PRODUCT_FILE_MAX_BYTES,
  PRODUCT_FILE_MAX_FILENAME_CHARS,
} from './product-file-upload.constants.js';

export type ValidatedProductUpload = {
  filename: string;
  extension: (typeof PRODUCT_FILE_ALLOWED_EXTENSIONS)[number];
  mimeType: string;
  sizeBytes: number;
};

function charLength(value: string) {
  let count = 0;
  for (const _char of value) count += 1;
  return count;
}

export function sanitizeProductUploadFilename(originalName: string): string {
  const normalized = originalName.replaceAll('\\', '/');
  const base = path.basename(normalized).trim();
  if (!base || base === '.' || base === '..') {
    throw new BadRequestException('نام فایل نامعتبر است');
  }
  if (charLength(base) > PRODUCT_FILE_MAX_FILENAME_CHARS) {
    throw new BadRequestException('نام فایل بیش از حد طولانی است');
  }
  return base;
}

export function validateProductUploadFile(input: {
  originalname: string;
  mimetype: string;
  size: number;
}): ValidatedProductUpload {
  if (!Number.isFinite(input.size) || input.size < 0) {
    throw new BadRequestException('اندازه فایل نامعتبر است');
  }
  if (input.size > PRODUCT_FILE_MAX_BYTES) {
    throw new PayloadTooLargeException('حجم فایل بیش از حد مجاز است');
  }
  if (input.size === 0) {
    throw new BadRequestException('فایل خالی است');
  }

  const filename = sanitizeProductUploadFilename(input.originalname);
  const extension = path.extname(filename).toLowerCase() as (typeof PRODUCT_FILE_ALLOWED_EXTENSIONS)[number];
  if (!PRODUCT_FILE_ALLOWED_EXTENSIONS.includes(extension)) {
    throw new BadRequestException('پسوند فایل مجاز نیست');
  }

  const mimeType = (input.mimetype || '').trim().toLowerCase();
  if (!mimeType) {
    throw new BadRequestException('نوع فایل نامعتبر است');
  }

  const allowedForExtension = PRODUCT_FILE_EXTENSION_MIME[extension];
  if (!allowedForExtension.includes(mimeType)) {
    throw new BadRequestException('نوع فایل با پسوند آن سازگار نیست');
  }

  return { filename, extension, mimeType, sizeBytes: input.size };
}
