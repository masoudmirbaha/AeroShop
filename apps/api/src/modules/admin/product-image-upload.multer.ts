import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { PRODUCT_IMAGE_MAX_BYTES } from './product-image-upload.constants.js';

/** Temporary upload dir outside the permanent product-image storage tree. */
export function productImageUploadTempDir() {
  return path.join(tmpdir(), 'aeroshop-product-image-uploads');
}

export function productImageMulterOptions(): MulterOptions {
  const destination = productImageUploadTempDir();
  mkdirSync(destination, { recursive: true });

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, destination);
      },
      filename: (_req, _file, cb) => {
        cb(null, `upload-${randomUUID()}`);
      },
    }),
    limits: {
      fileSize: PRODUCT_IMAGE_MAX_BYTES,
      files: 1,
    },
  };
}
