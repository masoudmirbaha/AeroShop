import type { SimKind } from "@/components/sim-visual";

/**
 * Local demo-only content for the homepage when catalog/blog APIs return empty lists.
 * Keep this module easy to delete once real published content is available.
 * Featured product cards now come from `catalog-demo.ts` so links reach detail pages.
 * Keep light visual helpers here for topics / legacy post grid styling.
 */

export const DEMO_BADGE = "نمونه نمایشی";
export const DEMO_POST_BADGE = "محتوای نمایشی";

/** Prefer real products when at least this many are available; otherwise pad with demos. */
export const FEATURED_DEMO_THRESHOLD = 3;
export const FEATURED_TARGET_COUNT = 6;

export type DemoPost = {
  id: string;
  title: string;
  excerpt: string;
  visual: SimKind;
  seed: number;
  category: string;
};

export const demoPosts: DemoPost[] = [
  {
    id: "demo-post-cfd-intro",
    title: "مقدمه‌ای بر شبیه‌سازی CFD",
    excerpt: "چارچوب کلی تعریف مسئله، انتخاب مدل جریان و خواندن نتایج فشار و سرعت در تحلیل عددی سیالات.",
    visual: "airfoil",
    seed: 201,
    category: "CFD",
  },
  {
    id: "demo-post-meshing",
    title: "آشنایی با مش‌بندی در تحلیل عددی",
    excerpt: "نقش کیفیت شبکه، لایه‌های مرزی و استقلال از مش در پایداری و دقت حل عددی.",
    visual: "mesh",
    seed: 211,
    category: "مش‌بندی",
  },
  {
    id: "demo-post-heat",
    title: "اصول انتقال حرارت",
    excerpt: "هدایت، جابه‌جایی و تابش؛ انتخاب شرط مرزی حرارتی و تفسیر کانتور دما در تجهیزات.",
    visual: "thermal",
    seed: 223,
    category: "انتقال حرارت",
  },
  {
    id: "demo-post-structure",
    title: "کاربرد تحلیل سازه در مهندسی",
    excerpt: "بررسی تنش، تغییرشکل و معیارهای طراحی در ارزیابی استحکام قطعات تحت بار.",
    visual: "structure",
    seed: 227,
    category: "تحلیل سازه",
  },
  {
    id: "demo-post-multiphase",
    title: "آشنایی با جریان چندفازی",
    excerpt: "سطح آزاد، اختلاط فازها و نکات کلیدی در تنظیم مدل‌های چندفازی برای مسائل صنعتی.",
    visual: "multiphase",
    seed: 233,
    category: "جریان چندفازی",
  },
  {
    id: "demo-post-hvac",
    title: "کاربرد شبیه‌سازی در طراحی HVAC",
    excerpt: "توزیع جریان هوا، آسایش حرارتی و ارزیابی الگوی تهویه در فضاهای داخلی.",
    visual: "hvac",
    seed: 241,
    category: "HVAC",
  },
];

export type EngineeringServiceCard = {
  id: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  visual: SimKind;
  seed: number;
};

