import { PackageSearch } from "lucide-react";
import { EmptyState, Page } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { api, type ProductCard } from "@/lib/api";

type CategoryPageData = {
  name: string;
  description: string | null;
  products: ProductCard[];
};

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
        <ProductGrid items={category.products} />
      ) : (
        <EmptyState icon={PackageSearch} title="این دسته هنوز محصولی ندارد" />
      )}
    </Page>
  );
}
