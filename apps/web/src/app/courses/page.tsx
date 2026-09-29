import { GraduationCap } from "lucide-react";
import { EmptyState, Page } from "@/components/page";
import { ProductCardView } from "@/components/product-card";
import { api, type ProductList } from "@/lib/api";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ topic?: string; q?: string }> }) {
  const query = await searchParams;
  const params = new URLSearchParams({ type: "COURSE" });
  if (query.topic) params.set("topic", query.topic);
  if (query.q) params.set("q", query.q);
  const data = await api<ProductList>(`/products?${params.toString()}`);

  return (
    <Page
      eyebrow="آموزش ساختاریافته"
      title="دوره‌ها"
      description="دوره‌های کامل با سرفصل، درس و پروژه پایانی؛ از مش دینامیک تا احتراق و آکوستیک محاسباتی."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "دوره‌ها" }]}
      actions={<span className="badge badge-muted h-8 px-3 text-xs">{data.total.toLocaleString("fa-IR")} دوره</span>}
    >
      {data.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState icon={GraduationCap} title="هنوز دوره‌ای منتشر نشده است" description="به‌زودی دوره‌های جدید اضافه می‌شوند." />
      )}
    </Page>
  );
}
