import { ArrowLeft, Download, FolderKanban, Quote, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaqList } from "@/components/faq-list";
import { EngineeringServices } from "@/components/home/engineering-services";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FlipCards } from "@/components/home/flip-cards";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeHero } from "@/components/home/hero";
import { LatestPosts } from "@/components/home/latest-posts";
import { SimulationTopics } from "@/components/home/simulation-topics";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { Card, IconTile, Section } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import type { ProductList } from "@/lib/api";
import { demoCategoryList, featuredDemoCourses } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { latestPosts, type PageItem } from "@/lib/posts";
import { tryApi } from "@/lib/try-api";

type Category = { id: string; name: string; slug: string; description: string | null };
type Topic = { id: string; name: string; slug: string; description: string | null };
type Testimonial = { id: string; authorName: string; authorTitle: string | null; body: string };
type Faq = { id: string; question: string; answer: string };

const reasons = [
  { icon: Target, title: "آموزش مسئله‌محور", text: "مثال‌ها روی مسئله مهندسی بسته شده‌اند، نه فقط معرفی منو." },
  { icon: Download, title: "دسترسی امن به فایل‌ها", text: "بعد از خرید، فایل از حساب شما و با مجوز دانلود باز می‌شود." },
  { icon: FolderKanban, title: "پیگیری شفاف پروژه", text: "درخواست پروژه و مشاوره وضعیت مشخص دارد و در حساب پیگیری می‌شود." },
];

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="btn btn-ghost btn-sm group/more">
      {children}
      <ArrowLeft aria-hidden="true" className="transition-transform duration-200 group-hover/more:-translate-x-0.5" />
    </Link>
  );
}

function Band({ children, tinted, lead }: { children: ReactNode; tinted?: boolean; lead?: boolean }) {
  return (
    <div className={tinted ? "section-band below-fold" : lead ? "section-lead" : "below-fold"}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">{children}</div>
    </div>
  );
}

