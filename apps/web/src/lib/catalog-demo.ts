import type { ProductCard, ProductList } from "@/lib/api";

/**
 * Development-only catalog samples for NtoPiran.
 * Distinct from live API data — never wire demo ids into cart or payment.
 * Visuals use SimVisual (image: null); no fake downloadable files or videos.
 */

export const DEMO_CATALOG_NOTICE =
  "نمونه نمایشی برای دموی توسعه — قیمت‌ها آزمایشی‌اند و خرید یا دانلود واقعی فعال نیست.";

export const DEMO_CONTENT_NOTICE = "محتوای آموزشی در حال آماده‌سازی — فایل و ویدئوی واقعی ارائه نمی‌شود.";

type TopicRef = { name: string; slug: string };
type CategoryRef = { name: string; slug: string };

export type DemoProductDetail = ProductCard & {
  description: string;
  files: { id: string; filename: string }[];
  sections: { id: string; title: string; lessons: { id: string; title: string; durationMinutes: number | null }[] }[];
  bundleItems: ProductCard[];
  related: ProductCard[];
  contentStatus: string;
};

const topics = {
  heat: { name: "انتقال حرارت", slug: "heat-transfer" } satisfies TopicRef,
  multiphase: { name: "جریان چندفازی", slug: "multiphase" } satisfies TopicRef,
  fsi: { name: "اندرکنش سیال و سازه", slug: "fsi" } satisfies TopicRef,
  dpm: { name: "فاز گسسته", slug: "dpm" } satisfies TopicRef,
  acoustics: { name: "آکوستیک", slug: "acoustics" } satisfies TopicRef,
  mesh: { name: "مش دینامیک", slug: "dynamic-mesh" } satisfies TopicRef,
  pipe: { name: "جریان در لوله", slug: "pipe-flow" } satisfies TopicRef,
  combustion: { name: "احتراق", slug: "combustion" } satisfies TopicRef,
} as const;

const categories = {
  learning: { name: "محصولات آموزشی", slug: "learning-products" } satisfies CategoryRef,
  packages: { name: "بسته‌های آموزشی", slug: "training-packages" } satisfies CategoryRef,
  courses: { name: "دوره‌ها", slug: "courses" } satisfies CategoryRef,
  free: { name: "محصولات رایگان", slug: "free-products" } satisfies CategoryRef,
} as const;

function card(
  partial: Omit<ProductCard, "image" | "isDigital" | "comparePrice" | "isFeatured"> & {
    comparePrice?: number | null;
    isFeatured?: boolean;
  },
): ProductCard {
  return {
    image: null,
    isDigital: true,
    comparePrice: partial.comparePrice ?? null,
    isFeatured: partial.isFeatured ?? false,
    ...partial,
  };
}

const productCards: ProductCard[] = [
  card({
    id: "demo-p-heat",
    type: "SINGLE_PRODUCT",
    title: "مبانی انتقال حرارت در شبیه‌سازی جریان",
    slug: "demo-heat-transfer-fundamentals",
    summary: "نمونه نمایشی: هدایت، جابه‌جایی و خواندن کانتور دما در یک مسئله ساده صنعتی.",
    price: 890000,
    comparePrice: 1100000,
    level: "BEGINNER",
    isFeatured: true,
    category: categories.learning,
    topic: topics.heat,
  }),
  card({
    id: "demo-p-mesh",
    type: "SINGLE_PRODUCT",
    title: "کیفیت مش و استقلال از شبکه",
    slug: "demo-mesh-quality-guide",
    summary: "نمونه نمایشی درباره لایه‌های مرزی، y+ و معیارهای کیفیت مش برای حل پایدار.",
    price: 760000,
    level: "INTERMEDIATE",
    isFeatured: true,
    category: categories.learning,
    topic: topics.mesh,
  }),
  card({
    id: "demo-p-multiphase",
    type: "BUNDLE",
    title: "بسته نمونه جریان چندفازی",
    slug: "demo-multiphase-bundle",
    summary: "بسته نمایشی برای چیدمان کارت‌های باندل؛ محتوای فایل واقعی ندارد.",
    price: 1450000,
    comparePrice: 1980000,
    level: "INTERMEDIATE",
    isFeatured: true,
    category: categories.packages,
    topic: topics.multiphase,
  }),
  card({
    id: "demo-p-fsi",
    type: "SINGLE_PRODUCT",
    title: "آشنایی با اندرکنش سیال و سازه",
    slug: "demo-fsi-intro",
    summary: "نمونه نمایشی درباره کوپل یک‌طرفه و دوطرفه و تصمیم‌گیری مهندسی.",
    price: 980000,
    level: "ADVANCED",
    category: categories.learning,
    topic: topics.fsi,
  }),
  card({
    id: "demo-p-dpm",
    type: "SINGLE_PRODUCT",
    title: "مسیر ذرات و مدل فاز گسسته",
    slug: "demo-dpm-particles",
    summary: "نمونه نمایشی تزریق ذره، نیروی درگ و برخورد با دیوار در چارچوب DPM.",
    price: 720000,
    level: "INTERMEDIATE",
    category: categories.learning,
    topic: topics.dpm,
  }),
  card({
    id: "demo-p-pipe",
    type: "FREE",
    title: "نمونه رایگان جریان در لوله",
    slug: "demo-pipe-flow-sample",
    summary: "نمونه نمایشی رایگان برای دیدن ساختار کارت محصول؛ فایل دانلودی واقعی نیست.",
    price: 0,
    level: "BEGINNER",
    isFeatured: true,
    category: categories.free,
    topic: topics.pipe,
  }),
  card({
    id: "demo-p-acoustics",
    type: "SINGLE_PRODUCT",
    title: "مقدمه آکوستیک جریان",
    slug: "demo-flow-acoustics",
    summary: "نمونه نمایشی درباره منابع نویز جریان و خواندن طیف فشار صوتی.",
    price: 850000,
    level: "ADVANCED",
    category: categories.learning,
    topic: topics.acoustics,
  }),
];

