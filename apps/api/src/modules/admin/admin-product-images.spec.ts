import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../../common/jwt-auth.guard.js';
import { RolesGuard } from '../../common/roles.guard.js';
import { ROLES_KEY } from '../../common/roles.decorator.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { LocalStorageProvider } from '../downloads/storage-provider.js';
import { productImagePublicUrl } from '../products/product-image.public.js';
import { toProductCard } from '../products/product.presenter.js';
import { ProductImagesService } from '../products/product-images.service.js';
import { AdminProductImagesService } from './admin-product-images.service.js';
import { PRODUCT_IMAGE_MAX_BYTES } from './product-image-upload.constants.js';
import { validateProductImageUpload } from './product-image-upload.validation.js';

describe('product image upload validation', () => {
  it('rejects invalid extension', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'x.exe',
        mimetype: 'application/octet-stream',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects SVG and GIF', () => {
    expect(() =>
      validateProductImageUpload({ originalname: 'a.svg', mimetype: 'image/svg+xml', size: 10 }),
    ).toThrow(BadRequestException);
    expect(() =>
      validateProductImageUpload({ originalname: 'a.gif', mimetype: 'image/gif', size: 10 }),
    ).toThrow(BadRequestException);
  });

  it('rejects incompatible MIME', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'a.png',
        mimetype: 'image/jpeg',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects oversized images', () => {
    expect(() =>
      validateProductImageUpload({
        originalname: 'a.jpg',
        mimetype: 'image/jpeg',
        size: PRODUCT_IMAGE_MAX_BYTES + 1,
      }),
    ).toThrow(PayloadTooLargeException);
  });

  it('accepts jpeg/png/webp including octet-stream', () => {
    expect(
      validateProductImageUpload({
        originalname: 'a.jpeg',
        mimetype: 'image/jpeg',
        size: 12,
      }).extension,
    ).toBe('.jpeg');
    expect(
      validateProductImageUpload({
        originalname: 'a.png',
        mimetype: 'image/png',
        size: 12,
      }).extension,
    ).toBe('.png');
    expect(
      validateProductImageUpload({
        originalname: 'a.webp',
        mimetype: 'application/octet-stream',
        size: 12,
      }).extension,
    ).toBe('.webp');
  });
});

describe('admin product image authorization', () => {
  function mockContext(user?: { sub: string; role: string }) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          headers: {},
          cookies: {},
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects anonymous and non-admin callers', () => {
    const reflector = {
      getAllAndOverride: vi.fn((key: string) => (key === ROLES_KEY ? ['ADMIN'] : undefined)),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(mockContext({ sub: 'u1', role: 'USER' }))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects anonymous JWT access', () => {
    const reflector = { getAllAndOverride: vi.fn(() => false) };
    const jwt = { verify: vi.fn() };
    const guard = new JwtAuthGuard(jwt as never, reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
  });
});

