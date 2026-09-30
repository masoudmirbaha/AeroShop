import type { SimKind } from "@/components/sim-visual";

export type PageItem = { title: string; slug: string; excerpt: string | null; kind: "PAGE" | "POST"; createdAt: string };

export type Post = PageItem & { category: string; visual: SimKind };

// Posts have no category or image field, so both are inferred from the title and excerpt.
const topics: [RegExp, string, SimKind][] = [
  [/احتراق|combust|شعله|flame/i, "احتراق", "combustion"],
  [/فاز گسسته|dpm|ذرات|particle/i, "فاز گسسته (DPM)", "particles"],
  [/چندفاز|multiphase|vof|دوفاز/i, "جریان چندفازی", "multiphase"],
  [/آشفتگی|توربولانس|turbulen|rans|les\b|k-epsilon|k-omega/i, "آشفتگی", "airfoil"],
  [/(^|\s)مش|mesh|شبکه‌بندی/i, "مش‌بندی", "mesh"],
  [/اندرکنش|fsi|سیال و سازه/i, "اندرکنش سیال و سازه", "fsi"],
  [/حرارت|heat|thermal|دما/i, "انتقال حرارت", "thermal"],
  [/آکوستیک|acoustic|نویز/i, "آکوستیک", "acoustics"],
  [/هوافضا|aerospace|ایرفویل|airfoil|آیرودینامیک|aerodynamic|بال/i, "هوافضا", "airfoil"],
  [/لوله|pipe|کانال|مکانیک سیالات|fluid mechanics/i, "مکانیک سیالات", "pipe"],
  [/تنش|سازه|fea|structural/i, "تحلیل سازه", "structure"],
  [/cfd|فلوئنت|fluent/i, "CFD", "airfoil"],
];

export function toPost(page: PageItem): Post {
  const text = `${page.title} ${page.excerpt ?? ""}`;
  const match = topics.find(([pattern]) => pattern.test(text));
  return { ...page, category: match?.[1] ?? "شبیه‌سازی عددی", visual: match?.[2] ?? "mesh" };
}

export function latestPosts(pages: PageItem[], count?: number): Post[] {
  const posts = pages
    .filter((page) => page.kind === "POST")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(toPost);
  return count ? posts.slice(0, count) : posts;
}

const dateFormat = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" });

export function formatPostDate(value: string) {
  return dateFormat.format(new Date(value));
}
