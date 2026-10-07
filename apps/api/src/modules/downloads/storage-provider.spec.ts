import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageProvider } from './storage-provider.js';

describe('LocalStorageProvider', () => {
  let root: string;
  let storage: LocalStorageProvider;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'aeroshop-storage-'));
    storage = new LocalStorageProvider(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('rejects traversal in storage keys', () => {
    expect(() => storage.resolve('../outside.txt')).toThrow(BadRequestException);
    expect(() => storage.resolve('products/../../outside.txt')).toThrow(BadRequestException);
  });

  it('rejects absolute storage keys', () => {
    expect(() => storage.resolve(path.resolve(root, 'abs.txt'))).toThrow(BadRequestException);
    if (process.platform === 'win32') {
      expect(() => storage.resolve('C:\\Windows\\system32\\drivers')).toThrow(BadRequestException);
    } else {
      expect(() => storage.resolve('/etc/passwd')).toThrow(BadRequestException);
    }
  });

  it('put writes only inside the storage root', async () => {
    const key = 'products/p1/file.zip';
    await storage.put(key, Buffer.from('hello-zip'));
    const full = storage.resolve(key);
    expect(full.startsWith(root + path.sep)).toBe(true);
    expect(await readFile(full, 'utf8')).toBe('hello-zip');
  });

  it('refuses to overwrite an existing object', async () => {
    const key = 'products/p1/same.zip';
    await storage.put(key, Buffer.from('one'));
    await expect(storage.put(key, Buffer.from('two'))).rejects.toBeInstanceOf(ConflictException);
    expect(await readFile(storage.resolve(key), 'utf8')).toBe('one');
  });

  it('delete removes a stored object and is safe when missing', async () => {
    const key = 'products/p1/gone.zip';
    await storage.put(key, Buffer.from('bye'));
    await storage.delete(key);
    await expect(access(storage.resolve(key))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(storage.delete(key)).resolves.toBeUndefined();
  });

  it('creates nested parent directories under the root', async () => {
    const key = 'products/deep/nested/file.pdf';
    await storage.put(key, Buffer.from('%PDF'));
    expect(await readFile(path.join(root, key))).toEqual(Buffer.from('%PDF'));
  });
});
