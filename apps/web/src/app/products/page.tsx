import { ArrowLeft, GraduationCap, PackageSearch } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { api, type ProductList } from "@/lib/api";
import { cn } from "@/lib/utils";

const kinds = [
  { type: undefined, label: "همه" },
  { type: "SINGLE_PRODUCT", label: "محصولات تکی" },
  { type: "BUNDLE", label: "بسته‌های آموزشی" },
  { type: "FREE", label: "رایگان" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; category?: string; type?: string; q?: string }>;
}) {
  const query = await searchParams;
  if (query.type === "COURSE") redirect("/courses");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  // Courses have their own catalog at /courses; searches still cover every type.
  const browsing = !query.q && !query.type;
  const courseParams = new URLSearchParams(params);
  courseParams.set("type", "COURSE");
  courseParams.set("pageSize", "1");
  if (browsing) params.set("pageSize", "48");
  const [data, courses] = await Promise.all([
    api<ProductList>(`/products?${params.toString()}`),
    browsing ? api<ProductList>(`/products?${courseParams.toString()}`) : null,
  ]);
  const items = browsing ? data.items.filter((item) => item.type !== "COURSE") : data.items;
  const total = courses ? data.total - courses.total : data.total;
  const active = kinds.find((kind) => kind.type === query.type) ?? kinds[0];

  const hrefFor = (type?: string) => {
    const next = new URLSearchParams();
    if (query.topic) next.set("topic", query.topic);
    if (query.category) next.set("category", query.category);
    if (type) next.set("type", type);
    const search = next.toString();
    return search ? `/products?${search}` : "/products";
  };

  return (
    <Page
      title={query.q ? `نتایج جستجو برای «${query.q}»` : active.type ? active.label : "محصولات"}
      description={
        query.q
          ? "نتایج شامل محصولات و دوره‌هاست."
          : "فایل‌های آموزشی، بسته‌ها و نمونه‌های رایگان شبیه‌سازی جریان؛ همه دیجیتال و قابل دانلود از حساب کاربری."
      }
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "محصولات", href: query.q || active.type ? "/products" : undefined }, ...(query.q || active.type ? [{ label: query.q ? "جستجو" : active.label }] : [])]}
      actions={<span className="badge badge-muted h-8 px-3 text-xs">{total.toLocaleString("fa-IR")} مورد</span>}
    >
      {query.q ? null : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="نوع محصول" className="flex flex-wrap gap-1.5">
            {kinds.map((kind) => {
              const current = kind === active;
              return (
                <Link
                  key={kind.label}
                  href={hrefFor(kind.type)}
                  aria-current={current ? "page" : undefined}
                  className={cn("chip py-1 text-xs", current && "border-primary/30 bg-secondary text-primary")}
                >
                  {kind.label}
                </Link>
              );
            })}
          </nav>
          {courses?.total ? (
            <Link href={query.topic ? `/courses?topic=${encodeURIComponent(query.topic)}` : "/courses"} className="text-link inline-flex items-center gap-1.5 text-sm">
              <GraduationCap className="size-4" aria-hidden="true" />
              {`${courses.total.toLocaleString("fa-IR")} دوره‌ی ساختاریافته در بخش دوره‌ها`}
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      )}
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="محصولی پیدا نشد"
          description="عبارت دیگری را جستجو کنید یا همه محصولات را ببینید."
          action={
            <Link href="/products" className="btn btn-outline">
              همه محصولات
            </Link>
          }
        />
      )}
    </Page>
  );
}
