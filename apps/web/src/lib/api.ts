import { notFound } from "next/navigation";

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

export async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin}/api/v1${path}`, { cache: "no-store" });
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error(`API ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export type ProductCard = {
  id: string;
  type: "SINGLE_PRODUCT" | "BUNDLE" | "COURSE" | "FREE";
  title: string;
  slug: string;
  summary: string;
  price: number;
  comparePrice: number | null;
  isDigital: boolean;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  topic: { name: string; slug: string } | null;
  image: string | null;
};

export type ProductList = {
  items: ProductCard[];
  page: number;
  pageSize: number;
  total: number;
};

export type CourseOutline = { sections: number; lessons: number; minutes: number };

type OutlineSource = { sections: { lessons: { durationMinutes: number | null }[] }[] };

export function outlineOf({ sections }: OutlineSource): CourseOutline | null {
  const lessons = sections.flatMap((section) => section.lessons);
  if (!lessons.length) return null;
  return { sections: sections.length, lessons: lessons.length, minutes: lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0) };
}

/** The list endpoint has no syllabus data, so course outlines come from each course's detail. */
export async function courseOutlines(items: ProductCard[]): Promise<Record<string, CourseOutline>> {
  const courses = items.filter((item) => item.type === "COURSE");
  const entries = await Promise.all(
    courses.map(async (course) => {
      const response = await fetch(`${apiOrigin}/api/v1/products/${encodeURIComponent(course.slug)}`, { cache: "no-store" }).catch(() => null);
      if (!response?.ok) return null;
      const outline = outlineOf((await response.json()) as OutlineSource);
      return outline ? ([course.id, outline] as const) : null;
    }),
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
