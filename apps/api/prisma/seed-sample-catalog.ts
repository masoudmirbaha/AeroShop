/**
 * One-shot sample catalog for local/demo DBs.
 * DO NOT run against Production without an explicit separate approval.
 *
 * Usage (from repo root, with DATABASE_URL pointing at a non-prod DB):
 *   pnpm --filter @aeroshop/api db:seed:samples
 *
 * Creates published sample products with procedurally generated PNG covers
 * (solid color gradients — no third-party photos, no fake Persian text glyphs)
 * and short placeholder .txt attachments (not real paid courseware).
 *
 * Image source: generated locally by prisma/sample-png.ts (no external assets).
 */
import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { solidGradientPng } from './sample-png.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const samples = [
  {
    slug: 'sample-ansys-fluent-basics',
    type: 'SINGLE_PRODUCT' as const,
    title: 'آموزش مقدماتی ANSYS Fluent',
    summary: 'شروع کار با هندسه، مش و حل جریان پایا در Fluent — محتوای نمونه نمایشی.',
    description:
      'این محصول نمونه برای نمایش کاتالوگ و پنل مدیریت است و فایل آموزشی کامل تجاری محسوب نمی‌شود. هدف، نشان‌دادن عنوان فارسی، تصویر کاور و فایل پیوست نمونه در مسیر خرید/دانلود است.',
    price: 990000,
    comparePrice: 1200000,
    level: 'BEGINNER' as const,
    categorySlug: 'learning-products',
    topicSlug: 'heat-transfer',
    colors: [
      [12, 74, 110],
      [8, 145, 178],
    ] as const,
    fileName: 'sample-fluent-basics-readme.txt',
  },
  {
    slug: 'sample-ansys-meshing',
    type: 'SINGLE_PRODUCT' as const,
    title: 'آموزش مش‌بندی در ANSYS Meshing',
    summary: 'کیفیت مش، اندازه المان و آماده‌سازی برای حلگر — نمونه نمایشی.',
    description:
      'محصول نمونه برای نمایش فهرست و جزئیات محصول با تصویر. محتوای دانلودی فقط یک فایل متنی راهنما است و مش یا پروژه واقعی همراه ندارد.',
    price: 850000,
    comparePrice: null,
    level: 'INTERMEDIATE' as const,
    categorySlug: 'learning-products',
    topicSlug: 'dynamic-mesh',
    colors: [
      [30, 64, 175],
      [67, 56, 202],
    ] as const,
    fileName: 'sample-meshing-readme.txt',
  },
  {
    slug: 'sample-ansys-mechanical',
    type: 'SINGLE_PRODUCT' as const,
    title: 'آموزش تحلیل سازه با ANSYS Mechanical',
    summary: 'تنش استاتیکی و شرایط مرزی پایه — محصول نمونه کاتالوگ.',
    description:
      'برای پر کردن ویترین سایت با عنوان و تصویر مرتبط. فایل پیوست آموزشی تجاری نیست؛ فقط متن راهنمای نمونه است.',
    price: 1100000,
    comparePrice: 1350000,
    level: 'INTERMEDIATE' as const,
    categorySlug: 'learning-products',
    topicSlug: 'fsi',
    colors: [
      [15, 118, 110],
      [5, 150, 105],
    ] as const,
    fileName: 'sample-mechanical-readme.txt',
  },
  {
    slug: 'sample-advanced-cfd-course',
    type: 'COURSE' as const,
    title: 'آموزش پیشرفته CFD',
    summary: 'مسیر نمونه دوره با سرفصل کوتاه برای نمایش پنل دوره‌ها.',
    description:
      'دوره نمونه برای آزمایش سرفصل، تصویر کاور و فهرست دوره‌ها. محتوای ویدئویی واقعی پیوست نشده است.',
    price: 2800000,
    comparePrice: 3200000,
    level: 'ADVANCED' as const,
    categorySlug: 'courses',
    topicSlug: 'combustion',
    colors: [
      [127, 29, 29],
      [185, 28, 28],
    ] as const,
    fileName: 'sample-advanced-cfd-readme.txt',
    sections: [
      {
        id: 'seed-sample-cfd-s1',
        title: 'آماده‌سازی مدل',
        lessons: [{ id: 'seed-sample-cfd-l1', title: 'فرض‌ها و شبکه', durationMinutes: 20 }],
      },
      {
        id: 'seed-sample-cfd-s2',
        title: 'حل و پس‌پردازش',
        lessons: [{ id: 'seed-sample-cfd-l2', title: 'پایداری و گزارش نتایج', durationMinutes: 28 }],
      },
    ],
  },
] as const;

