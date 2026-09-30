import { ArrowLeft, BookOpen, Clock, Download, FileDown, FileText, GraduationCap, Layers, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SimVisual, visualFor } from "@/components/sim-visual";
import { formatMinutes, typeLabel } from "@/lib/format";
import type { CourseOutline, ProductCard } from "@/lib/api";
import { cn } from "@/lib/utils";

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

/** Topic-matched technical visual; falls back to a generated simulation scene when no image is uploaded. */
export function ProductVisual({ product, className = "aspect-[16/10]", sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" }: { product: ProductCard; className?: string; sizes?: string }) {
  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden bg-(--sim-bg)", className)}>
        <Image
          src={product.image}
          alt={`تصویر ${product.title}`}
          fill
          sizes={sizes}
          unoptimized={!product.image.startsWith("/")}
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy/45 via-navy/5 to-transparent" />
      </div>
    );
  }
  const { kind, seed } = visualFor(product);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SimVisual kind={kind} seed={seed} className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/35 via-transparent to-transparent" />
    </div>
  );
}

const cardFrame = "h-48 w-full shrink-0 md:h-52";

const levelSteps = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 } as const;

function LevelMeter({ level }: { level: ProductCard["level"] }) {
  if (!level) return null;
  const steps = levelSteps[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {[1, 2, 3].map((step) => (
          <span key={step} className={cn("w-1 rounded-sm", step <= steps ? "bg-primary" : "bg-border")} style={{ height: `${4 + step * 3}px` }} />
        ))}
      </span>
      {typeLabel(level)}
    </span>
  );
}

const productKinds: Record<string, { icon: LucideIcon; label: string }> = {
  SINGLE_PRODUCT: { icon: FileText, label: "آموزش تک‌موضوعی" },
  BUNDLE: { icon: Layers, label: "بسته‌ی آموزشی" },
  FREE: { icon: Download, label: "دانلود رایگان" },
};

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function CardFacts({ product, outline }: { product: ProductCard; outline?: CourseOutline }) {
  if (product.type === "COURSE") {
    if (!outline) return null;
    return (
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Meta icon={BookOpen}>{`${outline.sections.toLocaleString("fa-IR")} فصل · ${outline.lessons.toLocaleString("fa-IR")} درس`}</Meta>
        {outline.minutes ? <Meta icon={Clock}>{formatMinutes(outline.minutes)}</Meta> : null}
      </p>
    );
  }
  const kind = productKinds[product.type];
  if (!kind) return null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <Meta icon={kind.icon}>{kind.label}</Meta>
      {product.isDigital && product.type !== "FREE" ? <Meta icon={FileDown}>فایل دیجیتال</Meta> : null}
    </p>
  );
}

export function ProductCardView({ product, outline }: { product: ProductCard; outline?: CourseOutline }) {
  const href = productHref(product);
  const discount = discountPercent(product);
  const course = product.type === "COURSE";
  return (
    <article className="surface card-glow group relative flex flex-col overflow-hidden">
      <div className="relative shrink-0 overflow-hidden rounded-t-[inherit]">
        <ProductVisual product={product} className={cardFrame} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="badge bg-card/95 text-foreground shadow-sm">{typeLabel(product.type)}</span>
          {discount ? <span className="badge bg-card text-primary shadow-sm tabular-nums">٪{discount.toLocaleString("fa-IR")} تخفیف</span> : null}
        </div>
        {course ? (
          <span className="absolute start-3 bottom-3 inline-flex items-center gap-1.5 rounded-md bg-navy/90 px-2 py-1 text-[11px] font-medium text-navy-foreground ring-1 ring-white/10">
            <GraduationCap className="size-3.5 text-brand-cyan" aria-hidden="true" />
            دوره آموزشی
          </span>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col px-4 pt-4 pb-4", course && "border-t-2 border-primary/15")}>
        <div className="flex items-center justify-between gap-2">
          {product.topic || product.category ? <p className="truncate text-xs font-medium text-primary/80">{product.topic?.name ?? product.category?.name}</p> : <span />}
          {course ? <LevelMeter level={product.level} /> : product.level ? <span className="shrink-0 text-xs text-muted-foreground">{typeLabel(product.level)}</span> : null}
        </div>
        <h3 className="mt-1.5 text-base leading-7 font-semibold transition-colors group-hover:text-primary">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{product.summary}</p>
        <CardFacts product={product} outline={outline} />

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <PriceTag price={product.price} comparePrice={product.comparePrice} />
          <span className="btn btn-sm shrink-0 bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {course ? "مشاهده دوره" : "مشاهده"}
            <ArrowLeft aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
