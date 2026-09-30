import { ProductCardView } from "@/components/product-card";
import { courseOutlines, type ProductCard } from "@/lib/api";
import { cn } from "@/lib/utils";

export async function ProductGrid({ items, className }: { items: ProductCard[]; className?: string }) {
  const outlines = await courseOutlines(items);
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((product) => (
        <ProductCardView key={product.id} product={product} outline={outlines[product.id]} />
      ))}
    </div>
  );
}
