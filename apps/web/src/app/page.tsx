import { Activity, ArrowLeft, Atom, Boxes, Download, Flame, FolderKanban, Gauge, Orbit, Quote, Spline, Target, Thermometer, Wind } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaqList } from "@/components/faq-list";
import { FlipCards } from "@/components/home/flip-cards";
import { HomeHero } from "@/components/home/hero";
import { Card, IconTile, Section } from "@/components/page";
import { ProductGrid } from "@/components/product-grid";
import { serviceIcon } from "@/components/service-icon";
import { LatestPosts } from "@/components/home/latest-posts";
import { api, type ProductList } from "@/lib/api";
import { latestPosts, type PageItem } from "@/lib/posts";

type Category = { id: string; name: string; slug: string; description: string | null };
type Topic = { id: string; name: string; slug: string; description: string | null };
type Service = { id: string; title: string; slug: string; summary: string };
type Testimonial = { id: string; authorName: string; authorTitle: string | null; body: string };
type Faq = { id: string; question: string; answer: string };
const reasons = [
  { icon: Target, title: "آموزش مسئله‌محور", text: "مثال‌ها روی مسئله مهندسی بسته شده‌اند، نه فقط معرفی منو." },
  { icon: Download, title: "دسترسی امن به فایل‌ها", text: "بعد از خرید، فایل از حساب شما و با مجوز دانلود باز می‌شود." },
  { icon: FolderKanban, title: "پیگیری شفاف پروژه", text: "درخواست پروژه و مشاوره وضعیت مشخص دارد و در حساب پیگیری می‌شود." },
];

const topicIcons = [Wind, Thermometer, Flame, Boxes, Atom, Gauge, Orbit, Activity, Spline];

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
  const [products, courseList, categories, topics, services, testimonials, faq, pages] = await Promise.all([
    api<ProductList>("/products?pageSize=12"),
    api<ProductList>("/products?type=COURSE&pageSize=3"),
    api<Category[]>("/categories"),
    api<Topic[]>("/topics"),
    api<Service[]>("/services"),
    api<Testimonial[]>("/testimonials"),
    api<Faq[]>("/faq"),
    api<PageItem[]>("/pages"),
  ]);
  const catalog = products.items.filter((item) => item.type !== "COURSE");
  const featured = [...catalog.filter((item) => item.isFeatured), ...catalog.filter((item) => !item.isFeatured)].slice(0, 3);
  const courses = courseList.items;
  const posts = latestPosts(pages, 3);

  return (
    <main className="flex-1">
      <HomeHero />

      <Band lead>
        <Section title="خدمات اصلی AeroShop" description="از یادگیری تا اجرای پروژه؛ مسیر مناسب خود را انتخاب کنید.">
          <FlipCards />
        </Section>
      </Band>

      <Band tinted>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">چرا AeroShop</h2>
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
            <ProductGrid items={courses} className="gap-6" />
          </Section>
        </Band>
      ) : null}

      <Band tinted>
        <Section title="خدمات مهندسی" description="از مشاوره تا انجام کامل پروژه" action={<MoreLink href="/services">همه خدمات</MoreLink>}>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="surface card-glow group relative flex gap-4 overflow-hidden p-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span aria-hidden="true" className="accent-line absolute inset-y-0 start-0 w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <IconTile icon={serviceIcon(service.slug)} className="size-12" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold transition-colors group-hover:text-primary">{service.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{service.summary}</p>
                </div>
                <ArrowLeft aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,translate] duration-200 group-hover:-translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </Section>
      </Band>

      <Band>
        <Section title="حوزه‌های شبیه‌سازی" description="موضوع‌های مهندسی که آموزش و خدمات حول آن‌ها ساخته شده‌اند">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topics.map((topic, index) => {
              const Icon = topicIcons[index % topicIcons.length];
              return (
                <Link
                  key={topic.id}
                  href={`/products?topic=${topic.slug}`}
                  className="surface group flex items-center gap-3 p-4 transition-colors duration-200 outline-none hover:border-primary/25 hover:bg-secondary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icon className="size-4.5 shrink-0 text-primary/80" aria-hidden="true" />
                  <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-primary">{topic.name}</span>
                </Link>
              );
            })}
          </div>
          {categories.length ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="me-1 text-xs font-medium text-muted-foreground">دسته‌ها:</span>
              {categories.map((item) => (
                <Link key={item.id} href={`/categories/${item.slug}`} className="chip">
                  {item.name}
                </Link>
              ))}
            </div>
          ) : null}
        </Section>
      </Band>

      <Band tinted>
        <Section title="محصولات ویژه" description="منتخبی از آموزش‌ها و بسته‌های پرطرفدار" action={<MoreLink href="/products">همه محصولات</MoreLink>}>
          <ProductGrid items={featured} className="gap-6" />
        </Section>
      </Band>

      <Band>
        <LatestPosts posts={posts} />
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
