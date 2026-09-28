import { createReadStream } from 'node:fs';
import path from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

export abstract class StorageProvider {
  abstract open(storageKey: string): ReturnType<typeof createReadStream>;
}

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private readonly root = path.resolve(process.cwd(), 'storage');

  open(storageKey: string) {
    const full = this.resolve(storageKey);
    return createReadStream(full);
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
