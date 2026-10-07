export const PRODUCT_FILE_MAX_BYTES = 100 * 1024 * 1024;
export const PRODUCT_FILE_MAX_FILENAME_CHARS = 180;

export const PRODUCT_FILE_ALLOWED_EXTENSIONS = ['.zip', '.pdf', '.txt', '.7z'] as const;

export const PRODUCT_FILE_ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'text/plain',
  'application/x-7z-compressed',
  'application/octet-stream',
] as const;

/** MIME types that are always valid for a given extension (octet-stream handled separately). */
export const PRODUCT_FILE_EXTENSION_MIME: Record<
  (typeof PRODUCT_FILE_ALLOWED_EXTENSIONS)[number],
  readonly string[]
> = {
  '.zip': ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
  '.pdf': ['application/pdf', 'application/octet-stream'],
  '.txt': ['text/plain', 'application/octet-stream'],
  '.7z': ['application/x-7z-compressed', 'application/octet-stream'],
};

export const PRODUCT_FILE_UPLOAD_FIELD = 'file';
