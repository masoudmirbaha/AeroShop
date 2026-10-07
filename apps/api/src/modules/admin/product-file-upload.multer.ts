import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { PRODUCT_FILE_MAX_BYTES } from './product-file-upload.constants.js';

/** Temporary upload dir outside the permanent ProductFile storage tree. */
export function productFileUploadTempDir() {
  return path.join(tmpdir(), 'aeroshop-product-uploads');
}

export function productFileMulterOptions(): MulterOptions {
  const destination = productFileUploadTempDir();
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
      fileSize: PRODUCT_FILE_MAX_BYTES,
      files: 1,
    },
  };
}
