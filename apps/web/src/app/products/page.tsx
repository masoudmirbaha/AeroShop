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
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">محصولات</h1>
      <p className="mb-6 text-sm text-muted-foreground">{data.total} مورد</p>
      <div className="grid gap-4 md:grid-cols-3">
        {data.items.map((product) => (
          <ProductCardView key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
