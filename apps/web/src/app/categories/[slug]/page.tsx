import { PackageSearch } from "lucide-react";
import { EmptyState, Page } from "@/components/page";
import { ProductCardView } from "@/components/product-card";
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
      eyebrow="دسته‌بندی"
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: category.name }]}
    >
      {category.products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState icon={PackageSearch} title="این دسته هنوز محصولی ندارد" />
      )}
    </Page>
  );
}
