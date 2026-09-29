import { ArrowLeft, FileBox, Gift, GraduationCap, Layers } from "lucide-react";
import Link from "next/link";
import { typeLabel } from "@/lib/format";
import type { ProductCard } from "@/lib/api";

const typeIcons = {
  SINGLE_PRODUCT: FileBox,
  BUNDLE: Layers,
  COURSE: GraduationCap,
  FREE: Gift,
} as const;

export function productHref(product: Pick<ProductCard, "type" | "slug">) {
  return product.type === "COURSE" ? `/courses/${product.slug}` : `/products/${product.slug}`;
}

export function PriceTag({ price, comparePrice, size = "md" }: { price: number; comparePrice?: number | null; size?: "md" | "lg" }) {
  const hasDiscount = comparePrice != null && comparePrice > price;
  if (price === 0) {
    return <span className={`font-bold text-accent-foreground ${size === "lg" ? "text-2xl" : "text-lg"}`}>رایگان</span>;
  }
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold tracking-tight tabular-nums ${size === "lg" ? "text-2xl" : "text-lg"}`}>{price.toLocaleString("fa-IR")}</span>
      <span className="text-xs text-muted-foreground">تومان</span>
      {hasDiscount ? <span className="text-xs text-muted-foreground/80 tabular-nums line-through">{comparePrice.toLocaleString("fa-IR")}</span> : null}
    </span>
  );
}

function discountPercent(product: ProductCard) {
  if (product.comparePrice == null || product.comparePrice <= product.price || product.price === 0) return 0;
  return Math.round((1 - product.price / product.comparePrice) * 100);
}

export function ProductVisual({ product, className = "h-40" }: { product: ProductCard; className?: string }) {
  const Icon = typeIcons[product.type] ?? FileBox;
  if (product.image) {
    return (
      <div aria-hidden="true" className={`overflow-hidden rounded-xl bg-muted ${className}`}>
        <div className="size-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${product.image})` }} />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`relative overflow-hidden rounded-xl bg-linear-to-br from-secondary via-secondary/50 to-accent ring-1 ring-primary/10 ring-inset ${className}`}>
      <div className="tech-grid absolute inset-0 mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-primary/30 transition-transform duration-500 ease-out group-hover:scale-105"
      >
        <path d="M0 52 C 50 30, 110 30, 200 44" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 62 C 60 44, 120 46, 200 56" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <path d="M0 40 C 45 18, 115 16, 200 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M0 70 C 70 58, 130 60, 200 66" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      </svg>
      <div className="absolute -end-10 -bottom-12 size-36 rounded-full bg-brand-cyan/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-2xl bg-card/90 text-primary shadow-md shadow-primary/10 ring-1 ring-primary/10 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
        <Icon className="size-6" />
      </span>
    </div>
  );
}

export function ProductCardView({ product }: { product: ProductCard }) {
  const href = productHref(product);
  const discount = discountPercent(product);
  return (
    <article className="surface card-glow group relative flex flex-col p-2.5">
      <div className="relative">
        <ProductVisual product={product} />
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="badge bg-card/90 shadow-sm backdrop-blur">{typeLabel(product.type)}</span>
            {product.level ? <span className="badge bg-card/80 text-muted-foreground shadow-sm backdrop-blur">{typeLabel(product.level)}</span> : null}
          </div>
          {discount ? <span className="badge bg-primary text-primary-foreground shadow-sm tabular-nums">٪{discount.toLocaleString("fa-IR")} تخفیف</span> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pt-4 pb-2">
        {product.topic || product.category ? <p className="text-xs font-medium text-primary/80">{product.topic?.name ?? product.category?.name}</p> : null}
        <h3 className="mt-1.5 text-base leading-7 font-semibold transition-colors group-hover:text-primary">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{product.summary}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <PriceTag price={product.price} comparePrice={product.comparePrice} />
          <span className="btn btn-sm shrink-0 bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            مشاهده
            <ArrowLeft aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
