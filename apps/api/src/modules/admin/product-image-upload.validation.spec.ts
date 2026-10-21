import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { PRODUCT_IMAGE_MAX_BYTES } from './product-image-upload.constants.js';
import { validateProductImageUpload } from './product-image-upload.validation.js';

describe('validateProductImageUpload', () => {
  it('accepts jpeg/png/webp within size limits', () => {
    expect(
      validateProductImageUpload({
        originalname: 'cover.PNG',
        mimetype: 'image/png',
        size: 1024,
      }),
    ).toMatchObject({ extension: '.png', mimeType: 'image/png', sizeBytes: 1024 });
  });

  it('rejects disallowed extensions', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'notes.pdf',
        mimetype: 'application/pdf',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects oversize images', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'big.jpg',
        mimetype: 'image/jpeg',
        size: PRODUCT_IMAGE_MAX_BYTES + 1,
      }),
    ).toThrow(PayloadTooLargeException);
  });

  it('rejects mime/extension mismatch', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'cover.png',
        mimetype: 'image/jpeg',
        size: 20,
      }),
    ).toThrow(BadRequestException);
  });
});
