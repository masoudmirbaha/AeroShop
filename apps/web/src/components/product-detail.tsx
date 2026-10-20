import { BadgeCheck, BookOpen, Clock, Download, FileText, FolderOpen, Gauge, Layers, ListTree, PlayCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { Card, Page, Section, type Crumb } from "@/components/page";
import { PriceTag, ProductCardView, ProductVisual, productHref } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { DEMO_CONTENT_NOTICE } from "@/lib/catalog-demo";
import { outlineOf } from "@/lib/api";
import { formatMinutes, typeLabel } from "@/lib/format";
import { resolveProductDetail, type ProductDetailData } from "@/lib/load-product";

type Detail = ProductDetailData;

const perks = [
  { icon: Download, text: "دانلود فایل‌ها از بخش دانلودهای حساب" },
  { icon: ShieldCheck, text: "لینک دانلود با مجوز اختصاصی" },
  { icon: BadgeCheck, text: "محصول دیجیتال، بدون ارسال پستی" },
];

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
        {label}
      </span>
      <span className="truncate font-medium text-foreground/90">{value}</span>
    </li>
  );
}

function facts(product: Detail): { icon: LucideIcon; label: string; value: string }[] {
  const count = (value: number, unit: string) => `${value.toLocaleString("fa-IR")} ${unit}`;
  if (product.type === "COURSE") {
    const outline = outlineOf(product);
    return [
      ...(outline ? [{ icon: ListTree, label: "فصل‌ها", value: count(outline.sections, "فصل") }, { icon: BookOpen, label: "درس‌ها", value: count(outline.lessons, "درس") }] : []),
      ...(outline?.minutes ? [{ icon: Clock, label: "مدت دوره", value: formatMinutes(outline.minutes) }] : []),
      ...(product.level ? [{ icon: Gauge, label: "سطح", value: typeLabel(product.level) }] : []),
    ];
  }
  return [
    { icon: product.type === "BUNDLE" ? Layers : FileText, label: "نوع", value: product.type === "BUNDLE" ? "بسته‌ی آموزشی" : product.type === "FREE" ? "محصول رایگان" : "آموزش تک‌موضوعی" },
    ...(product.category ? [{ icon: FolderOpen, label: "دسته‌بندی", value: product.category.name }] : []),
    ...(product.bundleItems.length ? [{ icon: Layers, label: "محتوای بسته", value: count(product.bundleItems.length, "محصول") }] : []),
    ...(product.files.length ? [{ icon: Download, label: "فایل‌ها", value: count(product.files.length, "فایل") }] : []),
    ...(product.level ? [{ icon: Gauge, label: "سطح", value: typeLabel(product.level) }] : []),
  ];
}

export async function productMetadata(slug: string): Promise<Metadata> {
  const resolved = await resolveProductDetail(slug);
  if (resolved.status !== "ok") return { title: "محصول" };
  return { title: resolved.product.title, description: resolved.product.summary };
}

export async function ProductDetail({ slug, section }: { slug: string; section: "products" | "courses" }) {
  const resolved = await resolveProductDetail(slug);
  if (resolved.status === "missing") notFound();
  if (resolved.status === "error") throw new Error(resolved.message);

  const product = resolved.product;
  const isDemo = resolved.source === "demo";
  const isCourse = product.type === "COURSE";
  if (isCourse !== (section === "courses")) permanentRedirect(productHref(product));
  const breadcrumbs: Crumb[] = [
    { label: "خانه", href: "/" },
    isCourse ? { label: "دوره‌ها", href: "/courses" } : { label: "محصولات", href: "/products" },
    ...(product.category && !isCourse ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
    { label: product.title },
  ];
  const lessonCount = product.sections.reduce((sum, item) => sum + item.lessons.length, 0);
  const details = facts(product);
  return (
    <Page title={product.title} description={product.summary} breadcrumbs={breadcrumbs}>
      {isDemo && "apiError" in resolved && resolved.apiError ? (
        <ApiErrorNotice message="ارتباط با سرور برقرار نشد؛ نسخه نمایشی این صفحه نشان داده می‌شود." />
      ) : null}
      {isDemo ? <DemoNotice /> : null}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 gap-8">
          <Card className="p-6 md:p-8">
            <h2 className="text-lg font-bold">درباره این {typeLabel(product.type)}</h2>
            <p className="mt-4 leading-8 whitespace-pre-wrap text-foreground/85">{product.description}</p>
            {isDemo ? (
              <p className="mt-6 rounded-lg bg-secondary/60 px-3 py-2 text-sm text-secondary-foreground">{product.contentStatus ?? DEMO_CONTENT_NOTICE}</p>
            ) : null}
            {!isDemo && product.files.length ? (
              <p className="mt-6 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm text-secondary-foreground">
                <Download className="size-4 shrink-0" aria-hidden="true" />
                فایل‌ها بعد از خرید در بخش دانلودها قرار می‌گیرند.
              </p>
            ) : null}
          </Card>

          {product.sections.length ? (
            <Section title="سرفصل‌ها" description={`${product.sections.length.toLocaleString("fa-IR")} فصل · ${lessonCount.toLocaleString("fa-IR")} درس`}>
              <div className="surface divide-y divide-border/70 overflow-hidden">
                {product.sections.map((courseSection, index) => (
                  <div key={courseSection.id} className="p-5">
                    <h3 className="flex items-center gap-3 font-semibold">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-primary tabular-nums">
                        {(index + 1).toLocaleString("fa-IR")}
                      </span>
                      {courseSection.title}
                    </h3>
                    <ul className="mt-3 grid gap-1 ps-10">
                      {courseSection.lessons.map((lesson) => (
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
          <div className="surface overflow-hidden p-0">
            <ProductVisual product={product} className="aspect-[16/10]" sizes="(min-width: 1024px) 360px, 100vw" />
            <div className="px-5 pt-4 pb-5">
              <div className="flex flex-wrap gap-1.5">
                <span className="badge">{isCourse ? "دوره‌ی آموزشی" : typeLabel(product.type)}</span>
                {isDemo ? <span className="badge badge-muted">نمونه نمایشی</span> : null}
              </div>
              <div className="mt-4">
                <PriceTag price={product.price} comparePrice={product.comparePrice} size="lg" />
                {isDemo ? <p className="mt-1 text-xs text-muted-foreground">قیمت آزمایشی برای دمو</p> : null}
              </div>
              <div className="mt-4">
                {isDemo ? (
                  <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-3 text-center text-sm leading-6 text-muted-foreground">
                    خرید و افزودن به سبد برای نمونه‌های نمایشی غیرفعال است.
                  </p>
                ) : (
                  <AddToCart productId={product.id} />
                )}
              </div>
              {details.length ? (
                <ul aria-label={isCourse ? "مشخصات دوره" : "مشخصات محصول"} className="mt-5 divide-y divide-border/60 border-t border-border/70 text-sm">
                  {details.map((fact) => (
                    <Fact key={fact.label} {...fact} />
                  ))}
                </ul>
              ) : null}
              {!isDemo ? (
                <ul className="mt-5 grid gap-2.5 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  {perks.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
                      {text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {product.related.length ? (
        <Section title="مطالب مرتبط" className="mt-14">
          <ProductGrid items={product.related} />
        </Section>
      ) : null}
    </Page>
  );
}