/** Curated homepage cards; CTAs point only at routes that exist in the app. */
export const engineeringServiceCards: EngineeringServiceCard[] = [
  {
    id: "eng-cfd-aero",
    title: "تحلیل CFD و آیرودینامیک",
    summary: "شبیه‌سازی جریان، میدان فشار و نیروهای آیرودینامیکی برای ارزیابی عملکرد هندسه‌های مهندسی.",
    href: "/request-project",
    cta: "ثبت درخواست پروژه",
    visual: "airfoil",
    seed: 11,
  },
  {
    id: "eng-heat",
    title: "انتقال حرارت و تحلیل حرارتی",
    summary: "بررسی هدایت، جابه‌جایی و توزیع دما در تجهیزات و جریان‌های حرارتی صنعتی.",
    href: "/request-project",
    cta: "ثبت درخواست پروژه",
    visual: "thermal",
    seed: 23,
  },
  {
    id: "eng-structure",
    title: "تحلیل سازه و تنش",
    summary: "ارزیابی تنش، تغییرشکل و ضریب اطمینان قطعات تحت بارگذاری‌های مهندسی.",
    href: "/services",
    cta: "مشاهده خدمات",
    visual: "structure",
    seed: 37,
  },
  {
    id: "eng-multiphase",
    title: "جریان چندفازی",
    summary: "مدل‌سازی سطح آزاد، اختلاط فازها و پدیده‌های دوفازی در فرایندهای صنعتی.",
    href: "/services",
    cta: "مشاهده خدمات",
    visual: "multiphase",
    seed: 41,
  },
  {
    id: "eng-fsi",
    title: "اندرکنش سیال و سازه",
    summary: "تحلیل هم‌زمان جریان و تغییرشکل سازه برای مسائل FSI و سازه‌های انعطاف‌پذیر.",
    href: "/consultation",
    cta: "درخواست مشاوره",
    visual: "fsi",
    seed: 53,
  },
  {
    id: "eng-hvac",
    title: "طراحی و تحلیل سیستم‌های HVAC",
    summary: "بررسی الگوی جریان هوا، توزیع دما و عملکرد تهویه در فضاهای داخلی.",
    href: "/consultation",
    cta: "درخواست مشاوره",
    visual: "hvac",
    seed: 59,
  },
];

export type SimulationTopicCard = {
  id: string;
  title: string;
  summary: string;
  /**
   * Only slugs that exist in seed/catalog topics (or null → `/products`).
   * Verified against products page `?topic=` filter support.
   */
  topicSlug: string | null;
  visual: SimKind;
  seed: number;
};

export const demoSimulationTopics: SimulationTopicCard[] = [
  {
    id: "topic-cfd",
    title: "CFD",
    summary: "دینامیک سیالات محاسباتی؛ تحلیل جریان، فشار و الگوی حرکت سیال.",
    topicSlug: null,
    visual: "airfoil",
    seed: 71,
  },
  {
    id: "topic-heat",
    title: "Heat Transfer",
    summary: "انتقال حرارت؛ هدایت، جابه‌جایی و توزیع دما در تجهیزات.",
    topicSlug: "heat-transfer",
    visual: "thermal",
    seed: 73,
  },
  {
    id: "topic-structure",
    title: "Structural Analysis",
    summary: "تحلیل سازه؛ تنش، تغییرشکل و ارزیابی استحکام قطعات.",
    topicSlug: null,
    visual: "structure",
    seed: 79,
  },
  {
    id: "topic-multiphase",
    title: "Multiphase Flow",
    summary: "جریان چندفازی؛ سطح آزاد، اختلاط و پدیده‌های دوفازی.",
    topicSlug: "multiphase",
    visual: "multiphase",
    seed: 89,
  },
  {
    id: "topic-fsi",
    title: "FSI",
    summary: "اندرکنش سیال و سازه؛ جریان و تغییرشکل هم‌زمان.",
    topicSlug: "fsi",
    visual: "fsi",
    seed: 97,
  },
  {
    id: "topic-hvac",
    title: "HVAC",
    summary: "تهویه و آسایش حرارتی؛ الگوی جریان هوا در فضاهای داخلی.",
    topicSlug: null,
    visual: "hvac",
    seed: 101,
  },
  {
    id: "topic-mesh",
    title: "Meshing",
    summary: "مش‌بندی؛ کیفیت شبکه، لایه‌های مرزی و استقلال از مش.",
    topicSlug: "dynamic-mesh",
    visual: "mesh",
    seed: 103,
  },
  {
    id: "topic-pipe",
    title: "Pipe Flow",
    summary: "جریان در لوله و کانال؛ پروفیل سرعت و افت فشار.",
    topicSlug: null,
    visual: "pipe",
    seed: 107,
  },
];
