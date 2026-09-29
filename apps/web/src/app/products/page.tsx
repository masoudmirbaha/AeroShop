import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { EmptyState, Page } from "@/components/page";
import { ProductCardView } from "@/components/product-card";
import { api, type ProductList } from "@/lib/api";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; category?: string; type?: string; q?: string }>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const data = await api<ProductList>(`/products?${params.toString()}`);

  return (
    <Page
      eyebrow="فروشگاه آموزشی"
      title={query.q ? `نتایج جستجو برای «${query.q}»` : "محصولات"}
      description="آموزش‌های تک‌موضوعی، بسته‌ها و دوره‌های شبیه‌سازی جریان با فایل و ویدئو؛ همه دیجیتال و قابل دانلود از حساب کاربری."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "محصولات" }]}
      actions={<span className="badge badge-muted h-8 px-3 text-xs">{data.total.toLocaleString("fa-IR")} مورد</span>}
    >
      {data.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
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