const courseCards: ProductCard[] = [
  card({
    id: "demo-c-combustion",
    type: "COURSE",
    title: "دوره نمایشی شبیه‌سازی احتراق",
    slug: "demo-combustion-course",
    summary: "مسیر نمونه از انتخاب مدل تا تفسیر کانتور دما؛ محتوای ویدئویی هنوز آماده نیست.",
    price: 2400000,
    comparePrice: 2900000,
    level: "INTERMEDIATE",
    isFeatured: true,
    category: categories.courses,
    topic: topics.combustion,
  }),
  card({
    id: "demo-c-mesh",
    type: "COURSE",
    title: "دوره نمایشی مش دینامیک",
    slug: "demo-dynamic-mesh-course",
    summary: "سرفصل نمونه برای مرز متحرک و remeshing؛ درس‌ها نمایشی هستند.",
    price: 2100000,
    comparePrice: 2500000,
    level: "ADVANCED",
    isFeatured: true,
    category: categories.courses,
    topic: topics.mesh,
  }),
  card({
    id: "demo-c-heat",
    type: "COURSE",
    title: "دوره نمایشی انتقال حرارت کاربردی",
    slug: "demo-heat-transfer-course",
    summary: "چند فصل کوتاه درباره شرط مرزی حرارتی و CHT؛ بدون ویدئوی واقعی.",
    price: 1850000,
    level: "BEGINNER",
    category: categories.courses,
    topic: topics.heat,
  }),
];

const allCards = [...productCards, ...courseCards];

function detailBase(product: ProductCard, description: string, sections: DemoProductDetail["sections"] = []): DemoProductDetail {
  return {
    ...product,
    description,
    files: [],
    sections,
    bundleItems: product.type === "BUNDLE" ? productCards.filter((item) => item.id === "demo-p-dpm") : [],
    related: allCards.filter((item) => item.topic?.slug === product.topic?.slug && item.id !== product.id).slice(0, 3),
    contentStatus: DEMO_CONTENT_NOTICE,
  };
}

