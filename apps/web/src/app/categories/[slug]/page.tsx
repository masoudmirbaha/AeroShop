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
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      <p className="mt-2 text-muted-foreground">{category.description}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {category.products.map((product) => (
          <ProductCardView key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
