import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { Readable } from 'node:stream';

export const STORAGE_ROOT = 'STORAGE_ROOT';

export abstract class StorageProvider {
  abstract open(storageKey: string): ReturnType<typeof createReadStream>;
  abstract put(storageKey: string, source: Readable | Buffer): Promise<void>;
  abstract delete(storageKey: string): Promise<void>;
}

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private readonly root: string;

  constructor(@Optional() @Inject(STORAGE_ROOT) root?: string) {
    super();
    this.root = path.resolve(root ?? path.join(process.cwd(), 'storage'));
  }

  /** Resolved storage root (never expose to API clients). */
  getRoot() {
    return this.root;
  }

  open(storageKey: string) {
    const full = this.resolve(storageKey);
    return createReadStream(full);
  }

  async put(storageKey: string, source: Readable | Buffer) {
    const full = this.resolve(storageKey);
    await mkdir(path.dirname(full), { recursive: true });
    try {
      await access(full);
      throw new ConflictException('فایل ذخیره‌شده از قبل وجود دارد');
    } catch (reason) {
      if (reason instanceof ConflictException) throw reason;
    }
    if (Buffer.isBuffer(source)) {
      await writeFile(full, source, { flag: 'wx' });
      return;
    }
    await pipeline(source, createWriteStream(full, { flags: 'wx' }));
  }

  async delete(storageKey: string) {
    try {
      await unlink(this.resolve(storageKey));
    } catch {
      // Best-effort cleanup for failed uploads / rollbacks.
    }
  }

  resolve(storageKey: string) {
    if (!storageKey || storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('مسیر فایل نامعتبر است');
    }
    const full = path.resolve(this.root, storageKey);
    if (!full.startsWith(this.root + path.sep) && full !== this.root) {
      throw new BadRequestException('مسیر فایل نامعتبر است');
    }
    return full;
  }
}

export function assertFileExists(stream: ReturnType<typeof createReadStream>) {
  stream.on('error', () => {
    stream.destroy();
  });
  return stream;
}

export class MissingFileException extends NotFoundException {
  constructor() {
    super('فایل یافت نشد');
  }
}
