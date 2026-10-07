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
import { AdminProductFilesService } from './admin-product-files.service.js';
import { PRODUCT_FILE_MAX_BYTES } from './product-file-upload.constants.js';
import { validateProductUploadFile } from './product-file-upload.validation.js';

describe('product file upload validation', () => {
  it('rejects empty filename', () => {
    expect(() =>
      validateProductUploadFile({ originalname: '   ', mimetype: 'application/pdf', size: 10 }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid extension', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'payload.exe',
        mimetype: 'application/octet-stream',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects MIME that does not match the extension', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'doc.pdf',
        mimetype: 'application/zip',
        size: 10,
      }),
    ).toThrow(BadRequestException);
  });

  it('allows octet-stream only for allowlisted extensions', () => {
    expect(
      validateProductUploadFile({
        originalname: 'archive.7z',
        mimetype: 'application/octet-stream',
        size: 42,
      }).extension,
    ).toBe('.7z');
  });

  it('rejects oversized files', () => {
    expect(() =>
      validateProductUploadFile({
        originalname: 'big.zip',
        mimetype: 'application/zip',
        size: PRODUCT_FILE_MAX_BYTES + 1,
      }),
    ).toThrow(PayloadTooLargeException);
  });

  it('preserves Unicode/Persian basenames', () => {
    const result = validateProductUploadFile({
      originalname: 'مسیر/راهنما.pdf',
      mimetype: 'application/pdf',
      size: 12,
    });
    expect(result.filename).toBe('راهنما.pdf');
  });
});

describe('AdminProductFilesService upload', () => {
  let storageRoot: string;
  let tempDir: string;
  let storage: LocalStorageProvider;
  let prisma: {
    product: { findUnique: ReturnType<typeof vi.fn> };
    productFile: { create: ReturnType<typeof vi.fn> };
  };
  let service: AdminProductFilesService;

  beforeEach(async () => {
    storageRoot = await mkdtemp(path.join(tmpdir(), 'aeroshop-pf-storage-'));
    tempDir = await mkdtemp(path.join(tmpdir(), 'aeroshop-pf-temp-'));
    storage = new LocalStorageProvider(storageRoot);
    prisma = {
      product: { findUnique: vi.fn() },
      productFile: { create: vi.fn() },
    };
    service = new AdminProductFilesService(prisma as unknown as PrismaService, storage);
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
    await rm(tempDir, { recursive: true, force: true });
  });

  async function tempUpload(name: string, contents: string, mime = 'application/pdf') {
    const tempPath = path.join(tempDir, `upload-${name}`);
    await writeFile(tempPath, contents);
    return {
      path: tempPath,
      originalname: name,
      mimetype: mime,
      size: Buffer.byteLength(contents),
    };
  }

  it('returns 404 when the product is missing', async () => {
    prisma.product.findUnique.mockResolvedValueOnce(null);
    const file = await tempUpload('a.pdf', 'pdf');
    await expect(service.upload('missing', file)).rejects.toBeInstanceOf(NotFoundException);
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects a missing file body', async () => {
    await expect(service.upload('p1', undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid extension and cleans the temp file', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    const file = await tempUpload('virus.exe', 'x', 'application/octet-stream');
    await expect(service.upload('p1', file)).rejects.toBeInstanceOf(BadRequestException);
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects incompatible MIME and cleans the temp file', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    const file = await tempUpload('a.pdf', 'x', 'application/zip');
    await expect(service.upload('p1', file)).rejects.toBeInstanceOf(BadRequestException);
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('stores permanently, creates a DB row, cleans temp, and omits storageKey', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.productFile.create.mockImplementation(async ({ data }) => ({
      id: 'pf1',
      productId: data.productId,
      filename: data.filename,
      storageKey: data.storageKey,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }));

    const file = await tempUpload('راهنما.pdf', '%PDF-sample', 'application/pdf');
    const result = await service.upload('p1', file);

    expect(result).toEqual({
      id: 'pf1',
      productId: 'p1',
      filename: 'راهنما.pdf',
      mimeType: 'application/pdf',
      sizeBytes: Buffer.byteLength('%PDF-sample'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(result).not.toHaveProperty('storageKey');

    const created = prisma.productFile.create.mock.calls[0]![0].data;
    expect(created.storageKey).toMatch(/^products\/p1\/[0-9a-f-]+\.pdf$/i);
    expect(await readFile(path.join(storageRoot, created.storageKey), 'utf8')).toBe('%PDF-sample');
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rolls back the permanent object when DB create fails and cleans temp', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.productFile.create.mockRejectedValueOnce(new Error('db down'));
    const deleteSpy = vi.spyOn(storage, 'delete');

    const file = await tempUpload('a.zip', 'ZIPDATA', 'application/zip');
    await expect(service.upload('p1', file)).rejects.toThrow('db down');

    expect(deleteSpy).toHaveBeenCalledWith(expect.stringMatching(/^products\/p1\/.+\.zip$/));
    const rolledBackKey = deleteSpy.mock.calls[0]![0] as string;
    await expect(readFile(path.join(storageRoot, rolledBackKey))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(readFile(file.path)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});

describe('admin product file upload authorization', () => {
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

  it('rejects anonymous callers', () => {
    const reflector = {
      getAllAndOverride: vi.fn((key: string) => (key === ROLES_KEY ? ['ADMIN'] : undefined)),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
  });

  it('rejects non-admin callers', () => {
    const reflector = {
      getAllAndOverride: vi.fn((key: string) => (key === ROLES_KEY ? ['ADMIN'] : undefined)),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext({ sub: 'u1', role: 'USER' }))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects anonymous JWT access', () => {
    const reflector = {
      getAllAndOverride: vi.fn(() => false),
    };
    const jwt = { verify: vi.fn() };
    const guard = new JwtAuthGuard(jwt as never, reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
    expect(jwt.verify).not.toHaveBeenCalled();
  });
});
