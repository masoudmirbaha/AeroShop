import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { ProductGrid } from "@/components/product-grid";
import { featuredDemoProducts } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import type { ProductCard } from "@/lib/api";
import { FEATURED_DEMO_THRESHOLD, FEATURED_TARGET_COUNT } from "@/lib/home-demo";

function mergeFeatured(list: ProductCard[]): { real: ProductCard[]; demos: ProductCard[] } {
  if (list.length >= FEATURED_DEMO_THRESHOLD) {
    return { real: list.slice(0, FEATURED_TARGET_COUNT), demos: [] };
  }
  if (list.length === 0) {
    return { real: [], demos: featuredDemoProducts(FEATURED_TARGET_COUNT) };
  }
  const need = Math.max(0, FEATURED_TARGET_COUNT - list.length);
  return { real: list, demos: featuredDemoProducts(need) };
}

export async function FeaturedProducts({ products, error }: { products: ProductCard[] | null; error?: string }) {
  if (error) {
    const demos = demoCatalogEnabled() ? featuredDemoProducts(FEATURED_TARGET_COUNT) : [];
    return (
      <div className="grid gap-6">
        <ApiErrorNotice message="بارگذاری محصولات ویژه انجام نشد. لطفاً بعداً دوباره تلاش کنید." />
        {demos.length ? (
          <>
            <DemoNotice />
            <ProductGrid items={demos} className="gap-6" />
          </>
        ) : null}
      </div>
    );
  }

  const list = products ?? [];
  const { real, demos } = mergeFeatured(list);

  return (
    <div className="grid gap-6">
      {demos.length && !real.length ? <DemoNotice /> : null}
      {real.length ? <ProductGrid items={real} className="gap-6" /> : null}
      {demos.length ? (
        <>
          {real.length ? <DemoNotice message="برای تکمیل چیدمان، چند کارت نمونه نمایشی اضافه شده است." /> : null}
          <ProductGrid items={demos} className="gap-6" />
        </>
      ) : null}
    </div>
  );
}