describe('AdminProductImagesService', () => {
  let storageRoot: string;
  let tempDir: string;
  let storage: LocalStorageProvider;
  let prisma: {
    product: { findUnique: ReturnType<typeof vi.fn> };
    productImage: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: AdminProductImagesService;

  beforeEach(async () => {
    storageRoot = await mkdtemp(path.join(tmpdir(), 'aeroshop-img-storage-'));
    tempDir = await mkdtemp(path.join(tmpdir(), 'aeroshop-img-temp-'));
    storage = new LocalStorageProvider(storageRoot);
    prisma = {
      product: { findUnique: vi.fn() },
      productImage: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    service = new AdminProductImagesService(prisma as unknown as PrismaService, storage);
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
    await rm(tempDir, { recursive: true, force: true });
  });

  async function tempUpload(name: string, contents: string, mime: string) {
    const tempPath = path.join(tempDir, `upload-${name}`);
    await writeFile(tempPath, contents);
    return {
      path: tempPath,
      originalname: name,
      mimetype: mime,
      size: Buffer.byteLength(contents),
    };
  }

  it('lists images with public urls only, ordered by sortOrder ASC', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.productImage.findMany.mockResolvedValueOnce([
      {
        id: 'i1',
        productId: 'p1',
        url: 'products/p1/images/secret-a.jpg',
        alt: null,
        sortOrder: 0,
      },
      {
        id: 'i2',
        productId: 'p1',
        url: 'products/p1/images/secret-b.png',
        alt: 'b',
        sortOrder: 1,
      },
    ]);

    const rows = await service.list('p1');
    expect(prisma.productImage.findMany).toHaveBeenCalledWith({
      where: { productId: 'p1' },
      orderBy: { sortOrder: 'asc' },
    });
    expect(rows).toEqual([
      { id: 'i1', productId: 'p1', url: productImagePublicUrl('i1'), alt: null, sortOrder: 0 },
      { id: 'i2', productId: 'p1', url: productImagePublicUrl('i2'), alt: 'b', sortOrder: 1 },
    ]);
    for (const row of rows) {
      expect(row.url).not.toContain('products/');
      expect(row).not.toHaveProperty('storageKey');
    }
  });

  it('returns 404 when listing images for a missing product', async () => {
    prisma.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.list('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    ['photo.jpg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ] as const)('uploads a valid %s and omits storage key from the response', async (name, mime) => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.productImage.aggregate.mockResolvedValueOnce({ _max: { sortOrder: 0 } });
    prisma.productImage.create.mockImplementation(async ({ data }) => ({
      id: 'img1',
      productId: data.productId,
      url: data.url,
      alt: data.alt,
      sortOrder: data.sortOrder,
    }));

    const file = await tempUpload(name, 'IMGDATA', mime);
    const result = await service.upload('p1', file);

    expect(result).toEqual({
      id: 'img1',
      productId: 'p1',
      url: productImagePublicUrl('img1'),
      alt: null,
      sortOrder: 1,
    });
    const created = prisma.productImage.create.mock.calls[0]![0].data;
    expect(created.url).toMatch(/^products\/p1\/images\/[0-9a-f-]+\.(jpg|jpeg|png|webp)$/i);
    expect(await readFile(path.join(storageRoot, created.url), 'utf8')).toBe('IMGDATA');
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects invalid extension and cleans temp', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    const file = await tempUpload('bad.exe', 'x', 'application/octet-stream');
    await expect(service.upload('p1', file)).rejects.toBeInstanceOf(BadRequestException);
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rolls back permanent storage when DB create fails', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.productImage.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } });
    prisma.productImage.create.mockRejectedValueOnce(new Error('db down'));
    const deleteSpy = vi.spyOn(storage, 'delete');

    const file = await tempUpload('a.jpg', 'JPG', 'image/jpeg');
    await expect(service.upload('p1', file)).rejects.toThrow('db down');
    expect(deleteSpy).toHaveBeenCalledWith(expect.stringMatching(/^products\/p1\/images\/.+\.jpg$/));
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('deletes DB row then storage key and returns ok', async () => {
    prisma.productImage.findFirst.mockResolvedValueOnce({
      id: 'img1',
      url: 'products/p1/images/a.jpg',
    });
    prisma.productImage.delete.mockResolvedValueOnce({ id: 'img1' });
    const deleteSpy = vi.spyOn(storage, 'delete').mockResolvedValueOnce(undefined);

    await expect(service.remove('p1', 'img1')).resolves.toEqual({ ok: true });
    expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 'img1' } });
    expect(deleteSpy).toHaveBeenCalledWith('products/p1/images/a.jpg');
    expect(deleteSpy.mock.invocationCallOrder[0]!).toBeGreaterThan(
      prisma.productImage.delete.mock.invocationCallOrder[0]!,
    );
  });

  it('returns 404 for cross-product delete without touching storage', async () => {
    prisma.productImage.findFirst.mockResolvedValueOnce(null);
    const deleteSpy = vi.spyOn(storage, 'delete');
    await expect(service.remove('other', 'img1')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.productImage.delete).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('does not call storage.delete when DB delete fails', async () => {
    prisma.productImage.findFirst.mockResolvedValueOnce({
      id: 'img1',
      url: 'products/p1/images/a.jpg',
    });
    prisma.productImage.delete.mockRejectedValueOnce(new Error('db delete failed'));
    const deleteSpy = vi.spyOn(storage, 'delete');
    await expect(service.remove('p1', 'img1')).rejects.toThrow('db delete failed');
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('still returns success when storage.delete fails after DB deletion', async () => {
    prisma.productImage.findFirst.mockResolvedValueOnce({
      id: 'img1',
      url: 'products/p1/images/a.jpg',
    });
    prisma.productImage.delete.mockResolvedValueOnce({ id: 'img1' });
    vi.spyOn(storage, 'delete').mockRejectedValueOnce(new Error('disk busy'));
    await expect(service.remove('p1', 'img1')).resolves.toEqual({ ok: true });
  });

  it('reorders images in a transaction and returns the new list', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.productImage.findMany
      .mockResolvedValueOnce([{ id: 'i1' }, { id: 'i2' }])
      .mockResolvedValueOnce([
        { id: 'i2', productId: 'p1', url: 'products/p1/images/b.jpg', alt: null, sortOrder: 0 },
        { id: 'i1', productId: 'p1', url: 'products/p1/images/a.jpg', alt: null, sortOrder: 1 },
      ]);
    prisma.productImage.update.mockResolvedValue({});

    const result = await service.reorder('p1', [
      { id: 'i2', sortOrder: 0 },
      { id: 'i1', sortOrder: 1 },
    ]);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result[0]?.id).toBe('i2');
    expect(result[0]?.url).toBe(productImagePublicUrl('i2'));
  });

  it('rejects unknown, cross-product, duplicate ids/orders, and incomplete lists', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.productImage.findMany.mockResolvedValue([{ id: 'i1' }, { id: 'i2' }]);

    await expect(service.reorder('p1', [{ id: 'i1', sortOrder: 0 }])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.reorder('p1', [
        { id: 'i1', sortOrder: 0 },
        { id: 'missing', sortOrder: 1 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.reorder('p1', [
        { id: 'i1', sortOrder: 0 },
        { id: 'i1', sortOrder: 1 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.reorder('p1', [
        { id: 'i1', sortOrder: 0 },
        { id: 'i2', sortOrder: 0 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.reorder('p1', [
        { id: 'i1', sortOrder: 0 },
        { id: 'i2', sortOrder: 2 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('public product image presentation and streaming', () => {
  it('toProductCard exposes public image urls and null fallback', () => {
    const withImage = toProductCard({
      id: 'p1',
      type: 'SINGLE_PRODUCT',
      title: 't',
      slug: 's',
      summary: 'sum',
      description: 'd',
      price: 1 as never,
      comparePrice: null,
      isDigital: true,
      level: null,
      isPublished: true,
      isFeatured: false,
      sortOrder: 0,
      categoryId: null,
      topicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
      topic: null,
      images: [
        {
          id: 'img1',
          productId: 'p1',
          url: 'products/p1/images/secret.jpg',
          alt: null,
          sortOrder: 0,
        },
      ],
    } as never);
    expect(withImage.image).toBe(productImagePublicUrl('img1'));
    expect(withImage.image).not.toContain('products/');

    const without = toProductCard({
      id: 'p2',
      type: 'SINGLE_PRODUCT',
      title: 't2',
      slug: 's2',
      summary: 'sum',
      description: 'd',
      price: 1 as never,
      comparePrice: null,
      isDigital: true,
      level: null,
      isPublished: true,
      isFeatured: false,
      sortOrder: 0,
      categoryId: null,
      topicId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
      topic: null,
      images: [],
    } as never);
    expect(without.image).toBeNull();
  });

  it('streams an existing image and 404s when missing', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'aeroshop-img-public-'));
    const storage = new LocalStorageProvider(root);
    const key = 'products/p1/images/a.jpg';
    await storage.put(key, Buffer.from('JPEGDATA'));
    const prisma = {
      productImage: {
        findUnique: vi.fn().mockResolvedValueOnce({ id: 'img1', url: key }).mockResolvedValueOnce(null),
      },
    };
    const service = new ProductImagesService(prisma as unknown as PrismaService, storage);

    const opened = await service.open('img1');
    expect(opened.mimeType).toBe('image/jpeg');
    const chunks: Buffer[] = [];
    for await (const chunk of opened.stream) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString('utf8')).toBe('JPEGDATA');

    await expect(service.open('missing')).rejects.toBeInstanceOf(NotFoundException);
    await rm(root, { recursive: true, force: true });
  });
});
