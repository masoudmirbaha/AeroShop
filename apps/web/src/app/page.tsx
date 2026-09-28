import Link from "next/link";
import { ProductCardView } from "@/components/product-card";
import { api, type ProductCard, type ProductList } from "@/lib/api";

type Category = { id: string; name: string; slug: string; description: string | null };
type Topic = { id: string; name: string; slug: string; description: string | null };
type Service = { id: string; title: string; slug: string; summary: string };
type Testimonial = { id: string; authorName: string; authorTitle: string | null; body: string };
type Faq = { id: string; question: string; answer: string };

export default async function Home() {
  const [products, categories, topics, services, testimonials, faq] = await Promise.all([
    api<ProductList>("/products?pageSize=6"),
    api<Category[]>("/categories"),
    api<Topic[]>("/topics"),
    api<Service[]>("/services"),
    api<Testimonial[]>("/testimonials"),
    api<Faq[]>("/faq"),
  ]);
  const featured = products.items.filter((item) => item.isFeatured);
  const courses = products.items.filter((item) => item.type === "COURSE");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12">
      <section className="grid gap-6 rounded-2xl bg-muted p-8 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">آموزش و خدمات CFD</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">شبیه‌سازی جریان را با مثال مهندسی یاد بگیرید</h1>
          <p className="mt-4 text-muted-foreground">
            AeroShop محصولات آموزشی دیجیتال و خدمات مهندسی برای انسیس فلوئنت می‌فروشد: از انتقال حرارت تا آکوستیک، بدون ارسال پستی.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/products" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              مشاهده محصولات
            </Link>
            <Link href="/consultation" className="rounded-md border px-4 py-2">
              مشاوره رایگان
            </Link>
          </div>
        </div>
        <div className="grid content-center gap-3 text-sm">
          <p>فایل، ویدئو و پیگیری سفارش در حساب کاربری.</p>
          <p>پرداخت این نسخه آزمایشی است و درگاه بانکی واقعی ندارد.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">محصولات ویژه</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(featured.length ? featured : products.items).slice(0, 3).map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">دسته‌ها</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {categories.map((item) => (
            <Link key={item.id} href={`/categories/${item.slug}`} className="rounded-xl border p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">موضوع‌های مهندسی</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/products?topic=${topic.slug}`} className="rounded-full border px-3 py-1 text-sm">
              {topic.name}
            </Link>
          ))}
        </div>
      </section>

      {courses.length ? (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">دوره‌ها</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {courses.map((product: ProductCard) => (
              <ProductCardView key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-2xl font-semibold">خدمات</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.slug}`} className="rounded-xl border p-4">
              <h3 className="font-medium">{service.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{service.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">چرا AeroShop</h2>
        <ul className="grid gap-3 md:grid-cols-3 text-sm">
          <li className="rounded-xl border p-4">مثال‌ها روی مسئله مهندسی بسته شده‌اند، نه فقط معرفی منو.</li>
          <li className="rounded-xl border p-4">بعد از خرید، فایل از حساب شما و با مجوز دانلود باز می‌شود.</li>
          <li className="rounded-xl border p-4">درخواست پروژه و مشاوره وضعیت مشخص دارد و در حساب پیگیری می‌شود.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">نظر مهندسان</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.id} className="rounded-xl border p-4">
              <p>{item.body}</p>
              <footer className="mt-3 text-sm text-muted-foreground">
                {item.authorName}
                {item.authorTitle ? `، ${item.authorTitle}` : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">پرسش‌های کوتاه</h2>
        {faq.slice(0, 2).map((item) => (
          <div key={item.id} className="border-b py-3">
            <h3 className="font-medium">{item.question}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
        <Link href="/faq" className="mt-4 inline-block text-sm">
          همه پرسش‌ها
        </Link>
      </section>

      <section className="rounded-2xl bg-primary p-8 text-primary-foreground">
        <h2 className="text-2xl font-semibold">پروژه CFD دارید؟</h2>
        <p className="mt-2">درخواست را ثبت کنید تا وضعیت آن از حساب شما قابل دیدن باشد.</p>
        <Link href="/request-project" className="mt-4 inline-block rounded-md bg-background px-4 py-2 text-foreground">
          ثبت درخواست پروژه
        </Link>
      </section>
    </main>
  );
}
