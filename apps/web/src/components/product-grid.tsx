import { ProductCardView } from "@/components/product-card";
import { courseOutlines, type ProductCard } from "@/lib/api";
import { cn } from "@/lib/utils";

/** `label` adds a screen-reader h2 for pages where the card h3s would otherwise follow the h1 directly. */
export async function ProductGrid({ items, className, label }: { items: ProductCard[]; className?: string; label?: string }) {
  const outlines = await courseOutlines(items);
  const grid = (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((product) => (
        <ProductCardView key={product.id} product={product} outline={outlines[product.id]} />
      ))}
    </div>
  );
  if (!label) return grid;
  return (
    <section aria-labelledby="product-grid-heading">
      <h2 id="product-grid-heading" className="sr-only">
        {label}
      </h2>
      {grid}
    </section>
  );
}