async function ensureTaxonomy() {
  const topics = [
    ['انتقال حرارت', 'heat-transfer', 'جابه‌جایی، هدایت و تشعشع.'],
    ['مش دینامیک', 'dynamic-mesh', 'حرکت مرز و تغییر شبکه.'],
    ['اندرکنش سیال و سازه', 'fsi', 'اثر متقابل جریان و سازه.'],
    ['احتراق', 'combustion', 'مدل‌سازی شعله و گونه‌ها.'],
  ] as const;
  const categories = [
    ['محصولات آموزشی', 'learning-products', 'آموزش‌های تک‌موضوعی.'],
    ['دوره‌ها', 'courses', 'سرفصل و درس.'],
  ] as const;

  for (const [name, slug, description] of topics) {
    await prisma.topic.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
  }
  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SAMPLE_SEED !== '1') {
    throw new Error(
      'Refusing sample catalog seed in production. Set ALLOW_SAMPLE_SEED=1 only with explicit approval.',
    );
  }

  const storageRoot = path.resolve(process.cwd(), 'storage');
  await ensureTaxonomy();

  const topicBySlug = Object.fromEntries(
    (await prisma.topic.findMany()).map((row) => [row.slug, row.id]),
  );
  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((row) => [row.slug, row.id]),
  );

  for (const [index, sample] of samples.entries()) {
    const categoryId = categoryBySlug[sample.categorySlug];
    const topicId = topicBySlug[sample.topicSlug];
    if (!categoryId || !topicId) {
      throw new Error(`Missing taxonomy for ${sample.slug}`);
    }

    const product = await prisma.product.upsert({
      where: { slug: sample.slug },
      update: {
        type: sample.type,
        title: sample.title,
        summary: sample.summary,
        description: sample.description,
        price: sample.price,
        comparePrice: sample.comparePrice,
        level: sample.level,
        categoryId,
        topicId,
        isPublished: true,
        isFeatured: index < 2,
        isDigital: true,
        sortOrder: 100 + index,
      },
      create: {
        type: sample.type,
        slug: sample.slug,
        title: sample.title,
        summary: sample.summary,
        description: sample.description,
        price: sample.price,
        comparePrice: sample.comparePrice,
        level: sample.level,
        categoryId,
        topicId,
        isPublished: true,
        isFeatured: index < 2,
        isDigital: true,
        sortOrder: 100 + index,
      },
    });

    const imageKey = `products/${product.id}/images/sample-cover.png`;
    const imageDir = path.join(storageRoot, path.dirname(imageKey));
    await mkdir(imageDir, { recursive: true });
    const png = solidGradientPng(960, 540, sample.colors[0], sample.colors[1]);
    await writeFile(path.join(storageRoot, imageKey), png);

    const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
    if (existingImages.length === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageKey,
          alt: `کاور نمونه برای ${sample.title}`,
          sortOrder: 0,
        },
      });
    } else {
      await prisma.productImage.update({
        where: { id: existingImages[0]!.id },
        data: { url: imageKey, alt: `کاور نمونه برای ${sample.title}`, sortOrder: 0 },
      });
    }

    const fileKey = `products/${product.id}/sample-readme.txt`;
    const fileBody =
      `فایل نمونه NtoPiran برای «${sample.title}».\n` +
      `این پیوست محتوای آموزشی کامل یا دوره پولی واقعی نیست؛ فقط برای آزمایش آپلود/دانلود است.\n`;
    await mkdir(path.join(storageRoot, path.dirname(fileKey)), { recursive: true });
    await writeFile(path.join(storageRoot, fileKey), fileBody, 'utf8');

    await prisma.productFile.upsert({
      where: { storageKey: fileKey },
      update: {
        productId: product.id,
        filename: sample.fileName,
        mimeType: 'text/plain',
        sizeBytes: Buffer.byteLength(fileBody, 'utf8'),
      },
      create: {
        productId: product.id,
        filename: sample.fileName,
        storageKey: fileKey,
        mimeType: 'text/plain',
        sizeBytes: Buffer.byteLength(fileBody, 'utf8'),
      },
    });

    if ('sections' in sample && sample.sections) {
      for (const [sIndex, section] of sample.sections.entries()) {
        await prisma.courseSection.upsert({
          where: { id: section.id },
          update: { title: section.title, productId: product.id, sortOrder: sIndex },
          create: {
            id: section.id,
            title: section.title,
            productId: product.id,
            sortOrder: sIndex,
          },
        });
        for (const [lIndex, lesson] of section.lessons.entries()) {
          await prisma.lesson.upsert({
            where: { id: lesson.id },
            update: {
              title: lesson.title,
              sectionId: section.id,
              sortOrder: lIndex,
              durationMinutes: lesson.durationMinutes,
            },
            create: {
              id: lesson.id,
              title: lesson.title,
              sectionId: section.id,
              sortOrder: lIndex,
              durationMinutes: lesson.durationMinutes,
            },
          });
        }
      }
    }

    console.log(`sample ok: ${sample.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
