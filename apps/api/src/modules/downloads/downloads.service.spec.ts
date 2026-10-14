import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { DownloadsService } from './downloads.service.js';
import type { LocalStorageProvider } from './storage-provider.js';

describe('DownloadsService.open', () => {
  const prisma = { downloadGrant: { findUnique: vi.fn() } };
  const storage = { resolve: vi.fn() };
  const downloads = new DownloadsService(
    prisma as unknown as PrismaService,
    storage as unknown as LocalStorageProvider,
  );

  const grant = (overrides: Record<string, unknown> = {}) => ({
    id: 'grant-1',
    userId: 'user-1',
    expiresAt: null,
    productFile: { storageKey: 'products/p1/file.zip', filename: 'file.zip', mimeType: 'application/zip' },
    ...overrides,
  });

  beforeEach(() => vi.resetAllMocks());

  it('returns 404 when no grant exists', async () => {
    prisma.downloadGrant.findUnique.mockResolvedValue(null);

    await expect(downloads.open('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.resolve).not.toHaveBeenCalled();
  });

  it("returns 404 for another user's grant", async () => {
    prisma.downloadGrant.findUnique.mockResolvedValue(grant({ userId: 'someone-else' }));

    await expect(downloads.open('user-1', 'grant-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.resolve).not.toHaveBeenCalled();
  });

  it('returns 403 for an expired grant', async () => {
    prisma.downloadGrant.findUnique.mockResolvedValue(
      grant({ expiresAt: new Date(Date.now() - 60_000) }),
    );

    await expect(downloads.open('user-1', 'grant-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.resolve).not.toHaveBeenCalled();
  });
});
