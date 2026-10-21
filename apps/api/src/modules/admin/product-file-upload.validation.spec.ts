import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { PRODUCT_FILE_MAX_BYTES } from './product-file-upload.constants.js';
import { validateProductUploadFile } from './product-file-upload.validation.js';

describe('validateProductUploadFile', () => {
  it('accepts zip/pdf/txt/7z within size limits', () => {
    expect(
      validateProductUploadFile({
        originalname: 'pack.ZIP',
        mimetype: 'application/zip',
        size: 2048,
      }),
    ).toMatchObject({ extension: '.zip', mimeType: 'application/zip', sizeBytes: 2048 });
  });

  it('rejects image uploads as product files', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'cover.png',
        mimetype: 'image/png',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects oversize files', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'huge.pdf',
        mimetype: 'application/pdf',
        size: PRODUCT_FILE_MAX_BYTES + 1,
      }),
    ).toThrow(PayloadTooLargeException);
  });

  it('rejects empty files', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'empty.txt',
        mimetype: 'text/plain',
        size: 0,
      }),
    ).toThrow(BadRequestException);
  });
});