const details: Record<string, DemoProductDetail> = Object.fromEntries(
  [
    detailBase(
      productCards[0]!,
      "این صفحه یک نمونه نمایشی برای دموی NtoPiran است.\n\nدر نسخه واقعی، مسیر تعریف مسئله، تنظیم انرژی و مواد، و خواندن نتایج دما و شار حرارتی پوشش داده می‌شود. فایل حل یا ویدئو در این دمو ارائه نمی‌شود.",
    ),
    detailBase(
      productCards[1]!,
      "نمونه نمایشی درباره شاخص‌های کیفیت مش، لایه‌های مرزی و مطالعه استقلال از شبکه.\n\nمحتوای کامل آموزشی و فایل‌های همراه در حال آماده‌سازی است.",
    ),
    detailBase(
      productCards[2]!,
      "این باندل فقط برای نمایش چیدمان بسته آموزشی در کاتالوگ است. اقلام داخل بسته نیز نمونه‌اند و خرید واقعی ندارند.",
    ),
    detailBase(
      productCards[3]!,
      "نمونه نمایشی برای معرفی تصمیم‌گیری بین کوپل یک‌طرفه و دوطرفه در مسائل FSI. محتوای دانلودی واقعی موجود نیست.",
    ),
    detailBase(
      productCards[4]!,
      "نمونه نمایشی تنظیم Injection و خواندن مسیر ذرات. این محتوا برای آزمایش UI است و فایل آموزشی واقعی ندارد.",
    ),
    detailBase(
      productCards[5]!,
      "نمونه رایگان نمایشی برای ساختار کارت محصول. حتی در حالت رایگان، فایل دانلودی واقعی در دمو فعال نیست.",
    ),
    detailBase(
      productCards[6]!,
      "نمونه نمایشی مفاهیم پایه آکوستیک جریان. گزارش نویز و تنظیم مدل در نسخه نهایی آموزش پوشش داده خواهد شد.",
    ),
    detailBase(courseCards[0]!, "دوره نمایشی احتراق برای بررسی چیدمان سرفصل و صفحه جزئیات دوره.", [
      {
        id: "demo-sec-comb-1",
        title: "آشنایی با مدل احتراق",
        lessons: [
          { id: "demo-les-comb-1", title: "انتخاب مدل و گونه‌ها (نمونه)", durationMinutes: 25 },
          { id: "demo-les-comb-2", title: "پایداری حل (نمونه)", durationMinutes: 20 },
        ],
      },
      {
        id: "demo-sec-comb-2",
        title: "تفسیر نتایج",
        lessons: [{ id: "demo-les-comb-3", title: "کانتور دما و گونه‌ها (نمونه)", durationMinutes: 30 }],
      },
    ]),
    detailBase(courseCards[1]!, "دوره نمایشی مش دینامیک با سرفصل ساختگی برای دمو.", [
      {
        id: "demo-sec-mesh-1",
        title: "مرز متحرک",
        lessons: [
          { id: "demo-les-mesh-1", title: "تعریف حرکت مرز (نمونه)", durationMinutes: 22 },
          { id: "demo-les-mesh-2", title: "Smoothing و remeshing (نمونه)", durationMinutes: 28 },
        ],
      },
    ]),
    detailBase(courseCards[2]!, "دوره نمایشی انتقال حرارت با چند درس کوتاه برای پر کردن UI.", [
      {
        id: "demo-sec-heat-1",
        title: "شرط مرزی حرارتی",
        lessons: [
          { id: "demo-les-heat-1", title: "انواع شرط مرزی (نمونه)", durationMinutes: 18 },
          { id: "demo-les-heat-2", title: "مقدمه CHT (نمونه)", durationMinutes: 24 },
        ],
      },
    ]),
  ].map((item) => [item.slug, item]),
);

export function listDemoProducts(query: {
  topic?: string;
  category?: string;
  type?: string;
  q?: string;
  includeCourses?: boolean;
}): ProductList {
  let items = allCards.filter((item) => {
    if (!query.includeCourses && item.type === "COURSE" && !query.q && !query.type) return false;
    if (query.type && item.type !== query.type) return false;
    if (query.topic && item.topic?.slug !== query.topic) return false;
    if (query.category && item.category?.slug !== query.category) return false;
    if (query.q) {
      const hay = `${item.title} ${item.summary}`.toLowerCase();
      if (!hay.includes(query.q.toLowerCase())) return false;
    }
    return true;
  });

  if (query.q && !query.type) {
    // search keeps courses + products
  } else if (!query.includeCourses && !query.type) {
    items = items.filter((item) => item.type !== "COURSE");
  }

  return { items, page: 1, pageSize: items.length || 12, total: items.length };
}

export function listDemoCourses(query: { topic?: string; q?: string }): ProductList {
  return listDemoProducts({ ...query, type: "COURSE", includeCourses: true });
}

export function getDemoProduct(slug: string): DemoProductDetail | null {
  return details[slug] ?? null;
}

export function featuredDemoProducts(limit = 6): ProductCard[] {
  return productCards.filter((item) => item.isFeatured).concat(productCards.filter((item) => !item.isFeatured)).slice(0, limit);
}

export function featuredDemoCourses(limit = 3): ProductCard[] {
  return courseCards.slice(0, limit);
}

