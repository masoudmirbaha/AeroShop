import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { api, type ProductCard } from "@/lib/api";

type CategoryPageData = {
  name: string;
  description: string | null;
  products: ProductCard[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const category = await api<CategoryPageData>(`/categories/${(await params).slug}`);
  return { title: category.name, description: category.description ?? undefined };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await api<CategoryPageData>(`/categories/${slug}`);
  return (
    <Page
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: category.name }]}
    >
      {category.products.length ? (
        <ProductGrid items={category.products} label={`محصولات ${category.name}`} />
      ) : (
        <EmptyState icon={PackageSearch} title="این دسته هنوز محصولی ندارد" />
      )}
    </Page>
  );
}
