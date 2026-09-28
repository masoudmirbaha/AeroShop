import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCardView } from "@/components/product-card";
import { api, type ProductCard } from "@/lib/api";
import { formatPrice, typeLabel } from "@/lib/format";

type Detail = ProductCard & {
  description: string;
  files: { id: string; filename: string }[];
  sections: { id: string; title: string; lessons: { id: string; title: string; durationMinutes: number | null }[] }[];
  bundleItems: ProductCard[];
  related: ProductCard[];
};

export async function ProductDetail({ slug }: { slug: string }) {
  const product = await api<Detail>(`/products/${slug}`);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        {product.category ? <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link> : null}
        {product.topic ? ` · ${product.topic.name}` : ""}
      </p>
      <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>
      <div className="mt-3 flex gap-2 text-xs">
        <span className="rounded bg-muted px-2 py-0.5">{typeLabel(product.type)}</span>
        {product.level ? <span className="rounded bg-muted px-2 py-0.5">{typeLabel(product.level)}</span> : null}
      </div>
      <p className="mt-4 text-lg">{product.summary}</p>
      <p className="mt-2 text-xl font-semibold">{formatPrice(product.price)}</p>
      <div className="mt-6">
        <AddToCart productId={product.id} />
      </div>
      <p className="mt-8 leading-8 whitespace-pre-wrap">{product.description}</p>
      {product.files.length ? (
        <p className="mt-4 text-sm text-muted-foreground">فایل‌ها بعد از خرید در بخش دانلودها قرار می‌گیرند.</p>
      ) : null}
      {product.sections.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">سرفصل‌ها</h2>
          {product.sections.map((section) => (
            <div key={section.id} className="mt-3">
              <h3 className="font-medium">{section.title}</h3>
              <ul className="mt-1 text-sm text-muted-foreground">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>{lesson.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
      {product.bundleItems.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">محتوای بسته</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.bundleItems.map((item) => (
              <ProductCardView key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      {product.related.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">محصولات مرتبط</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.related.map((item) => (
              <ProductCardView key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
