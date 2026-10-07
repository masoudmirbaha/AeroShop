import { toman } from '../../common/money.js';
import type { Category, Product, ProductImage, Topic } from '../../generated/prisma/client.js';
import { productImagePublicUrl } from './product-image.public.js';

export const productInclude = {
  category: true,
  topic: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

type CardProduct = Product & {
  category: Category | null;
  topic: Topic | null;
  images: ProductImage[];
};

export function toProductCard(product: CardProduct) {
  const primary = product.images[0];
  return {
    id: product.id,
    type: product.type,
    title: product.title,
    slug: product.slug,
    summary: product.summary,
    price: toman(product.price),
    comparePrice: toman(product.comparePrice),
    isDigital: product.isDigital,
    level: product.level,
    isFeatured: product.isFeatured,
    category: product.category && {
      name: product.category.name,
      slug: product.category.slug,
    },
    topic: product.topic && { name: product.topic.name, slug: product.topic.slug },
    image: primary ? productImagePublicUrl(primary.id) : null,
  };
}

export function toPublicProductImages(images: ProductImage[]) {
  return images.map((image) => ({
    url: productImagePublicUrl(image.id),
    alt: image.alt,
  }));
}