export type DemoCategory = {
  name: string;
  slug: string;
  description: string | null;
  products: ProductCard[];
};

export const demoCategoryList: { id: string; name: string; slug: string; description: string | null }[] = [
  { id: "demo-cat-learning", name: categories.learning.name, slug: categories.learning.slug, description: "آموزش‌های تک‌موضوعی نمایشی برای دمو." },
  { id: "demo-cat-packages", name: categories.packages.name, slug: categories.packages.slug, description: "بسته‌های نمایشی چندمثاله." },
  { id: "demo-cat-courses", name: categories.courses.name, slug: categories.courses.slug, description: "دوره‌های ساختاریافته نمایشی." },
  { id: "demo-cat-free", name: categories.free.name, slug: categories.free.slug, description: "نمونه‌های رایگان نمایشی." },
];

export function getDemoCategory(slug: string): DemoCategory | null {
  const meta = demoCategoryList.find((item) => item.slug === slug);
  if (!meta) return null;
  return {
    name: meta.name,
    slug: meta.slug,
    description: meta.description,
    products: allCards.filter((item) => item.category?.slug === slug && item.type !== "COURSE"),
  };
}

export type DemoService = { id: string; title: string; slug: string; summary: string; description: string };

export const demoServices: DemoService[] = [
  {
    id: "demo-svc-consult",
    title: "مشاوره رایگان",
    slug: "free-consultation",
    summary: "پیش از خرید یا سفارش، مسئله را با یک مهندس مرور کنید.",
    description:
      "جلسه‌ای کوتاه برای روشن کردن مدل، داده ورودی و خروجی مورد انتظار. این خدمت نمونه‌ی نمایشی گردش کار NtoPiran است و تعهد سفارش ایجاد نمی‌کند.",
  },
  {
    id: "demo-svc-project",
    title: "سفارش پروژه",
    slug: "project-order",
    summary: "شبیه‌سازی را به تیم مهندسی بسپارید و وضعیت را از حساب پیگیری کنید.",
    description:
      "از تعریف فرض‌ها تا تحویل گزارش. در دمو فقط فرم درخواست و مسیر پیگیری نمایش داده می‌شود؛ تحویل پروژه واقعی منوط به توافق جداگانه است.",
  },
  {
    id: "demo-svc-private",
    title: "آموزش آنلاین اختصاصی",
    slug: "private-training",
    summary: "آموزش خصوصی روی مسئله یا داده خودتان.",
    description: "برنامه منعطف برای تیم یا فرد. محتوای جلسه در این دمو به‌صورت نمونه معرفی شده و زمان‌بندی واقعی از طریق درخواست ثبت می‌شود.",
  },
  {
    id: "demo-svc-support",
    title: "پشتیبانی فنی دو هفته‌ای",
    slug: "technical-support",
    summary: "پشتیبانی محدود برای ابهام‌های همان پروژه پس از تحویل.",
    description: "محدود به همان دامنه پروژه توافق‌شده است، نه یک دوره آموزشی جدید. شرح کامل در نسخه عملیاتی اعلام می‌شود.",
  },
];

export function getDemoService(slug: string) {
  return demoServices.find((item) => item.slug === slug) ?? null;
}

export type DemoBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: string;
  kind: "POST";
};

