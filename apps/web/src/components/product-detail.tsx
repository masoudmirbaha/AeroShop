import { BadgeCheck, Clock, Download, PlayCircle, ShieldCheck } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { Card, Page, Section, type Crumb } from "@/components/page";
import { PriceTag, ProductCardView, ProductVisual } from "@/components/product-card";
import { api, type ProductCard } from "@/lib/api";
import { typeLabel } from "@/lib/format";

type Detail = ProductCard & {
  description: string;
  files: { id: string; filename: string }[];
  sections: { id: string; title: string; lessons: { id: string; title: string; durationMinutes: number | null }[] }[];
  bundleItems: ProductCard[];
  related: ProductCard[];
};

const perks = [
  { icon: Download, text: "دانلود فایل‌ها از بخش دانلودهای حساب" },
  { icon: ShieldCheck, text: "لینک دانلود با مجوز اختصاصی" },
  { icon: BadgeCheck, text: "محصول دیجیتال، بدون ارسال پستی" },
];

export async function ProductDetail({ slug }: { slug: string }) {
  const product = await api<Detail>(`/products/${slug}`);
  const isCourse = product.type === "COURSE";
  const breadcrumbs: Crumb[] = [
    { label: "خانه", href: "/" },
    isCourse ? { label: "دوره‌ها", href: "/courses" } : { label: "محصولات", href: "/products" },
    ...(product.category && !isCourse ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
    { label: product.title },
  ];
  const lessonCount = product.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  return (
    <Page eyebrow={product.topic?.name ?? typeLabel(product.type)} title={product.title} description={product.summary} breadcrumbs={breadcrumbs}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 gap-8">
          <Card className="p-6 md:p-8">
            <h2 className="text-lg font-bold">درباره این {typeLabel(product.type)}</h2>
            <p className="mt-4 leading-8 whitespace-pre-wrap text-foreground/85">{product.description}</p>
            {product.files.length ? (
              <p className="mt-6 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm text-secondary-foreground">
                <Download className="size-4 shrink-0" aria-hidden="true" />
                فایل‌ها بعد از خرید در بخش دانلودها قرار می‌گیرند.
              </p>
            ) : null}
          </Card>

          {product.sections.length ? (
            <Section title="سرفصل‌ها" description={`${product.sections.length.toLocaleString("fa-IR")} فصل · ${lessonCount.toLocaleString("fa-IR")} درس`}>
              <div className="surface divide-y divide-border/70 overflow-hidden">
                {product.sections.map((section, index) => (
                  <div key={section.id} className="p-5">
                    <h3 className="flex items-center gap-3 font-semibold">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-primary tabular-nums">
                        {(index + 1).toLocaleString("fa-IR")}
                      </span>
                      {section.title}
                    </h3>
                    <ul className="mt-3 grid gap-1 ps-10">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between gap-3 rounded-md py-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <PlayCircle className="size-4 shrink-0 text-primary/60" aria-hidden="true" />
                            {lesson.title}
                          </span>
                          {lesson.durationMinutes ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums">
                              <Clock className="size-3.5" aria-hidden="true" />
                              {lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {product.bundleItems.length ? (
            <Section title="محتوای بسته">
              <div className="grid gap-5 sm:grid-cols-2">
                {product.bundleItems.map((item) => (
                  <ProductCardView key={item.id} product={item} />
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="surface p-3">
            <ProductVisual product={product} className="h-36" />
            <div className="px-2 pt-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                <span className="badge">{typeLabel(product.type)}</span>
                {product.level ? <span className="badge badge-muted">{typeLabel(product.level)}</span> : null}
              </div>
              <div className="mt-4">
                <PriceTag price={product.price} comparePrice={product.comparePrice} size="lg" />
              </div>
              <div className="mt-4">
                <AddToCart productId={product.id} />
              </div>
              <ul className="mt-5 grid gap-2.5 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                {perks.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {product.related.length ? (
        <Section title="محصولات مرتبط" className="mt-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {product.related.map((item) => (
              <ProductCardView key={item.id} product={item} />
            ))}
          </div>
        </Section>
      ) : null}
    </Page>
  );
}
