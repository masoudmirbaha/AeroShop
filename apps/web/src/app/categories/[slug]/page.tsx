import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { getDemoCategory } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import type { ProductCard } from "@/lib/api";
import { tryApi } from "@/lib/try-api";

type CategoryPageData = {
  name: string;
  description: string | null;
  products: ProductCard[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const load = await tryApi<CategoryPageData>(`/categories/${slug}`);
  if (load.status === "ok") return { title: load.data.name, description: load.data.description ?? undefined };
  const demo = demoCatalogEnabled() ? getDemoCategory(slug) : null;
  if (demo) return { title: demo.name, description: demo.description ?? undefined };
  return { title: "دسته‌بندی" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = await tryApi<CategoryPageData>(`/categories/${slug}`);
  const demoEnabled = demoCatalogEnabled();

  let category: CategoryPageData | null = null;
  let usingDemo = false;
  let apiFailed = false;

  if (load.status === "ok") {
    category = load.data;
    if (!category.products.length && demoEnabled) {
      const demo = getDemoCategory(slug);
      if (demo) {
        category = demo;
        usingDemo = true;
      }
    }
  } else {
    apiFailed = true;
    const demo = demoEnabled ? getDemoCategory(slug) : null;
    if (demo) {
      category = demo;
      usingDemo = true;
    } else if (load.status === "error" && /404/.test(load.message)) {
      notFound();
    } else {
      throw new Error(load.message);
    }
  }

  if (!category) notFound();

  return (
    <Page
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: category.name }]}
    >
      {apiFailed ? <ApiErrorNotice message="بارگذاری این دسته‌بندی از سرور انجام نشد." /> : null}
      {usingDemo ? <DemoNotice /> : null}
      {category.products.length ? (
        <ProductGrid items={category.products} label={`محصولات ${category.name}`} />
      ) : (
        <EmptyState icon={PackageSearch} title="این دسته هنوز محصولی ندارد" />
      )}
    </Page>
  );
}