export const demoBlogPosts: DemoBlogPost[] = [
  {
    slug: "demo-turbulence-models",
    title: "آشنایی با مدل‌های آشفتگی در شبیه‌سازی CFD",
    excerpt: "مروری نمایشی بر RANS، LES و معیارهای انتخاب مدل برای مسئله مهندسی.",
    category: "آشفتگی",
    createdAt: "2026-09-28T09:00:00.000Z",
    kind: "POST",
    content:
      "این مطلب یک مقاله نمایشی برای دموی NtoPiran است و جایگزین مرجع علمی کامل نیست.\n\n" +
      "در جریان‌های صنعتی معمولاً از مدل‌های آشفتگی استفاده می‌شود چون DNS بسیار پرهزینه است. مدل‌های RANS میانگین جریان را حل می‌کنند؛ LES گردابه‌های بزرگ را مستقیماً می‌بیند و هزینه بیشتری دارد.\n\n" +
      "برای انتخاب مدل، هدف شبیه‌سازی، بودجه محاسباتی و وجود جدایش را کنار هم بگذارید و نتیجه را با داده معتبر مقایسه کنید.",
  },
  {
    slug: "demo-cfd-meshing",
    title: "مش‌بندی در شبیه‌سازی CFD؛ نکات کاربردی",
    excerpt: "کیفیت مش، لایه مرزی و استقلال از شبکه — نسخه نمایشی برای بلاگ.",
    category: "مش‌بندی",
    createdAt: "2026-09-21T09:00:00.000Z",
    kind: "POST",
    content:
      "مقاله نمایشی: کیفیت مش روی همگرایی و دقت اثر مستقیم دارد. قبل از حل، skewness و کیفیت عمودی را بررسی کنید و در نزدیک دیوار از لایه‌های منشوری مناسب استفاده کنید.\n\n" +
      "مطالعه استقلال از شبکه روی چند تراکم، کمیت‌های مهم مثل افت فشار یا ضریب درگ را پایدار می‌کند.",
  },
  {
    slug: "demo-heat-transfer-sim",
    title: "انتقال حرارت در شبیه‌سازی‌های مهندسی",
    excerpt: "هدایت، جابه‌جایی، تابش و مقدمه CHT در قالب محتوای نمایشی.",
    category: "انتقال حرارت",
    createdAt: "2026-09-14T09:00:00.000Z",
    kind: "POST",
    content:
      "این یادداشت نمایشی است. انتخاب شرط مرزی حرارتی (دمای ثابت، شار ثابت یا جابه‌جایی) می‌تواند توزیع دما را تغییر دهد حتی اگر میدان جریان درست باشد.\n\n" +
      "در مسائل دیواره با دمای نامعلوم، تحلیل هم‌زمان جامد و سیال (CHT) مسیر دقیق‌تری است.",
  },
  {
    slug: "demo-multiphase-overview",
    title: "نگاهی به مدل‌های جریان چندفازی",
    excerpt: "تفاوت مفهومی VOF و Mixture در یک متن کوتاه نمایشی.",
    category: "جریان چندفازی",
    createdAt: "2026-09-07T09:00:00.000Z",
    kind: "POST",
    content:
      "مطلب نمایشی: مدل VOF برای سطح آزاد و ردیابی فصل مشترک مناسب‌تر است؛ Mixture وقتی فازها به‌خوبی مخلوط می‌شوند کاربرد دارد. انتخاب مدل باید با فیزیک مسئله و داده اعتبارسنجی هم‌خوان باشد.",
  },
];

export function getDemoBlogPost(slug: string) {
  return demoBlogPosts.find((item) => item.slug === slug) ?? null;
}

export const demoTopics = [
  { id: "demo-t-heat", name: topics.heat.name, slug: topics.heat.slug, description: "هدایت، جابه‌جایی و توزیع دما." },
  { id: "demo-t-multi", name: topics.multiphase.name, slug: topics.multiphase.slug, description: "سطح آزاد و جریان‌های دوفازی." },
  { id: "demo-t-fsi", name: topics.fsi.name, slug: topics.fsi.slug, description: "کوپل جریان و تغییرشکل سازه." },
  { id: "demo-t-dpm", name: topics.dpm.name, slug: topics.dpm.slug, description: "مسیر ذرات و اسپری." },
  { id: "demo-t-acoustics", name: topics.acoustics.name, slug: topics.acoustics.slug, description: "نویز جریان و فشار صوتی." },
  { id: "demo-t-mesh", name: topics.mesh.name, slug: topics.mesh.slug, description: "مرز متحرک و کیفیت شبکه." },
  { id: "demo-t-comb", name: topics.combustion.name, slug: topics.combustion.slug, description: "مدل شعله و گونه‌ها." },
];

export const demoFaq = [
  {
    id: "demo-faq-1",
    question: "آیا محتوای این سایت در حالت دمو قابل خرید است؟",
    answer: "خیر. کارت‌ها و قیمت‌های نمونه فقط برای نمایش چیدمان‌اند و به پرداخت یا دانلود واقعی وصل نیستند.",
  },
  {
    id: "demo-faq-2",
    question: "بعد از خرید واقعی فایل را از کجا دانلود می‌کنم؟",
    answer: "در نسخه عملیاتی، فایل از بخش دانلودهای حساب کاربری و با مجوز اختصاصی در دسترس قرار می‌گیرد.",
  },
  {
    id: "demo-faq-3",
    question: "چگونه درخواست مشاوره یا پروژه ثبت کنم؟",
    answer: "از صفحات مشاوره یا سفارش پروژه فرم را پر کنید. برای ثبت درخواست باید وارد حساب کاربری شوید.",
  },
];
