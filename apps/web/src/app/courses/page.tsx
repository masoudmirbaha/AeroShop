import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { listDemoCourses } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { type ProductList } from "@/lib/api";
import { tryApi } from "@/lib/try-api";

export const metadata: Metadata = {
  title: "دوره‌ها",
  description: "دوره‌های کامل با سرفصل، درس و پروژه پایانی؛ از مش دینامیک تا احتراق و آکوستیک محاسباتی.",
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ topic?: string; q?: string }> }) {
  const query = await searchParams;
  const params = new URLSearchParams({ type: "COURSE" });
  if (query.topic) params.set("topic", query.topic);
  if (query.q) params.set("q", query.q);

  const load = await tryApi<ProductList>(`/products?${params.toString()}`);
  const demoEnabled = demoCatalogEnabled();

  let items: ProductList["items"] = [];
  let total = 0;
  let usingDemo = false;
  let apiFailed = false;

  if (load.status === "ok") {
    items = load.data.items;
    total = load.data.total;
    if (!items.length && demoEnabled) {
      const demo = listDemoCourses(query);
      items = demo.items;
      total = demo.total;
      usingDemo = true;
    }
  } else {
    apiFailed = true;
    if (demoEnabled) {
      const demo = listDemoCourses(query);
      items = demo.items;
      total = demo.total;
      usingDemo = true;
    }
  }

  return (
    <Page
      title="دوره‌ها"
      description="دوره‌های کامل با سرفصل، درس و پروژه پایانی؛ از مش دینامیک تا احتراق و آکوستیک محاسباتی."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "دوره‌ها" }]}
      actions={<span className="badge badge-muted h-8 px-3 text-xs">{total.toLocaleString("fa-IR")} دوره</span>}
    >
      {apiFailed ? <ApiErrorNotice message="بارگذاری فهرست دوره‌ها از سرور انجام نشد." /> : null}
      {usingDemo ? <DemoNotice /> : null}
      {items.length ? (
        <ProductGrid items={items} label="فهرست دوره‌ها" />
      ) : (
        <EmptyState icon={GraduationCap} title="هنوز دوره‌ای منتشر نشده است" description="به‌زودی دوره‌های جدید اضافه می‌شوند." />
      )}
    </Page>
  );
}
