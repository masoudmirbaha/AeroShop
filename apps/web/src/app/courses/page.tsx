import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { api, type ProductList } from "@/lib/api";

export const metadata: Metadata = {
  title: "دوره‌ها",
  description: "دوره‌های کامل با سرفصل، درس و پروژه پایانی؛ از مش دینامیک تا احتراق و آکوستیک محاسباتی.",
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ topic?: string; q?: string }> }) {
  const query = await searchParams;
  const params = new URLSearchParams({ type: "COURSE" });
  if (query.topic) params.set("topic", query.topic);
  if (query.q) params.set("q", query.q);
  const data = await api<ProductList>(`/products?${params.toString()}`);

  return (
    <Page
      title="دوره‌ها"
      description="دوره‌های کامل با سرفصل، درس و پروژه پایانی؛ از مش دینامیک تا احتراق و آکوستیک محاسباتی."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "دوره‌ها" }]}
      actions={<span className="badge badge-muted h-8 px-3 text-xs">{data.total.toLocaleString("fa-IR")} دوره</span>}
    >
      {data.items.length ? (
        <ProductGrid items={data.items} label="فهرست دوره‌ها" />
      ) : (
        <EmptyState icon={GraduationCap} title="هنوز دوره‌ای منتشر نشده است" description="به‌زودی دوره‌های جدید اضافه می‌شوند." />
      )}
    </Page>
  );
}
