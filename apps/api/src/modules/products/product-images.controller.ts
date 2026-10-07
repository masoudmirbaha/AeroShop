import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { Public } from '../../common/public.decorator.js';
import { ProductImagesService } from './product-images.service.js';

@Public()
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly images: ProductImagesService) {}

  @Get(':imageId')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async file(@Param('imageId') imageId: string) {
    const image = await this.images.open(imageId);
    return new StreamableFile(image.stream, {
      type: image.mimeType,
    });
  }
}
