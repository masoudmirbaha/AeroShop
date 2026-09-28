import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { CurrentUser } from '../../common/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { DownloadsService } from './downloads.service.js';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloads: DownloadsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.downloads.list(user.sub);
  }

  @Get(':grantId')
  async file(@CurrentUser() user: AuthUser, @Param('grantId') grantId: string) {
    const file = await this.downloads.open(user.sub, grantId);
    return new StreamableFile(file.stream, {
      type: file.mimeType,
      disposition: `attachment; filename="${encodeURIComponent(file.filename)}"`,
    });
  }
}
