import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const topics = [
  ['انتقال حرارت', 'heat-transfer', 'جابه‌جایی، هدایت و تشعشع در شبیه‌سازی جریان.'],
  ['احتراق', 'combustion', 'مدل‌سازی شعله، مخلوط سوخت و گونه‌های شیمیایی.'],
  ['فاز گسسته', 'dpm', 'ردیابی ذرات و اسپری با مدل Discrete Phase.'],
  ['مش دینامیک', 'dynamic-mesh', 'حرکت مرز، مش لغزان و تغییر شکل شبکه.'],
  ['جریان چندفازی', 'multiphase', 'سطح آزاد، مخلوط و جریان‌های چندفازی.'],
  ['اندرکنش سیال و سازه', 'fsi', 'اثر متقابل جریان و تغییر شکل سازه.'],
  ['آکوستیک', 'acoustics', 'نویز جریان و انتشار صوت در شبیه‌سازی.'],
] as const;

const categories = [
  ['محصولات آموزشی', 'learning-products', 'آموزش‌های تک‌موضوعی با فایل و ویدئو.'],
  ['بسته‌های آموزشی', 'training-packages', 'چند مثال مرتبط در یک بسته.'],
  ['دوره‌ها', 'courses', 'سرفصل، درس و پروژه‌ی پایانی.'],
  ['محصولات رایگان', 'free-products', 'نمونه‌های رایگان برای آشنایی با کیفیت محتوا.'],
] as const;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user');
  }

  const topicRows: { id: string; slug: string }[] = [];
  for (const [name, slug, description] of topics) {
    topicRows.push(
      await prisma.topic.upsert({
        where: { slug },
        update: { name, description },
        create: { name, slug, description },
      }),
    );
  }
  const categoryRows: { id: string; slug: string }[] = [];
  for (const [name, slug, description] of categories) {
    categoryRows.push(
      await prisma.category.upsert({
        where: { slug },
        update: { name, description },
        create: { name, slug, description },
      }),
    );
  }
  const topic = (slug: string) => topicRows.find((row) => row.slug === slug)!;
  const category = (slug: string) => categoryRows.find((row) => row.slug === slug)!;

  const storageKey = 'samples/heat-transfer-notes.txt';
  const storageDir = path.resolve(process.cwd(), 'storage/samples');
  await mkdir(storageDir, { recursive: true });
  await writeFile(
    path.join(storageDir, 'heat-transfer-notes.txt'),
    'نمونه فایل AeroShop برای آزمایش دانلود. این فایل محتوای آموزشی واقعی نیست.\n',
    'utf8',
  );

  const products = [
    {
      slug: 'fluent-heat-transfer-fundamentals',
      type: 'SINGLE_PRODUCT' as const,
      title: 'مبانی انتقال حرارت در انسیس فلوئنت',
      summary: 'هدایت، جابه‌جایی و شرایط مرزی حرارتی در یک مثال صنعتی.',
      description:
        'در این آموزش یک مسئله‌ی انتقال حرارت از تعریف هندسه تا خواندن نتایج دما و شار حرارتی پیش می‌رود. مناسب مهندسانی است که می‌خواهند تنظیمات انرژی و مواد را بدون حدس زدن انجام دهند.',
      price: 890000,
      comparePrice: 1100000,
      level: 'BEGINNER' as const,
      isFeatured: true,
      categoryId: category('learning-products').id,
      topicId: topic('heat-transfer').id,
      file: true,
    },
    {
      slug: 'combustion-simulation-fluent',
      type: 'COURSE' as const,
      title: 'شبیه‌سازی احتراق با انسیس فلوئنت',
      summary: 'از مخلوط سوخت تا مدل شعله و بررسی گونه‌ها.',
      description:
        'دوره احتراق را در چند درس کوتاه جمع می‌کند: انتخاب مدل، شرایط ورودی، پایداری حل و تفسیر کانتور دما. در پایان یک پروژه‌ی جمع‌بندی دارید.',
      price: 2400000,
      comparePrice: 2900000,
      level: 'INTERMEDIATE' as const,
      isFeatured: true,
      categoryId: category('courses').id,
      topicId: topic('combustion').id,
    },
    {
      slug: 'dpm-practical-guide',
      type: 'SINGLE_PRODUCT' as const,
      title: 'راهنمای عملی مدل فاز گسسته',
      summary: 'تزریق ذره، نیروی درگ و برخورد با دیوار.',
      description:
        'این راهنما روی تنظیم Injection، انتخاب قانون درگ و خواندن مسیر ذرات تمرکز دارد تا شبیه‌سازی اسپری را قابل تکرار کنید.',
      price: 760000,
      comparePrice: null,
      level: 'INTERMEDIATE' as const,
      isFeatured: false,
      categoryId: category('learning-products').id,
      topicId: topic('dpm').id,
    },
    {
      slug: 'dynamic-mesh-engineering-course',
      type: 'COURSE' as const,
      title: 'دوره مهندسی مش دینامیک',
      summary: 'مرز متحرک، smoothing و remeshing در مثال‌های کاربردی.',
      description:
        'دوره برای کسی است که مش ثابت را بلد است و حالا باید قطعه‌ی متحرک را بدون خراب شدن شبکه حل کند. هر درس یک تنظیم مشخص را جدا می‌کند.',
      price: 2100000,
      comparePrice: 2500000,
      level: 'ADVANCED' as const,
      isFeatured: true,
      categoryId: category('courses').id,
      topicId: topic('dynamic-mesh').id,
    },
    {
      slug: 'multiphase-flow-simulation',
      type: 'BUNDLE' as const,
      title: 'بسته‌ی شبیه‌سازی جریان چندفازی',
      summary: 'چند مثال سطح آزاد و مخلوط، با قیمت کمتر از خرید جداگانه.',
      description:
        'بسته چند مثال چندفازی را کنار هم می‌گذارد تا تفاوت VOF و Mixture را روی مسئله‌های نزدیک به هم ببینید، نه فقط در اسلاید.',
      price: 1450000,
      comparePrice: 1980000,
      level: 'INTERMEDIATE' as const,
      isFeatured: false,
      categoryId: category('training-packages').id,
      topicId: topic('multiphase').id,
    },
    {
      slug: 'fsi-fundamentals',
      type: 'SINGLE_PRODUCT' as const,
      title: 'مبانی اندرکنش سیال و سازه',
      summary: 'کوپل یک‌طرفه و دوطرفه، و اینکه کی حل جدا کافی است.',
      description:
        'آموزش با یک مثال ساده شروع می‌کند و نشان می‌دهد چه زمانی جابه‌جایی سازه باید به حل جریان برگردد. هدف، تصمیم مهندسی است نه فقط کلیک کردن منوها.',
      price: 980000,
      comparePrice: null,
      level: 'ADVANCED' as const,
      isFeatured: false,
      categoryId: category('learning-products').id,
      topicId: topic('fsi').id,
    },
    {
      slug: 'computational-acoustics-course',
      type: 'COURSE' as const,
      title: 'دوره آکوستیک محاسباتی',
      summary: 'منابع نویز جریان و خواندن طیف صدا.',
      description:
        'دوره از مفهوم منبع صوتی تا تنظیم مدل آکوستیک و تفسیر نتیجه را پوشش می‌دهد. برای مهندسانی است که گزارش نویز را باید با عدد تحویل بدهند.',
      price: 1850000,
      comparePrice: 2200000,
      level: 'ADVANCED' as const,
      isFeatured: false,
      categoryId: category('courses').id,
      topicId: topic('acoustics').id,
    },
    {
      slug: 'free-pipe-flow-sample',
      type: 'FREE' as const,
      title: 'نمونه‌ی رایگان جریان در لوله',
      summary: 'یک حل آرام کوتاه برای دیدن ساختار فایل‌های AeroShop.',
      description:
        'این نمونه رایگان است و عمق دوره‌ها را ندارد. فقط مسیر کار با فایل هندسه، مش و گزارش نتیجه را نشان می‌دهد.',
      price: 0,
      comparePrice: null,
      level: 'BEGINNER' as const,
      isFeatured: false,
      categoryId: category('free-products').id,
      topicId: topic('heat-transfer').id,
    },
  ];

  const saved = [];
  for (const product of products) {
    const { file, ...data } = product;
    const row = await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, isPublished: true, isDigital: true },
      create: { ...data, isPublished: true, isDigital: true },
    });
    saved.push(row);
    if (file) {
      await prisma.productFile.upsert({
        where: { storageKey },
        update: { productId: row.id, filename: 'heat-transfer-notes.txt', mimeType: 'text/plain', sizeBytes: 128 },
        create: {
          productId: row.id,
          filename: 'heat-transfer-notes.txt',
          storageKey,
          mimeType: 'text/plain',
          sizeBytes: 128,
        },
      });
    }
  }

  const bundle = saved.find((row) => row.slug === 'multiphase-flow-simulation')!;
  const included = saved.find((row) => row.slug === 'dpm-practical-guide')!;
  await prisma.bundleItem.upsert({
    where: { bundleId_productId: { bundleId: bundle.id, productId: included.id } },
    update: {},
    create: { bundleId: bundle.id, productId: included.id, sortOrder: 0 },
  });

  const combustion = saved.find((row) => row.slug === 'combustion-simulation-fluent')!;
  const section = await prisma.courseSection.upsert({
    where: { id: 'seed-combustion-section' },
    update: { title: 'مدل احتراق', productId: combustion.id },
    create: { id: 'seed-combustion-section', title: 'مدل احتراق', productId: combustion.id, sortOrder: 0 },
  });
  await prisma.lesson.upsert({
    where: { id: 'seed-combustion-lesson' },
    update: { title: 'انتخاب مدل و گونه‌ها' },
    create: {
      id: 'seed-combustion-lesson',
      sectionId: section.id,
      title: 'انتخاب مدل و گونه‌ها',
      sortOrder: 0,
      durationMinutes: 25,
    },
  });

  const services = [
    ['مشاوره رایگان', 'free-consultation', 'پیش از خرید، مسئله را با یک مهندس مرور کنید.', 'جلسه‌ی کوتاه برای مشخص کردن مدل، داده و خروجی مورد انتظار. تعهدی برای سفارش ایجاد نمی‌کند.'],
    ['سفارش پروژه', 'project-order', 'شبیه‌سازی را به AeroShop بسپارید.', 'از تعریف فرض‌ها تا تحویل فایل حل و گزارش. وضعیت کار در حساب شما قابل پیگیری است.'],
    ['آموزش آنلاین اختصاصی', 'private-training', 'آموزش خصوصی روی مسئله‌ی خودتان.', 'جلسه‌ی زنده برای تیمی که باید یک تحلیل مشخص را خودش تکرار کند.'],
    ['پشتیبانی فنی دو هفته‌ای', 'technical-support', 'دو هفته پرسش بعد از تحویل.', 'برای ابهام‌های همان پروژه، نه یک دوره‌ی جدید.'],
  ] as const;
  for (const [title, slug, summary, description] of services) {
    await prisma.service.upsert({
      where: { slug },
      update: { title, summary, description },
      create: { title, slug, summary, description },
    });
  }

  await prisma.faqItem.upsert({
    where: { id: 'seed-faq-files' },
    update: {},
    create: {
      id: 'seed-faq-files',
      question: 'بعد از خرید فایل را از کجا دانلود کنم؟',
      answer: 'از بخش دانلودهای حساب کاربری. لینک مستقیم و دائمی به فایل داده نمی‌شود.',
      sortOrder: 0,
    },
  });
  await prisma.testimonial.upsert({
    where: { id: 'seed-testimonial-1' },
    update: {},
    create: {
      id: 'seed-testimonial-1',
      authorName: 'نگار احمدی',
      authorTitle: 'مهندس مکانیک',
      body: 'مثال انتقال حرارت را روی مسئله‌ی خودمان تکرار کردیم و دیگر تنظیم انرژی را آزمون و خطا نمی‌کنیم.',
      rating: 5,
      isPublished: true,
    },
  });
  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      kind: 'PAGE',
      title: 'درباره AeroShop',
      excerpt: 'آموزش و خدمات شبیه‌سازی جریان برای مهندسان.',
      content:
        'AeroShop محصولات آموزشی دیجیتال و خدمات مهندسی CFD می‌فروشد. محتوا مستقل تولید شده و برای یادگیری عملی و تحویل پروژه‌های شبیه‌سازی است.',
      isPublished: true,
    },
  });

  const posts = [
    {
      slug: 'turbulence-models-in-cfd',
      title: 'آشنایی با مدل‌های آشفتگی در شبیه‌سازی CFD',
      excerpt: 'مروری بر مدل‌های RANS، LES و DES، تفاوت هزینه و دقت آن‌ها و معیارهای انتخاب مدل مناسب برای هر مسئله.',
      content:
        'بیشتر جریان‌های صنعتی آشفته‌اند و حل مستقیم همه‌ی مقیاس‌های آشفتگی (DNS) برای آن‌ها بسیار پرهزینه است؛ به همین دلیل از مدل‌های آشفتگی استفاده می‌کنیم.\n\n' +
        'مدل‌های RANS مانند k-epsilon و k-omega SST میانگین زمانی جریان را حل می‌کنند و اثر نوسانات را با لزجت آشفتگی مدل می‌کنند. k-epsilon برای جریان‌های داخلی کاملاً توسعه‌یافته پایدار و ارزان است، و k-omega SST در نزدیکی دیوار و در جریان‌های دارای گرادیان فشار معکوس و جدایش رفتار دقیق‌تری دارد.\n\n' +
        'در LES گردابه‌های بزرگ مستقیماً حل و فقط مقیاس‌های کوچک مدل می‌شوند؛ نتیجه برای جریان‌های گذرا و جداشده دقیق‌تر است، اما به شبکه‌ی ریزتر و گام زمانی کوچک نیاز دارد. روش‌های ترکیبی مانند DES در نزدیکی دیوار از RANS و در ناحیه‌ی جداشده از LES استفاده می‌کنند.\n\n' +
        'برای انتخاب مدل، هدف شبیه‌سازی (کمیت‌های میانگین یا رفتار گذرا)، عدد رینولدز، وجود جدایش و بودجه‌ی محاسباتی را کنار هم بگذارید. در هر حال مقدار y+ اولین سلول را با تابع دیواره‌ی انتخابی هماهنگ کنید و نتایج را با داده‌ی تجربی یا مرجع معتبر اعتبارسنجی کنید.',
      createdAt: new Date('2026-09-28T09:00:00Z'),
    },
    {
      slug: 'cfd-meshing-best-practices',
      title: 'مش‌بندی در شبیه‌سازی CFD؛ نکات مهم برای یک مش مناسب',
      excerpt: 'معیارهای کیفیت مش، مش لایه‌ی مرزی و مطالعه‌ی استقلال از شبکه؛ سه گام اصلی برای نتیجه‌ای قابل اعتماد.',
      content:
        'کیفیت مش مستقیماً روی همگرایی، پایداری و دقت حل اثر می‌گذارد. قبل از اجرای حل، شاخص‌های کیفیت را بررسی کنید: skewness پایین، orthogonal quality بالا و aspect ratio کنترل‌شده، به‌خصوص در ناحیه‌هایی که گرادیان‌های شدید دارند.\n\n' +
        'در نزدیکی دیوارها از لایه‌های منشوری (inflation) استفاده کنید. ضخامت اولین لایه را بر اساس y+ هدف تعیین کنید، نرخ رشد لایه‌ها را معمولاً حدود ۱٫۱ تا ۱٫۲ نگه دارید و تعداد لایه‌ها را طوری انتخاب کنید که ضخامت لایه‌ی مرزی به‌خوبی پوشش داده شود.\n\n' +
        'ریزکردن محلی را فقط در جاهایی انجام دهید که لازم است: لبه‌ها، ناحیه‌ی جدایش، دنباله و محل اختلاط. تغییر اندازه‌ی سلول‌ها بین نواحی باید تدریجی باشد تا خطای عددی ایجاد نشود.\n\n' +
        'در پایان، مطالعه‌ی استقلال از شبکه انجام دهید: حل را روی حداقل سه شبکه با تراکم متفاوت اجرا کنید و کمیت‌های مهم مانند افت فشار یا ضریب درگ را مقایسه کنید. وقتی تغییر نتیجه با ریزتر شدن شبکه ناچیز شد، شبکه‌ی مناسب را انتخاب کنید.',
      createdAt: new Date('2026-09-21T09:00:00Z'),
    },
    {
      slug: 'heat-transfer-in-engineering-simulation',
      title: 'بررسی انتقال حرارت در شبیه‌سازی‌های مهندسی',
      excerpt: 'هدایت، جابه‌جایی و تابش در شبیه‌سازی؛ از انتخاب شرط مرزی حرارتی تا تحلیل هم‌زمان جامد و سیال (CHT).',
      content:
        'انتقال حرارت در بیشتر تجهیزات مهندسی، از مبدل‌های حرارتی تا خنک‌کاری قطعات الکترونیکی، نقش تعیین‌کننده دارد. در شبیه‌سازی باید مشخص کنید کدام سازوکار غالب است: هدایت در جامدات، جابه‌جایی اجباری یا طبیعی در سیال، یا تابش در دماهای بالا.\n\n' +
        'انتخاب شرط مرزی حرارتی مهم است: دمای ثابت، شار حرارتی ثابت، یا ضریب جابه‌جایی همراه با دمای محیط. شرط مرزی نادرست می‌تواند توزیع دما را کاملاً تغییر دهد، حتی اگر میدان جریان درست حل شده باشد.\n\n' +
        'وقتی دمای دیواره از قبل معلوم نیست، از تحلیل هم‌زمان جامد و سیال (Conjugate Heat Transfer) استفاده کنید تا هدایت در جامد و جابه‌جایی در سیال با هم حل شوند. در جابه‌جایی طبیعی، اثر شناوری را با مدل مناسب چگالی فعال کنید و در دماهای بالا یک مدل تابش مانند DO یا S2S اضافه کنید.\n\n' +
        'برای اعتبارسنجی، عدد ناسلت یا ضریب انتقال حرارت را با روابط تجربی شناخته‌شده یا داده‌ی آزمایشگاهی مقایسه کنید و تعادل انرژی کل دامنه را کنترل کنید.',
      createdAt: new Date('2026-09-14T09:00:00Z'),
    },
  ];
  for (const post of posts) {
    await prisma.page.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, kind: 'POST', isPublished: true },
    });
  }

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: 'ADMIN', isActive: true, passwordHash: await argon2.hash(adminPassword) },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash: await argon2.hash(adminPassword),
      firstName: 'مدیر',
      lastName: 'آئروشاپ',
      role: 'ADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