export default async function Home() {
  const [productsLoad, courseLoad, categoriesLoad, topicsLoad, testimonialsLoad, faqLoad, pagesLoad] = await Promise.all([
    tryApi<ProductList>("/products?pageSize=12"),
    tryApi<ProductList>("/products?type=COURSE&pageSize=3"),
    tryApi<Category[]>("/categories"),
    tryApi<Topic[]>("/topics"),
    tryApi<Testimonial[]>("/testimonials"),
    tryApi<Faq[]>("/faq"),
    tryApi<PageItem[]>("/pages"),
  ]);

  const products = productsLoad.status === "ok" ? productsLoad.data : null;
  const catalog = products ? products.items.filter((item) => item.type !== "COURSE") : [];
  const featured = [...catalog.filter((item) => item.isFeatured), ...catalog.filter((item) => !item.isFeatured)].slice(0, 6);

  const demoEnabled = demoCatalogEnabled();
  const apiCourses = courseLoad.status === "ok" ? courseLoad.data.items : null;
  const courses = apiCourses?.length ? apiCourses : demoEnabled ? featuredDemoCourses(3) : [];
  const coursesUsingDemo = Boolean(demoEnabled && courses.length && !apiCourses?.length);
  const coursesApiFailed = courseLoad.status === "error" && coursesUsingDemo;
  const coursesEmptyOk = courseLoad.status === "ok" && !apiCourses?.length && coursesUsingDemo;

  const apiCategories = categoriesLoad.status === "ok" ? categoriesLoad.data : null;
  const categories = apiCategories?.length ? apiCategories : demoEnabled ? demoCategoryList : [];
  const categoriesUsingDemo = Boolean(demoEnabled && categories.length && !apiCategories?.length);
  const categoriesApiFailed = categoriesLoad.status === "error" && categoriesUsingDemo;
  const categoriesEmptyOk = categoriesLoad.status === "ok" && !apiCategories?.length && categoriesUsingDemo;

  const topics = topicsLoad.status === "ok" ? topicsLoad.data : [];
  const testimonials = testimonialsLoad.status === "ok" ? testimonialsLoad.data : [];
  const faq = faqLoad.status === "ok" ? faqLoad.data : [];
  const posts = pagesLoad.status === "ok" ? latestPosts(pagesLoad.data, 6) : [];

  return (
    <main className="flex-1">
      <HeroCarousel />
      <HomeHero />

      <Band lead>
        <Section title="خدمات اصلی NtoPiran" description="از یادگیری تا اجرای پروژه؛ مسیر مناسب خود را انتخاب کنید.">
          <FlipCards />
        </Section>
      </Band>

      <Band tinted>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">چرا NtoPiran</h2>
            <p className="mt-4 max-w-md leading-8 text-muted-foreground">
              تمرکز ما روی شبیه‌سازی جریان و انتقال حرارت است؛ آموزش و خدمات را طوری ساخته‌ایم که از مسئله واقعی شروع شوند و به نتیجه قابل استفاده برسند.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-outline">
                درباره ما
              </Link>
              <Link href="/services" className="btn btn-ghost">
                همه خدمات
                <ArrowLeft aria-hidden="true" />
              </Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {reasons.map(({ icon, title, text }) => (
              <li key={title} className="surface p-5 lg:flex lg:items-start lg:gap-4">
                <IconTile icon={icon} />
                <div>
                  <p className="mt-4 font-semibold lg:mt-0">{title}</p>
                  <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      {courses.length ? (
        <Band>
          <Section title="دوره‌های آموزشی" description="مسیرهای آموزشی کامل با سرفصل و پروژه" action={<MoreLink href="/courses">همه دوره‌ها</MoreLink>}>
            {coursesApiFailed ? (
              <ApiErrorNotice message="بارگذاری دوره‌ها از سرور انجام نشد؛ نمونه‌های نمایشی Development نشان داده می‌شوند و خرید واقعی نیستند." />
            ) : null}
            {coursesEmptyOk ? <DemoNotice message="هنوز دوره‌ای از API برنگشته؛ نمونه‌های نمایشی برای دمو نشان داده می‌شوند." /> : null}
            <ProductGrid items={courses} className="gap-6" />
          </Section>
        </Band>
      ) : null}

      <Band tinted>
        <Section title="خدمات مهندسی" description="از مشاوره تا انجام کامل پروژه" action={<MoreLink href="/services">همه خدمات</MoreLink>}>
          <EngineeringServices />
        </Section>
      </Band>

      <Band>
        <Section title="حوزه‌های شبیه‌سازی" description="موضوع‌های مهندسی که آموزش و خدمات حول آن‌ها ساخته شده‌اند">
          {topicsLoad.status === "error" ? (
            <div className="grid gap-4">
              <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                بارگذاری حوزه‌های شبیه‌سازی انجام نشد.
              </p>
              {process.env.NODE_ENV === "development" ? <SimulationTopics topics={[]} /> : null}
            </div>
          ) : (
            <SimulationTopics topics={topics} />
          )}
          {categories.length ? (
            <div className="mt-6 grid gap-3">
              {categoriesApiFailed ? (
                <ApiErrorNotice message="بارگذاری دسته‌ها از سرور انجام نشد؛ برچسب‌های نمایشی نشان داده می‌شوند." />
              ) : null}
              {categoriesEmptyOk ? <DemoNotice message="دسته‌ای از API برنگشته؛ برچسب‌های نمایشی برای دمو نشان داده می‌شوند." /> : null}
              <div className="flex flex-wrap items-center gap-2">
                <span className="me-1 text-xs font-medium text-muted-foreground">دسته‌ها:</span>
                {categories.map((item) => (
                  <Link key={item.id} href={`/categories/${item.slug}`} className="chip">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </Section>
      </Band>

      <Band tinted>
        <Section title="محصولات ویژه" description="منتخبی از آموزش‌ها و بسته‌های پرطرفدار" action={<MoreLink href="/products">همه محصولات</MoreLink>}>
          <FeaturedProducts products={productsLoad.status === "ok" ? featured : null} error={productsLoad.status === "error" ? productsLoad.message : undefined} />
        </Section>
      </Band>

      <Band>
        <LatestPosts posts={posts} error={pagesLoad.status === "error" ? pagesLoad.message : undefined} />
      </Band>

      <div className="below-fold mx-auto grid w-full max-w-6xl gap-16 px-4 pb-16 md:gap-20 md:pb-20">
        {testimonials.length ? (
          <Section title="نظر مهندسان">
            <div className={`grid gap-5 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
              {testimonials.map((item) => (
                <Card key={item.id} className="p-6">
                  <blockquote>
                    <Quote className="size-6 text-primary/25" aria-hidden="true" />
                    <p className="mt-3 leading-8 text-foreground/85">{item.body}</p>
                    <footer className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4 text-sm">
                      <span aria-hidden="true" className="avatar-fill grid size-9 place-items-center rounded-full text-xs font-bold">
                        {item.authorName.trim().charAt(0)}
                      </span>
                      <span>
                        <span className="block font-semibold">{item.authorName}</span>
                        {item.authorTitle ? <span className="block text-xs text-muted-foreground">{item.authorTitle}</span> : null}
                      </span>
                    </footer>
                  </blockquote>
                </Card>
              ))}
            </div>
          </Section>
        ) : null}

        {faq.length ? (
          <Section title="پرسش‌های کوتاه" action={<MoreLink href="/faq">همه پرسش‌ها</MoreLink>}>
            <FaqList items={faq.slice(0, 3)} />
          </Section>
        ) : null}

        <section className="relative isolate overflow-hidden rounded-2xl border border-border/70 bg-band p-8 md:p-12">
          <div aria-hidden="true" className="tech-grid absolute inset-0 -z-10 mask-[linear-gradient(to_right,black,transparent_70%)]" />
          <div aria-hidden="true" className="accent-line absolute inset-y-8 start-0 w-1 rounded-e-full" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight">پروژه CFD دارید؟</h2>
              <p className="mt-2 leading-7 text-muted-foreground">درخواست را ثبت کنید تا وضعیت آن از حساب شما قابل دیدن باشد.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-project" className="btn btn-primary btn-lg">
                ثبت درخواست پروژه
                <ArrowLeft aria-hidden="true" />
              </Link>
              <Link href="/consultation" className="btn btn-outline btn-lg">
                مشاوره رایگان
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
