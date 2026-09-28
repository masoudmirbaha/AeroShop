import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller.js';
import { DownloadsService } from './downloads.service.js';
import { LocalStorageProvider, StorageProvider } from './storage-provider.js';

@Module({
  controllers: [DownloadsController],
  providers: [
    DownloadsService,
    LocalStorageProvider,
    { provide: StorageProvider, useExisting: LocalStorageProvider },
  ],
})
export class DownloadsModule {}
