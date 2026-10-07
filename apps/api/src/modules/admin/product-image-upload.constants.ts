export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_FILENAME_CHARS = 180;

export const PRODUCT_IMAGE_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

export const PRODUCT_IMAGE_EXTENSION_MIME: Record<
  (typeof PRODUCT_IMAGE_ALLOWED_EXTENSIONS)[number],
  readonly string[]
> = {
  '.jpg': ['image/jpeg', 'application/octet-stream'],
  '.jpeg': ['image/jpeg', 'application/octet-stream'],
  '.png': ['image/png', 'application/octet-stream'],
  '.webp': ['image/webp', 'application/octet-stream'],
};

export const PRODUCT_IMAGE_UPLOAD_FIELD = 'file';
