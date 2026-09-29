import { ArrowLeft, Download, FolderKanban, Layers, Quote, Target } from "lucide-react";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { HomeHero } from "@/components/home/hero";
import { Card, IconTile, Section } from "@/components/page";
import { ProductCardView } from "@/components/product-card";
import { serviceIcon } from "@/components/service-icon";
import { api, type ProductCard, type ProductList } from "@/lib/api";

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

const gridLines =
  "[background-image:linear-gradient(to_right,color-mix(in_oklch,var(--brand-cyan)_25%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-cyan)_25%,transparent)_1px,transparent_1px)]";

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="btn btn-ghost btn-sm group/more">
      {children}
      <ArrowLeft aria-hidden="true" className="transition-transform duration-200 group-hover/more:-translate-x-0.5" />
    </Link>
  );
}

export default async function Home() {
  const [products, categories, topics, services, testimonials, faq] = await Promise.all([
    api<ProductList>("/products?pageSize=6"),
    api<Category[]>("/categories"),
    api<Topic[]>("/topics"),
    api<Service[]>("/services"),
    api<Testimonial[]>("/testimonials"),
    api<Faq[]>("/faq"),
  ]);
  const featured = [...products.items.filter((item) => item.isFeatured), ...products.items.filter((item) => !item.isFeatured)].slice(0, 3);
  const courses = products.items.filter((item) => item.type === "COURSE");

  return (
    <main className="flex-1">
      <HomeHero />

      <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-16 md:gap-20 md:py-20">
        <Section eyebrow="Featured" title="محصولات ویژه" description="منتخبی از آموزش‌ها و بسته‌های پرطرفدار" action={<MoreLink href="/products">همه محصولات</MoreLink>}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCardView key={product.id} product={product} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Categories" title="دسته‌ها" description="محتوا بر اساس نوع و عمق آموزش">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                className="surface card-glow group flex flex-col p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <IconTile icon={Layers} className="size-10 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="mt-4 font-semibold transition-colors group-hover:text-primary">{item.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100">
                  مشاهده
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          {topics.length ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="me-1 text-xs font-medium text-muted-foreground">موضوع‌ها:</span>
              {topics.map((topic) => (
                <Link key={topic.id} href={`/products?topic=${topic.slug}`} className="chip">
                  {topic.name}
                </Link>
              ))}
            </div>
          ) : null}
        </Section>
      </div>

      {courses.length ? (
        <div className="section-band">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
            <Section eyebrow="Courses" title="دوره‌ها" description="مسیرهای آموزشی کامل با سرفصل و پروژه" action={<MoreLink href="/courses">همه دوره‌ها</MoreLink>}>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((product: ProductCard) => (
                  <ProductCardView key={product.id} product={product} />
                ))}
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-16 md:gap-20 md:py-20">
        <Section eyebrow="Services" title="خدمات مهندسی" description="از مشاوره تا انجام کامل پروژه" action={<MoreLink href="/services">همه خدمات</MoreLink>}>
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="surface card-glow group relative flex gap-4 overflow-hidden p-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-linear-to-b from-primary to-brand-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <IconTile icon={serviceIcon(service.slug)} className="size-12 transition-transform duration-300 group-hover:scale-105" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold transition-colors group-hover:text-primary">{service.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{service.summary}</p>
                </div>
                <ArrowLeft aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,translate] duration-200 group-hover:-translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </Section>

        <section className="surface relative overflow-hidden p-6 md:p-10">
          <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-60 mask-[linear-gradient(to_left,black,transparent_60%)]" />
          <div className="relative">
            <p className="eyebrow">Why AeroShop</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">چرا AeroShop</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {reasons.map(({ icon, title, text }) => (
                <li key={title} className="rounded-xl p-1 transition-colors">
                  <IconTile icon={icon} className="size-11" />
                  <p className="mt-4 font-semibold">{title}</p>
                  <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {testimonials.length ? (
          <Section eyebrow="Testimonials" title="نظر مهندسان">
            <div className={`grid gap-5 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
              {testimonials.map((item) => (
                <Card key={item.id} className="card-glow p-6">
                  <blockquote>
                    <Quote className="size-6 text-primary/30" aria-hidden="true" />
                    <p className="mt-3 leading-8 text-foreground/85">{item.body}</p>
                    <footer className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4 text-sm">
                      <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-linear-to-br from-primary to-brand-cyan text-xs font-bold text-white">
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
          <Section eyebrow="FAQ" title="پرسش‌های کوتاه" action={<MoreLink href="/faq">همه پرسش‌ها</MoreLink>}>
            <FaqList items={faq.slice(0, 3)} />
          </Section>
        ) : null}

        <section className="relative isolate overflow-hidden rounded-2xl bg-navy p-8 text-navy-foreground shadow-xl shadow-navy/20 md:p-12">
          <div aria-hidden="true" className={`absolute inset-0 -z-10 opacity-30 ${gridLines} [background-size:32px_32px] mask-[linear-gradient(to_right,black,transparent_70%)]`} />
          <div aria-hidden="true" className="animate-glow absolute -top-24 -start-16 -z-10 size-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-white">پروژه CFD دارید؟</h2>
              <p className="mt-2 leading-7 text-navy-foreground/75">درخواست را ثبت کنید تا وضعیت آن از حساب شما قابل دیدن باشد.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/request-project" className="btn btn-lg bg-white text-navy hover:bg-secondary">
                ثبت درخواست پروژه
                <ArrowLeft aria-hidden="true" />
              </Link>
              <Link href="/consultation" className="btn btn-lg border-white/20 bg-white/5 text-white hover:bg-white/10">
                مشاوره رایگان
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
