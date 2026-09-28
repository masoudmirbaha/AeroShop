import Link from "next/link";
import { formatPrice, typeLabel } from "@/lib/format";
import type { ProductCard } from "@/lib/api";

export function ProductCardView({ product }: { product: ProductCard }) {
  const href = product.type === "COURSE" ? `/courses/${product.slug}` : `/products/${product.slug}`;
  return (
    <article className="flex flex-col rounded-xl border bg-card p-4">
      <div className="mb-3 flex gap-2 text-xs text-muted-foreground">
        <span className="rounded bg-muted px-2 py-0.5">{typeLabel(product.type)}</span>
        {product.level ? <span className="rounded bg-muted px-2 py-0.5">{typeLabel(product.level)}</span> : null}
      </div>
      <h2 className="text-lg font-semibold">
        <Link href={href}>{product.title}</Link>
      </h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{product.summary}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {product.category?.name}
        {product.topic ? ` · ${product.topic.name}` : ""}
      </p>
      <p className="mt-3 font-medium">{formatPrice(product.price)}</p>
    </article>
  );
}
